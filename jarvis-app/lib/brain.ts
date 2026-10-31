// THE BRAIN — Claude first, Grok second, and an honest refusal third.
//
// Rebuilt 2026-10-31 against the CURRENT provider APIs, not against memory.
//
//   Anthropic, 2026-10-21 API version (the latest, ten days old at the time of writing):
//     · `temperature`, `top_p`, `top_k` are REMOVED. Sending any of them is a 400 on every model.
//     · `anthropic-version: 2026-10-21` is the current header; 2023-06-01 is the previous one.
//     · `output_config.effort` (low|medium|high|xhigh|max) controls spend, not randomness.
//     · `output_config.format: {type:"json_schema", schema}` gives structured output with no beta
//       header — which removes the prose-scraping that n8n was doing to recover JSON.
//     · Claude 5 models think by default, thinking counts against `max_tokens`, and Sonnet 5.5
//       returns 400 for `thinking: {type:"disabled"}`. So `thinking` is never sent.
//     · `stop_reason` can be `refusal` or `max_tokens`; both can arrive with no usable text.
//
//   xAI: `grok-4.7` is the flagship (500k ctx, $2/$6 per MTok), OpenAI-compatible at
//     https://api.x.ai/v1, and supports `response_format` json_schema.
//
// Model choice for THIS operation, not in general:
//   · script / rank / reframe / chat → claude-sonnet-5-5  ($2/$10 — "best combination of speed
//     and intelligence"; 1M context; good enough to write a 60-second script)
//   · classify / extract / route     → claude-haiku-5-5   (Anthropic names these exact tasks;
//     ~20x cheaper, and the free tier runs 20 times per 5 hours)
//   · deep / strategy                → claude-opus-5-5    (opt-in, $4/$20, monthly planning only)
//   · frontier (fable 5.1, $10/$50)  → never by default. Listed so the cost model can name it.
//
// Why this file exists at all: until 2026-10-31 `lib/jarvis.ts` called `claude-3-5-sonnet-20241022`,
// retired 2025-10-28. Every request 404'd, the catch swallowed it, and a canned paragraph came back
// with HTTP 200. A dead brain and a live one were indistinguishable. That is the defect this file
// is built to make impossible.

import { isProduction } from "./security";

export const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_MODELS_URL = "https://api.anthropic.com/v1/models";
export const ANTHROPIC_VERSION = "2026-10-21";
export const GROK_URL = "https://api.x.ai/v1/chat/completions";
export const GROK_MODELS_URL = "https://api.x.ai/v1/models";

/** Non-streaming is allowed up to 21,333 output tokens; above that the API requires a stream. */
export const MAX_NON_STREAM_TOKENS = 21_000;
export const DEFAULT_MAX_TOKENS = 8_192;
export const DEFAULT_TIMEOUT_MS = 45_000;
export const MAX_HISTORY_TURNS = 12;
export const MAX_CONTENT_CHARS = 8_000;

/**
 * The current Claude line. Prices are per million tokens and are here so the cost model has one
 * place to read them from rather than a number typed into a doc.
 */
export const CLAUDE_MODELS = {
  /** $2 / $10 — the default for anything a member reads. */
  quality: "claude-sonnet-5-5",
  /** From $0.10 / $0.50 — classification, extraction, routing. */
  cheap: "claude-haiku-5-5",
  /** $4 / $20 — opt-in, for planning that a wrong answer would cost more than the call. */
  deep: "claude-opus-5-5",
  /** $10 / $50 — named, never selected by default. */
  frontier: "claude-fable-5-1",
} as const;

export const CLAUDE_PRICES: Record<string, { in: number; out: number }> = {
  "claude-sonnet-5-5": { in: 2, out: 10 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5 },
  "claude-opus-5-5": { in: 4, out: 20 },
  "claude-fable-5-1": { in: 10, out: 50 },
};

export const GROK_MODELS = {
  /** $2 / $6 — the current flagship. The fallback should not be a downgrade. */
  quality: "grok-4.7",
  /** $0.20 / $0.50 — the cheap lane, if this id is still served. Verified by /api/brain/models. */
  cheap: "grok-4-1-fast",
} as const;

export const DEFAULT_MODEL = CLAUDE_MODELS.quality;
export const DEFAULT_GROK_MODEL = GROK_MODELS.quality;

/**
 * Models Anthropic has retired. Not "old" — retired: the id 404s on every request.
 * Kept as data so the check is testable and so the next retirement is a one-line change.
 */
