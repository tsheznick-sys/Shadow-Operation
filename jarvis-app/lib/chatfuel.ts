// CHATFUEL — the DM leg, which the pipeline dropped when X left it.
//
// The 2026-10-31 assessment recorded WF5 as carrying a "Chatfuel Push DM (IG/TikTok only) — no
// X/YT" node. X was removed, WF5 was rebuilt as a 15-minute publisher bell, and nothing in
// `n8n/`, `lib/publish.ts` or the setup runbook mentioned Chatfuel again. The comment automation
// that answers a comment with a DM simply stopped existing, which is the quiet kind of loss: no
// test failed, because no test had ever been written about the leg.
//
// Facebook is now the surface where X was. That matters here because Chatfuel's own schema is
// Meta-first: it carries `facebookTextMessageSend`, `instagramTextMessageSend` and
// `tiktokTextMessageSend`, and nothing for YouTube or X. So the DM surfaces are exactly the three
// social surfaces — and the "IG/TikTok only" lock was a statement about what Chatfuel could reach
// while X was in the pipeline, not a decision about Facebook.
//
// THE TRAP, AND IT IS THE SAME ONE AS BUFFER'S. A Chatfuel message type returns an id, a status
// and an `errors` array *inside* a 200 response. A per-message failure is not an HTTP failure and
// not a GraphQL failure: `data.facebookTextMessageSend.id` exists, `status` says `Failed`, and
// `errors` carries the reason. Checking the transport — or even the GraphQL envelope — records a
// dropped DM as delivered. Every one of those states is handled below, in order.
//
// The endpoint and mutations below are the ones in `chatfuel-app/src/vendor/schema/schema.graphql`,
// not invented here. CF09 fails if that schema ever stops agreeing with this file.

import { strayLinks } from "./whop-links";

export const CHATFUEL_ENDPOINT = "https://panel.chatfuel.com/graphql";

export type DmSurface = "facebook" | "instagram" | "tiktok";

type DmSpec = {
  mutation: string;
  /** the field on the returned message that says whether it actually went */
  status_field: string;
  /** platform ceiling; clamped rather than truncated silently mid-emoji */
  text_max: number;
};

export const DM_SPEC: Record<DmSurface, DmSpec> = {
  facebook: { mutation: "facebookTextMessageSend", status_field: "facebookStatus", text_max: 2000 },
  instagram: { mutation: "instagramTextMessageSend", status_field: "instagramStatus", text_max: 1000 },
  tiktok: { mutation: "tiktokTextMessageSend", status_field: "tiktokStatus", text_max: 1000 },
};

/** A publish surface is not a DM surface. YouTube has no Chatfuel channel at all. */
export function dmSurfaceFor(surface: string): DmSurface | null {
  return surface === "facebook" || surface === "instagram" || surface === "tiktok" ? surface : null;
}

export function isDmSurface(s: string): s is DmSurface {
  return dmSurfaceFor(s) !== null;
}

export type ChatfuelConfig = {
  ready: boolean;
  endpoint: string;
  bot_id: string | null;
  missing: string[];
};

export function chatfuelConfig(env: NodeJS.ProcessEnv = process.env): ChatfuelConfig {
  const botId = (env.CHATFUEL_BOT_ID || "").trim();
  const token = (env.CHATFUEL_TOKEN || "").trim();
  const missing: string[] = [];
  if (!botId) missing.push("CHATFUEL_BOT_ID");
  if (!token) missing.push("CHATFUEL_TOKEN");
  return {
    ready: missing.length === 0,
    endpoint: (env.CHATFUEL_API_BASE || CHATFUEL_ENDPOINT).trim(),
    bot_id: botId || null,
    missing,
  };
}

/** Never leaves a partial emoji or a dangling word at the ceiling. */
export function clampDmText(text: string, surface: DmSurface): { text: string; truncated: boolean } {
  const max = DM_SPEC[surface].text_max;
  const clean = String(text || "").replace(/\r\n/g, "\n").trim();
  if (clean.length <= max) return { text: clean, truncated: false };
  let cut = clean.slice(0, max - 1);
  // don't split a surrogate pair
  if (/[\uD800-\uDBFF]$/.test(cut)) cut = cut.slice(0, -1);
  const space = cut.lastIndexOf(" ");
  if (space > max * 0.6) cut = cut.slice(0, space);
  return { text: `${cut.trimEnd()}…`, truncated: true };
}

