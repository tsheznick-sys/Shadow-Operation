// CRON AUTH — a schedule is not an authorisation.
//
// Both cron routes were public. Anyone who found the URL could trigger them on demand, which
// on the real versions means burning Gmail and model credits on someone else's curiosity.
// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; nothing else should be able to call it.
import { NextResponse } from "next/server";
import { isProduction } from "./security";

export function cronAllowed(req: Request): { ok: boolean; response?: NextResponse } {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // In production an unset CRON_SECRET means the route cannot be verified, so it is refused
    // rather than left open. In dev it stays open so the schedule can be tested locally.
    if (isProduction()) {
      return { ok: false, response: NextResponse.json({ ok: false, error: "cron_secret_not_configured" }, { status: 503 }) };
    }
    return { ok: true };
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token.length === secret.length && token === secret) return { ok: true };
  return { ok: false, response: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
}