export const RETIRED_MODELS: { id: string; retired: string; replaced_by: string }[] = [
  { id: "claude-3-5-sonnet-20241022", retired: "2025-10-28", replaced_by: "claude-sonnet-5-5" },
  { id: "claude-3-5-sonnet-20240620", retired: "2025-10-28", replaced_by: "claude-sonnet-5-5" },
  { id: "claude-3-7-sonnet-20250219", retired: "2026-02-19", replaced_by: "claude-sonnet-5-5" },
  { id: "claude-3-5-haiku-20241022", retired: "2026-02-19", replaced_by: "claude-haiku-5-5" },
  { id: "claude-3-opus-20240229", retired: "2026-01-05", replaced_by: "claude-opus-5-5" },
  // Grok ids that predate the 4.x line; a workflow pinned to these is calling a museum.
  { id: "grok-2-latest", retired: "superseded", replaced_by: "grok-4.7" },
  { id: "grok-2-1212", retired: "superseded", replaced_by: "grok-4.7" },
];

export function isRetiredModel(id: string | undefined): boolean {
  if (!id) return false;
  return RETIRED_MODELS.some((m) => m.id === id.trim());
}

/** Which model class a request deserves. Costs differ by ~20x across these three. */
export type Lane = "cheap" | "quality" | "deep";
export type Expect = "chat" | "script" | "rank" | "reframe" | "classify" | "extract" | "route" | "deep" | string;

export function laneFor(expect: Expect | undefined): Lane {
  const e = (expect || "chat").toLowerCase();
  if (e === "classify" || e === "extract" || e === "route" || e === "label") return "cheap";
  if (e === "deep" || e === "strategy" || e === "plan") return "deep";
  return "quality";
}

/** How hard the model should think. Spend control, not randomness. */
export function effortFor(lane: Lane, expect: Expect | undefined, env: Env = process.env): "low" | "medium" | "high" | "xhigh" | "max" {
  const override = (env.ANTHROPIC_EFFORT || "").trim().toLowerCase();
  if (override === "low" || override === "medium" || override === "high" || override === "xhigh" || override === "max") return override;
  if (lane === "cheap") return "low";
  if (lane === "deep") return "high";
  const e = (expect || "chat").toLowerCase();
  // A one-word gate answer does not need the same depth as a 60-second script.
  if (e === "chat" || e === "reframe") return "medium";
  return "high";
}

type Env = Record<string, string | undefined>;

export type ModelChoice = { id: string; source: "env" | "lane" | "override_retired"; lane: Lane; note?: string };

/**
 * One resolution point per lane. A retired id in env is replaced — not passed through, and not
 * fatal, because a dead brain is worse than a defaulted one — but the substitution is reported.
 */
export function modelId(env: Env = process.env, expect?: Expect): ModelChoice {
  const lane = laneFor(expect);
  const laneDefault = lane === "cheap" ? CLAUDE_MODELS.cheap : lane === "deep" ? CLAUDE_MODELS.deep : CLAUDE_MODELS.quality;

  const configured = (env.ANTHROPIC_MODEL || "").trim();
  if (!configured) return { id: laneDefault, source: "lane", lane };
  if (isRetiredModel(configured)) {
    return {
      id: laneDefault,
      source: "override_retired",
      lane,
      note: `ANTHROPIC_MODEL=${configured} was retired by Anthropic; using ${laneDefault} for the ${lane} lane.`,
    };
  }
  // An explicit env pin wins for the quality/deep lanes. The cheap lane keeps its own model
  // unless the operator pins it, so a member's classification never costs $2/M by accident.
  if (lane === "cheap") {
    const cheapConfigured = (env.ANTHROPIC_MODEL_CHEAP || "").trim();
    if (cheapConfigured && !isRetiredModel(cheapConfigured)) return { id: cheapConfigured, source: "env", lane };
    return { id: laneDefault, source: "lane", lane };
  }
  return { id: configured, source: "env", lane };
}

export type Msg = { role: "user" | "assistant"; content: string };

/**
 * History comes from a browser. Only user/assistant survive, they must alternate, and the tail is
 * capped. A client sending `role: "system"` was previously passed straight to Anthropic — a prompt
 * injection door wide enough to rewrite Jarvis's instructions.
 */
