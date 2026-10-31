// THE BRAIN — Claude first, Grok second, and an honest refusal third.
//
// Why this file exists (2026-10-31, second deep pass):
//
//   lib/jarvis.ts was calling `claude-3-5-sonnet-20241022`. Anthropic retired that model on
//   2025-10-28. Every request has been returning 404 for a year. The `catch` swallowed it, the
//   Grok fallback had no key, and the function returned a MOCK PARAGRAPH with HTTP 200. The
//   "24/7 Claude Max main brain" in the admin page has been a canned string, and nothing in the
//   system — not the tests, not the UI, not the logs — said so.
//
//   That is not a model-name typo. It is the same defect as the tier bug one layer up: a failure
//   path that is indistinguishable from success. So the fix has three parts, not one:
//     1. the model id is resolved in ONE place, and a retired id is refused loudly;
//     2. the call has a timeout, so a slow provider falls through instead of hanging the route;
//     3. when nothing answers, the caller gets `ok: false` — never text that looks like an answer.
//
//   Also dropped: `temperature`. Claude 4.7 and later reject a non-default temperature with a
//   400, so swapping the model name alone would have traded a 404 for a 400.

import { isProduction } from "./security";

export const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_VERSION = "2023-06-01";
export const GROK_URL = "https://api.x.ai/v1/chat/completions";

/** The model used when ANTHROPIC_MODEL is unset. Overridable so a deprecation is an env change. */
export const DEFAULT_MODEL = "claude-sonnet-5-5";

export const DEFAULT_TIMEOUT_MS = 20_000;
export const MAX_HISTORY_TURNS = 12;
export const MAX_CONTENT_CHARS = 8_000;

/**
 * Models Anthropic has retired. Not "old" — retired: the id 404s on every request.
 * Kept as data so the check is testable and so the next retirement is a one-line change.
 */
export const RETIRED_MODELS: { id: string; retired: string; replaced_by: string }[] = [
  { id: "claude-3-5-sonnet-20241022", retired: "2025-10-28", replaced_by: "claude-sonnet-5-5" },
  { id: "claude-3-5-sonnet-20240620", retired: "2025-10-28", replaced_by: "claude-sonnet-5-5" },
  { id: "claude-3-7-sonnet-20250219", retired: "2026-02-19", replaced_by: "claude-sonnet-5-5" },
  { id: "claude-3-5-haiku-20241022", retired: "2026-02-19", replaced_by: "claude-sonnet-5-5" },
  { id: "claude-3-opus-20240229", retired: "2026-01-05", replaced_by: "claude-sonnet-5-5" },
];

export function isRetiredModel(id: string | undefined): boolean {
  if (!id) return false;
  return RETIRED_MODELS.some((m) => m.id === id.trim());
}

export type ModelChoice = { id: string; source: "env" | "default" | "override_retired"; note?: string };

/**
 * One resolution point. A retired id in env is replaced — not passed through, and not fatal,
 * because a dead brain is worse than a defaulted one — but the substitution is reported.
 */
export function modelId(env: Record<string, string | undefined> = process.env): ModelChoice {
  const configured = (env.ANTHROPIC_MODEL || "").trim();
  if (!configured) return { id: DEFAULT_MODEL, source: "default" };
  if (isRetiredModel(configured)) {
    return {
      id: DEFAULT_MODEL,
      source: "override_retired",
      note: `ANTHROPIC_MODEL=${configured} was retired by Anthropic; using ${DEFAULT_MODEL}. Update the env var.`,
    };
  }
  return { id: configured, source: "env" };
}

export type Msg = { role: "user" | "assistant"; content: string };

/**
 * History comes from a browser. Before this, `history.map(h => ({role: h.role, content: h.content}))`
 * passed the client's role strings straight to Anthropic: a caller could inject `role: "system"`
 * and rewrite Jarvis's instructions, or alternate roles illegally and get a 400 that looked like
 * an outage. Only user/assistant survive, they must alternate, and the tail is capped.
 */
export function sanitizeHistory(raw: unknown, maxTurns = MAX_HISTORY_TURNS): Msg[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: Msg[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as any;
    if (!item || typeof item !== "object") continue;
    // Accept the app's own shape ({role:"jarvis"|"you", text}) and the API shape.
    let role = typeof item.role === "string" ? item.role.trim().toLowerCase() : "";
    if (role === "jarvis" || role === "assistant") role = "assistant";
    else if (role === "you" || role === "user") role = "user";
    else continue; // system, tool, and anything invented are dropped, not coerced
    const content = typeof item.content === "string" ? item.content : typeof item.text === "string" ? item.text : "";
    if (!content.trim()) continue;
    const clipped = content.slice(0, MAX_CONTENT_CHARS);
    const prev = cleaned.length ? cleaned[cleaned.length - 1] : null;
    if (prev && prev.role === role) {
      prev.content = `${prev.content}\n\n${clipped}`.slice(-MAX_CONTENT_CHARS);
      continue;
    }
    cleaned.push({ role: role as Msg["role"], content: clipped });
  }
  // Anthropic requires the first message to be from the user.
  while (cleaned.length && cleaned[0].role === "assistant") cleaned.shift();
  return cleaned.slice(-maxTurns);
}

export type BrainFailure = "no_key" | "timeout" | "provider_error" | "empty_response";

// `status` is the TypeScript discriminator. `ok` is the wire field the API returns.
// They exist separately because narrowing on a boolean literal failed under this repo's
// compiler settings (strictNullChecks off widens it), and a cast everywhere is how a type
// system stops being evidence.
export type BrainOk = { ok: true; status: "ok"; text: string; provider: "claude" | "grok"; model: string; ms: number };
export type BrainErr = { ok: false; status: "error"; code: BrainFailure; detail: string; tried: string[] };
export type BrainResult = BrainOk | BrainErr;