/**
 * Two kinds of message, and they are not interchangeable.
 *
 *   private_reply — answers a COMMENT. Meta allows exactly ONE per comment, within 7 days of it,
 *                   and the conversation continues only if the person replies. Because it cannot
 *                   be sent twice, the link in it is the only chance to move them.
 *   reply         — answers a DM the person already sent. The window is 24 hours from their
 *                   message. Promotional content is allowed inside that window.
 *
 * A route that treats them as the same message gets the account restricted, so they are a
 * discriminated field, not a comment.
 */
export type DmKind = "private_reply" | "reply";

export const PRIVATE_REPLY_HOURS = 7 * 24;
export const REPLY_HOURS = 24;

export type DmInput = {
  surface: string;
  conversation_id: string;
  text: string;
  kind?: DmKind;
  /** required for private_reply: the comment being answered. One reply per comment, enforced upstream. */
  comment_id?: string;
  /** when the person commented or messaged. Absent means the window cannot be proven, so it is refused. */
  inbound_at?: string;
  /** idempotency key passed to Chatfuel as clientId, so a retry cannot deliver twice. */
  client_id?: string;
};

export type DmFailure =
  | "not_configured"
  | "bad_input"
  | "unsupported_surface"
  | "auth"
  | "graphql"
  | "message_failed"
  | "transport"
  | "rate_limited"
  | "window_closed"
  | "comment_required"
  | "link_not_allowed";

export type DmResult = {
  ok: boolean;
  surface: string | null;
  id: string | null;
  status: string | null;
  code: DmFailure | null;
  reason: string | null;
  /** true only when a retry could reasonably succeed */
  retryable: boolean;
  ms: number;
};

/** The token must never be able to appear in a log line or a JSON error. */
function scrub(text: string, token: string): string {
  const t = String(text || "");
  const bare = token.trim();
  const out = bare ? t.split(bare).join("[redacted]") : t;
  return out.slice(0, 300);
}


/**
 * The platform rules a message has to satisfy before it is worth sending — all of them about the
 * window, because a DM outside it is not "late", it is disallowed, and the account pays for it.
 */
export function checkWindow(
  kind: DmKind,
  inboundAt: string | undefined,
  now: Date = new Date(),
): { ok: boolean; code: "window_closed" | "comment_required" | null; reason: string | null; age_hours: number | null } {
  if (!inboundAt) {
    return { ok: false, code: "comment_required", reason: "inbound_at is required: without it the messaging window cannot be proven, and an unproven window is a policy breach", age_hours: null };
  }
  const t = new Date(inboundAt).getTime();
  if (!Number.isFinite(t)) {
    return { ok: false, code: "comment_required", reason: "inbound_at is not a date", age_hours: null };
  }
  const age = (now.getTime() - t) / 3600_000;
  // A clock in the future is a forged timestamp or a skew; either way it is not a licence to send.
  if (age < -0.25) return { ok: false, code: "window_closed", reason: `inbound_at is ${(-age).toFixed(1)}h in the future`, age_hours: age };
  const limit = kind === "private_reply" ? PRIVATE_REPLY_HOURS : REPLY_HOURS;
  if (age > limit) {
    return { ok: false, code: "window_closed", reason: `${kind} window closed: the event is ${(age / 24).toFixed(1)} days old, the limit is ${limit / 24} days`, age_hours: age };
  }
  return { ok: true, code: null, reason: null, age_hours: age };
}

export function buildDmRequest(
  input: DmInput,
  botId: string,
  surface: DmSurface,
): { query: string; variables: Record<string, unknown> } {
  const spec = DM_SPEC[surface];
  const arg = `${spec.mutation}(botID: $botID, conversationID: $conversationID, message: $message)`;
  const query = `mutation DmSend($botID: BotID!, $conversationID: ConversationID!, $message: ${surface === "facebook" ? "FacebookTextMessageSendInput" : surface === "instagram" ? "InstagramTextMessageSendInput" : "TikTokTextMessageSendInput"}!) { ${arg} { id text ${spec.status_field} errors { code originalErrCode originalErrMessage } } }`;
  const message: Record<string, unknown> = { text: input.text };
  // Chatfuel's message inputs carry clientId (ClientMID) — its dedupe key. Passing one means a
  // network retry is answered from the first send instead of posting the DM twice.
  if (input.client_id) message.clientId = input.client_id;
  return {
    query,
    variables: { botID: botId, conversationID: input.conversation_id, message },
  };
}