export function sanitizeHistory(raw: unknown, maxTurns = MAX_HISTORY_TURNS): Msg[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: Msg[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as any;
    if (!item || typeof item !== "object") continue;
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
  while (cleaned.length && cleaned[0].role === "assistant") cleaned.shift();
  return cleaned.slice(-maxTurns);
}

/* ------------------------------- schemas ------------------------------- */

export type JsonSchema = Record<string, any>;

/**
 * The 2026-10-21 API rejects numeric bounds, string lengths, minItems > 1 and most `format`
 * keywords inside output_config.format — a 400, not a warning. Any schema written by hand or by
 * a UI will contain them. So every schema goes through here: the bounds move into `description`
 * (where they still steer the model) and every object is closed with additionalProperties:false.
 */
export function sanitizeSchema(schema: JsonSchema): JsonSchema {
  const BOUNDS = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minLength", "maxLength", "pattern", "uniqueItems", "default", "examples", "$schema"];
  const walk = (s: any): any => {
    if (!s || typeof s !== "object") return s;
    const out: any = {};
    const moved: string[] = [];

    for (const k of Object.keys(s)) {
      if (BOUNDS.includes(k)) { moved.push(`${k}=${JSON.stringify(s[k])}`); continue; }
      if (k === "minItems") { if (s[k] > 1) moved.push(`minItems=${s[k]}`); else out[k] = s[k]; continue; }
      if (k === "maxItems") { if (s[k] <= 1) out[k] = s[k]; else moved.push(`maxItems=${s[k]}`); continue; }
      if (k === "format") { moved.push(`format=${s[k]}`); continue; }
      out[k] = walk(s[k]);
    }

    if (out.type === "object" && out.properties) {
      out.additionalProperties = false;
      if (!Array.isArray(out.required)) out.required = Object.keys(out.properties);
    }
    if (moved.length) {
      const suffix = `(${moved.join(", ")})`;
      out.description = out.description ? `${out.description} ${suffix}` : suffix;
    }
    return out;
  };
  return walk(schema);
}

export function namedSchema(name: string, schema: JsonSchema) {
  return { name: name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64), schema: sanitizeSchema(schema) };
}

/* ------------------------------- transport ------------------------------- */

export type BrainFailure = "no_key" | "timeout" | "provider_error" | "empty_response" | "refused" | "truncated";

// `status` is the TypeScript discriminator. `ok` is the wire field the API returns. They exist
// separately because narrowing on a boolean literal failed under this repo's compiler settings.
export type BrainOk = {
  ok: true; status: "ok"; text: string; provider: "claude" | "grok";
  model: string; ms: number; parsed?: any; lane: Lane; effort?: string;
};
export type BrainErr = { ok: false; status: "error"; code: BrainFailure; detail: string; tried: string[]; model?: string };
export type BrainResult = BrainOk | BrainErr;

type AskArgs = {
  prompt: string;
  system: string;
  history?: unknown;
  expect?: Expect;
  /** When given, the provider is asked for JSON matching this schema. */
  schema?: JsonSchema;
  schemaName?: string;
  env?: Env;
  timeoutMs?: number;
  maxTokens?: number;
  fetchImpl?: typeof fetch;
};

function timeoutSignal(ms: number) {
  const c: any = (globalThis as any).AbortController ? new (globalThis as any).AbortController() : null;
  if (!c) return { signal: undefined as any, clear: () => {} };
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, clear: () => clearTimeout(t) };
}

function clampTokens(n: number | undefined, fallback: number): number {
  const v = Number.isFinite(n as number) ? (n as number) : fallback;
  return Math.max(256, Math.min(Math.floor(v), MAX_NON_STREAM_TOKENS));
}