type AskArgs = {
  prompt: string;
  system: string;
  history?: unknown;
  env?: Record<string, string | undefined>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

function timeoutSignal(ms: number) {
  const c: any = (globalThis as any).AbortController ? new (globalThis as any).AbortController() : null;
  if (!c) return { signal: undefined as any, clear: () => {} };
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, clear: () => clearTimeout(t) };
}

/** Claude. No temperature. Bounded. Returns a typed failure, never a plausible sentence. */
export async function askClaude(args: AskArgs): Promise<BrainResult> {
  const env = args.env || process.env;
  const key = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY;
  if (!key) return { ok: false, status: "error", code: "no_key", detail: "ANTHROPIC_API_KEY / CLAUDE_API_KEY is not set", tried: ["claude"] };

  const choice = modelId(env);
  const doFetch = args.fetchImpl || fetch;
  const { signal, clear } = timeoutSignal(args.timeoutMs || DEFAULT_TIMEOUT_MS);
  const started = Date.now();

  try {
    const res = await doFetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: choice.id,
        max_tokens: 4096,
        system: args.system,
        messages: [...sanitizeHistory(args.history), { role: "user", content: args.prompt.slice(0, MAX_CONTENT_CHARS) }],
        // no temperature: Claude 4.7+ returns 400 for a non-default value
      }),
      signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const code: BrainFailure = res.status === 404 ? "provider_error" : res.status === 429 ? "provider_error" : "provider_error";
      const hint = res.status === 404 ? " — 404 usually means a retired or misspelled model id" : "";
      return { ok: false, status: "error", code, detail: `anthropic ${res.status}${hint}: ${body.slice(0, 240)}`, tried: ["claude"] };
    }

    const json: any = await res.json();
    const text = Array.isArray(json?.content)
      ? json.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("")
      : "";
    if (!text.trim()) return { ok: false, status: "error", code: "empty_response", detail: "anthropic returned no text blocks", tried: ["claude"] };
    return { ok: true, status: "ok", text, provider: "claude", model: choice.id, ms: Date.now() - started };
  } catch (e: any) {
    const aborted = e?.name === "AbortError";
    return {
      ok: false,
      status: "error",
      code: aborted ? "timeout" : "provider_error",
      detail: aborted ? `anthropic exceeded ${args.timeoutMs || DEFAULT_TIMEOUT_MS}ms` : (e?.message || "network error").slice(0, 240),
      tried: ["claude"],
    };
  } finally {
    clear();
  }
}

/** Grok (xAI), OpenAI-compatible. The second brain, not a placeholder for the first. */
export async function askGrok(args: AskArgs): Promise<BrainResult> {
  const env = args.env || process.env;
  const key = env.GROK_API_KEY || env.XAI_API_KEY;
  if (!key) return { ok: false, status: "error", code: "no_key", detail: "GROK_API_KEY / XAI_API_KEY is not set", tried: ["grok"] };

  const doFetch = args.fetchImpl || fetch;
  const model = env.GROK_MODEL || "grok-2-latest";
  const history = sanitizeHistory(args.history).map((m) => ({ role: m.role, content: m.content }));
  const { signal, clear } = timeoutSignal(args.timeoutMs || DEFAULT_TIMEOUT_MS);
  const started = Date.now();

  try {
    const res = await doFetch(env.XAI_BASE_URL || GROK_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [{ role: "system", content: args.system }, ...history, { role: "user", content: args.prompt.slice(0, MAX_CONTENT_CHARS) }],
      }),
      signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, status: "error", code: "provider_error", detail: `xai ${res.status}: ${body.slice(0, 240)}`, tried: ["grok"] };
    }
    const json: any = await res.json();
    const text = json?.choices?.[0]?.message?.content || "";
    if (!text.trim()) return { ok: false, status: "error", code: "empty_response", detail: "xai returned an empty message", tried: ["grok"] };
    return { ok: true, status: "ok", text, provider: "grok", model, ms: Date.now() - started };
  } catch (e: any) {
    const aborted = e?.name === "AbortError";
    return {
      ok: false,
      status: "error",
      code: aborted ? "timeout" : "provider_error",
      detail: aborted ? `xai exceeded ${args.timeoutMs || DEFAULT_TIMEOUT_MS}ms` : (e?.message || "network error").slice(0, 240),
      tried: ["grok"],
    };
  } finally {
    clear();
  }
}

/** Claude, then Grok, then the truth. */
export async function ask(args: AskArgs): Promise<BrainResult> {
  const first = await askClaude(args);
  if (first.status === "ok") return first;
  const second = await askGrok(args);
  if (second.status === "ok") return second;
  return {
    ok: false,
    status: "error",
    code: first.code === "no_key" && second.code === "no_key" ? "no_key" : "provider_error",
    detail: `claude: ${first.detail} · grok: ${second.detail}`,
    tried: ["claude", "grok"],
  };
}

/**
 * Is a mock answer allowed here? Production: only when the operator says so out loud, with
 * ALLOW_MOCK_BRAIN=true — same rule as ALLOW_MOCK_DB. A member must never be told a canned
 * paragraph is the model thinking.
 */
export function mockAllowed(env: Record<string, string | undefined> = process.env): boolean {
  return !isProduction() || env.ALLOW_MOCK_BRAIN === "true";
}

/** What the UI and the logs should say when the brain is down. Short, exact, no theatre. */
export function explain(res: BrainErr): string {
  if (res.code === "no_key") return "No model key configured (ANTHROPIC_API_KEY / GROK_API_KEY).";
  if (res.code === "timeout") return "The model did not answer in time.";
  if (res.code === "empty_response") return "The model returned nothing usable.";
  return "The model call failed.";
}