/**
 * Send one DM. Never throws, never reports success it did not see.
 *
 * Success means: HTTP 200, no GraphQL errors, a message object with an id, no per-message errors,
 * and a status that is not `Failed`. `Sending` counts as accepted — it is a queued delivery, and
 * treating it as a failure would re-send the same DM.
 */
export async function sendDm(
  input: DmInput,
  opts: { fetchImpl?: typeof fetch; env?: NodeJS.ProcessEnv; timeoutMs?: number } = {},
): Promise<DmResult> {
  const started = Date.now();
  const env = opts.env ?? process.env;
  const cfg = chatfuelConfig(env);
  const fail = (code: DmFailure, reason: string, retryable = false, surface: string | null = null): DmResult => ({
    ok: false, surface, id: null, status: null, code, reason: scrub(reason, (env.CHATFUEL_TOKEN || "")), retryable, ms: Date.now() - started,
  });

  const dm = dmSurfaceFor(String(input.surface || ""));
  if (!dm) return fail("unsupported_surface", `${input.surface} has no Chatfuel DM channel`, false, String(input.surface || ""));
  if (!cfg.ready) return fail("not_configured", `Chatfuel is not configured: set ${cfg.missing.join(", ")}`, false, dm);

  const conversation = String(input.conversation_id || "").trim();
  const body = clampDmText(input.text, dm);
  if (!conversation) return fail("bad_input", "conversation_id is required — a DM is sent into a conversation, not broadcast at large", false, dm);
  if (!body.text) return fail("bad_input", "text is empty", false, dm);

  // The rules come before the transport. One extra call costs a commenter their only reply.
  const kind: DmKind = input.kind === "reply" ? "reply" : "private_reply";
  if (kind === "private_reply" && !String(input.comment_id || "").trim()) {
    return fail("comment_required", "a private reply answers one comment; comment_id is what makes it exactly one", false, dm);
  }
  const win = checkWindow(kind, input.inbound_at);
  if (!win.ok) return fail(win.code as DmFailure, win.reason || "window closed", false, dm);

  const strays = strayLinks(body.text);
  if (strays.length > 0) {
    return fail("link_not_allowed", `only whop.com links may leave in a DM; refused ${strays[0].slice(0, 80)}`, false, dm);
  }

  const { query, variables } = buildDmRequest({ surface: dm, conversation_id: conversation, text: body.text, client_id: input.client_id }, cfg.bot_id!, dm);
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 12_000;

  let res: Response;
  try {
    res = await fetchImpl(cfg.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.CHATFUEL_TOKEN}` },
      body: JSON.stringify({ query, variables }),
      signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined,
    });
  } catch (e: any) {
    // A timeout or a refused socket is worth retrying; a bad token is not, and is caught below.
    return fail("transport", `request failed: ${String(e?.message || e)}`, true, dm);
  }

  if (res.status === 401 || res.status === 403) return fail("auth", `Chatfuel rejected the token (HTTP ${res.status})`, false, dm);
  if (res.status === 429) return fail("rate_limited", "Chatfuel rate limited the send", true, dm);

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    return fail("transport", `HTTP ${res.status} with a body that is not JSON`, true, dm);
  }

  if (!res.ok) return fail("transport", `HTTP ${res.status}`, res.status >= 500, dm);
  if (Array.isArray(json?.errors) && json.errors.length > 0) {
    const first = json.errors[0];
    return fail("graphql", `GraphQL error: ${first?.message || "unknown"}`, false, dm);
  }

  const msg = json?.data?.[DM_SPEC[dm].mutation];
  if (!msg || typeof msg !== "object") return fail("graphql", `no ${DM_SPEC[dm].mutation} in the response`, false, dm);

  const status = typeof msg[DM_SPEC[dm].status_field] === "string" ? msg[DM_SPEC[dm].status_field] : null;
  if (Array.isArray(msg.errors) && msg.errors.length > 0) {
    const e0 = msg.errors[0];
    return fail("message_failed", `message error ${e0?.code || "?"}: ${e0?.originalErrMessage || "no detail"}`, false, dm);
  }
  if (status === "Failed") return fail("message_failed", "Chatfuel marked the message Failed", false, dm);
  if (!msg.id) return fail("message_failed", "message has no id — not sent", false, dm);

  return {
    ok: true, surface: dm, id: String(msg.id), status,
    code: null, reason: null, retryable: false, ms: Date.now() - started,
  };
}