/** Claude. No sampling params (removed from the API). Bounded. Returns a typed failure, never a sentence. */
export async function askClaude(args: AskArgs): Promise<BrainResult> {
  const env = args.env || process.env;
  const key = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY;
  if (!key) return { ok: false, status: "error", code: "no_key", detail: "ANTHROPIC_API_KEY / CLAUDE_API_KEY is not set", tried: ["claude"] };

  const choice = modelId(env, args.expect);
  const effort = effortFor(choice.lane, args.expect, env);
  const doFetch = args.fetchImpl || fetch;
  const { signal, clear } = timeoutSignal(args.timeoutMs || DEFAULT_TIMEOUT_MS);
  const started = Date.now();

  const body: any = {
    model: choice.id,
    max_tokens: clampTokens(args.maxTokens, DEFAULT_MAX_TOKENS),
    system: args.system,
    messages: [...sanitizeHistory(args.history), { role: "user", content: args.prompt.slice(0, MAX_CONTENT_CHARS) }],
    // effort controls spend. `thinking` is never sent: Claude 5 thinks by default and Sonnet 5.5
    // returns 400 for the "disabled" form, so silence is the only safe request.
    output_config: {
      effort,
      ...(args.schema ? { format: { type: "json_schema", schema: sanitizeSchema(args.schema) } } : {}),
    },
  };

  try {
    const res = await doFetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const hint =
        res.status === 400 && /temperature|top_p|top_k/i.test(text)
          ? " — sampling params were removed in API version 2026-10-21"
          : res.status === 404
            ? " — 404 usually means a retired or misspelled model id"
            : "";
      return { ok: false, status: "error", code: "provider_error", detail: `anthropic ${res.status}${hint}: ${text.slice(0, 240)}`, tried: ["claude"], model: choice.id };
    }

    const json: any = await res.json();
    const blocks: any[] = Array.isArray(json?.content) ? json.content : [];
    const text = blocks.filter((b) => b?.type === "text").map((b) => b.text).join("");
    const stop = json?.stop_reason;

    // A refusal is a decision, not a fault. Retrying it is how a system argues with a "no".
    if (stop === "refusal") {
      return { ok: false, status: "error", code: "refused", detail: "the model refused this request", tried: ["claude"], model: choice.id };
    }
    if (!text.trim()) {
      if (stop === "max_tokens") {
        return {
          ok: false,
          status: "error",
          code: "truncated",
          detail: `hit max_tokens (${body.max_tokens}) before any text — thinking counts against the cap`,
          tried: ["claude"],
          model: choice.id,
        };
      }
      return { ok: false, status: "error", code: "empty_response", detail: `anthropic returned no text blocks (stop_reason=${stop ?? "none"})`, tried: ["claude"], model: choice.id };
    }

    let parsed: any;
    if (args.schema) {
      try { parsed = JSON.parse(text); } catch { parsed = undefined; }
    }

    return { ok: true, status: "ok", text, provider: "claude", model: choice.id, ms: Date.now() - started, parsed, lane: choice.lane, effort };
  } catch (e: any) {
    const aborted = e?.name === "AbortError";
    return {
      ok: false,
      status: "error",
      code: aborted ? "timeout" : "provider_error",
      detail: aborted ? `anthropic exceeded ${args.timeoutMs || DEFAULT_TIMEOUT_MS}ms` : (e?.message || "network error").slice(0, 240),
      tried: ["claude"],
      model: choice.id,
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

  const lane = laneFor(args.expect);
  const configured = (env.GROK_MODEL || "").trim();
  const model = configured && !isRetiredModel(configured) ? configured : lane === "cheap" ? GROK_MODELS.cheap : GROK_MODELS.quality;

  const doFetch = args.fetchImpl || fetch;
  const history = sanitizeHistory(args.history).map((m) => ({ role: m.role, content: m.content }));
  const { signal, clear } = timeoutSignal(args.timeoutMs || DEFAULT_TIMEOUT_MS);
  const started = Date.now();

  const body: any = {
    model,
    temperature: 0.4,
    max_tokens: clampTokens(args.maxTokens, DEFAULT_MAX_TOKENS),
    messages: [{ role: "system", content: args.system }, ...history, { role: "user", content: args.prompt.slice(0, MAX_CONTENT_CHARS) }],
  };
  if (args.schema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: (args.schemaName || "result").replace(/[^a-zA-Z0-9_-]/g, "_"), strict: true, schema: sanitizeSchema(args.schema) },
    };
  }

  try {
    const res = await doFetch(env.XAI_BASE_URL || GROK_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: "error", code: "provider_error", detail: `xai ${res.status}: ${text.slice(0, 240)}`, tried: ["grok"], model };
    }
    const json: any = await res.json();
    const choice = json?.choices?.[0];
    const text = choice?.message?.content || "";
    if (!text.trim()) {
      const truncated = choice?.finish_reason === "length";
      return {
        ok: false,
        status: "error",
        code: truncated ? "truncated" : "empty_response",
        detail: `xai returned no content (finish_reason=${choice?.finish_reason ?? "none"})`,
        tried: ["grok"],
        model,
      };
    }
    let parsed: any;
    if (args.schema) {
      try { parsed = JSON.parse(text); } catch { parsed = undefined; }
    }
    return { ok: true, status: "ok", text, provider: "grok", model, ms: Date.now() - started, parsed, lane, effort: "n/a" };
  } catch (e: any) {
    const aborted = e?.name === "AbortError";
    return {
      ok: false,
      status: "error",
      code: aborted ? "timeout" : "provider_error",
      detail: aborted ? `xai exceeded ${args.timeoutMs || DEFAULT_TIMEOUT_MS}ms` : (e?.message || "network error").slice(0, 240),
      tried: ["grok"],
      model,
    };
  } finally {
    clear();
  }
}

