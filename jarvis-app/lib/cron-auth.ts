// CRON AUTH — a schedule is not an authorisation.
//
// Both cron routes were public. Anyone who found the URL could trigger them on demand, which
// on the real versions means burning Gmail and model credits on someone else's curiosity.
// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; nothing else should be able to call it.
//
// 2026-10-31 addendum: n8n Cloud is also a machine caller, and it has the same problem one level
// up — it cannot hold a session cookie, so it could not reach /api/jarvis at all and the "n8n +
// Claude brain" architecture had no working link between the two halves. bearered() below is the
// single rule both machine callers use: a named token, compared in constant time, refused when
// unset in production.
import { NextResponse } from "next/server";
import { isProduction } from "./security";

function sameToken(given: string, expected: string): boolean {
  // Length check first (cheap reject), then a full-string compare. These are long random
  // values, not user passwords, so a timing side channel is not the threat here — a guessable
  // or absent token is.
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/**
 * The machine-caller gate. `name` is the env var holding the token.
 * Production with no token configured → 503, never open.
 */
export function bearered(req: Request, name: string): { ok: boolean; response?: NextResponse; reason?: string } {
  const secret = (process.env[name] || "").trim();
  if (!secret) {
    if (isProduction()) {
      return {
        ok: false,
        reason: `${name.toLowerCase()}_not_configured`,
        response: NextResponse.json({ ok: false, error: `${name.toLowerCase()}_not_configured` }, { status: 503 }),
      };
    }
    return { ok: true, reason: "dev_open" };
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token && sameToken(token, secret)) return { ok: true };
  return { ok: false, reason: "unauthorized", response: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
}

export function cronAllowed(req: Request): { ok: boolean; response?: NextResponse } {
  const gate = bearered(req, "CRON_SECRET");
  if (gate.ok) return { ok: true };
  return { ok: false, response: gate.response };
}