/** Claude, then Grok, then the truth. */
export async function ask(args: AskArgs): Promise<BrainResult> {
  const first = await askClaude(args);
  if (first.status === "ok") return first;
  // A refusal is the model's answer. Asking the other one is a fallback, not an argument — but a
  // refusal of a legitimate business request usually means phrasing, so one second opinion is fair.
  const second = await askGrok(args);
  if (second.status === "ok") return second;
  return {
    ok: false,
    status: "error",
    code: first.code === "no_key" && second.code === "no_key" ? "no_key" : "provider_error",
    detail: `claude: ${first.detail} · grok: ${second.detail}`,
    tried: ["claude", "grok"],
    model: first.model,
  };
}

/**
 * Is a mock answer allowed here? Production: only when the operator says so out loud, with
 * ALLOW_MOCK_BRAIN=true — same rule as ALLOW_MOCK_DB. A member must never be told a canned
 * paragraph is the model thinking.
 */
export function mockAllowed(env: Env = process.env): boolean {
  return !isProduction() || env.ALLOW_MOCK_BRAIN === "true";
}

/** What the UI and the logs should say when the brain is down. Short, exact, no theatre. */
export function explain(res: BrainErr): string {
  if (res.code === "no_key") return "No model key configured (ANTHROPIC_API_KEY / GROK_API_KEY).";
  if (res.code === "timeout") return "The model did not answer in time.";
  if (res.code === "empty_response") return "The model returned nothing usable.";
  if (res.code === "refused") return "The model declined this request.";
  if (res.code === "truncated") return "The reply hit the output limit before producing text.";
  return "The model call failed.";
}

/** The cheapest possible estimate of one call, so the cost model is not guesswork. */
export function estimateCost(model: string, inTokens: number, outTokens: number): number {
  const p = CLAUDE_PRICES[model];
  if (!p) return 0;
  return (inTokens / 1_000_000) * p.in + (outTokens / 1_000_000) * p.out;
}

/* ------------------------------- catalog ------------------------------- */

export type CatalogEntry = { id: string; label?: string };
export type Catalog = { ok: boolean; provider: string; models: CatalogEntry[]; error?: string; source: "live" | "fallback" };

/**
 * Ask a provider what it actually serves right now.
 *
 * This is the answer to "use the best model currently in the marketplace" that does not rot: the
 * ids above are defaults, and this endpoint reports whether the account still sees them. Call it
 * from /api/brain/models after any provider announcement, before trusting an env pin.
 */
export async function listModels(
  provider: "claude" | "grok",
  env: Env = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<Catalog> {
  const { signal, clear } = timeoutSignal(10_000);
  try {
    if (provider === "claude") {
      const key = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY;
      if (!key) return { ok: false, provider, models: [], error: "no key", source: "fallback" };
      const res = await fetchImpl(`${ANTHROPIC_MODELS_URL}?limit=100`, {
        headers: { "x-api-key": key, "anthropic-version": ANTHROPIC_VERSION },
        signal,
      });
      if (!res.ok) return { ok: false, provider, models: [], error: `anthropic ${res.status}`, source: "fallback" };
      const json: any = await res.json();
      const models = (Array.isArray(json?.data) ? json.data : []).map((m: any) => ({ id: m.id, label: m.display_name }));
      return { ok: true, provider, models, source: "live" };
    }
    const key = env.GROK_API_KEY || env.XAI_API_KEY;
    if (!key) return { ok: false, provider, models: [], error: "no key", source: "fallback" };
    const res = await fetchImpl(GROK_MODELS_URL, { headers: { authorization: `Bearer ${key}` }, signal });
    if (!res.ok) return { ok: false, provider, models: [], error: `xai ${res.status}`, source: "fallback" };
    const json: any = await res.json();
    const models = (Array.isArray(json?.data) ? json.data : []).map((m: any) => ({ id: m.id }));
    return { ok: true, provider, models, source: "live" };
  } catch (e: any) {
    return { ok: false, provider, models: [], error: (e?.message || "network").slice(0, 120), source: "fallback" };
  } finally {
    clear();
  }
}

/** Do the ids this code would use actually exist in a live catalog? */
export function verifyChoice(catalog: Catalog, id: string): { present: boolean; note?: string } {
  if (!catalog.ok) return { present: false, note: `catalog unavailable (${catalog.error})` };
  const present = catalog.models.some((m) => m.id === id);
  return present ? { present } : { present, note: `${id} is not in the live catalog — pick another in ANTHROPIC_MODEL / GROK_MODEL` };
}
