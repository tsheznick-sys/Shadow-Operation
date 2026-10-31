import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { autopayState, computeFunding, fundingInputs } from "@/lib/funding";

export const dynamic = "force-dynamic";

/**
 * How many paying members are there — the number the whole funding model divides by.
 *
 * This used to be `SELECT count(*) FROM members WHERE plan = 'circle'`. There is no `members`
 * table. It threw on every call, and the `catch` fell through to counting `user_vault` rows —
 * a different population entirely (anyone with a script vault, including free members) — and
 * reported it as `source: "neon:user_vault"`, which reads like a successful query.
 *
 * So the solvency model was dividing by a number that meant something else, and saying so in a
 * field nobody would question. Found by D02, which compares the SQL in this repo to the SQL that
 * builds it.
 */
async function memberCount(): Promise<{ members: number; source: string; exact: boolean }> {
  const sql = getSql();
  if (!sql) return { members: Number(process.env.FUNDING_MEMBERS || 0), source: "env", exact: false };
  try {
    const rows: any = await sql`SELECT count(*)::int AS c FROM agent_members WHERE tier <> 'free'`;
    return { members: rows?.[0]?.c || 0, source: "agent_members", exact: true };
  } catch (e: any) {
    // No fallback population. A number from the wrong table is worse than no number.
    return { members: Number(process.env.FUNDING_MEMBERS || 0), source: `unavailable: ${String(e?.message || e).slice(0, 80)}`, exact: false };
  }
}

async function dbAuthority(): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows: any = await sql`SELECT value FROM app_config WHERE key = 'autopay_authority' LIMIT 1`;
    return rows?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const { members, source, exact } = await memberCount();
  const model = computeFunding(fundingInputs(members));
  const dbAuth = await dbAuthority();
  const state = autopayState();
  return NextResponse.json({
    ok: true,
    members,
    membersSource: source,
    membersExact: exact,
    model,
    autopay: { ...state, granted: dbAuth ? dbAuth === "granted" : state.granted, authority: dbAuth ?? state.authority },
  });
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  if (session.role !== "owner") {
    return NextResponse.json({ ok: false, error: "owner_only" }, { status: 403 });
  }

  // Accept JSON (fetch) and form-encoded (plain <form>) — and never default to grant.
  const ctype = req.headers.get("content-type") || "";
  let body: any = {};
  if (ctype.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const fd = await req.formData().catch(() => null);
    body = fd ? { action: String(fd.get("action") || ""), amount: fd.get("amount") } : {};
  }

  const action = body.action;
  if (action !== "grant" && action !== "revoke") {
    return NextResponse.json({ ok: false, error: "action must be grant or revoke" }, { status: 400 });
  }
  const value = action === "grant" ? "granted" : "not_granted";

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({
      ok: true,
      saved: "memory",
      warning: "No DATABASE_URL — set AUTOPAY_AUTHORITY=granted in Vercel env instead.",
      authority: value,
    });
  }

  try {
    await sql`
      INSERT INTO app_config (key, value, updated_at)
      VALUES ('autopay_authority', ${value}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    await sql`
      INSERT INTO audit_log (actor, action, detail, created_at)
      VALUES (${session.email}, ${"autopay_" + action}, ${JSON.stringify({ value })}, now())
    `;
    return NextResponse.json({ ok: true, saved: "neon", authority: value });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "db_write_failed", detail: String(err?.message || err) }, { status: 500 });
  }
}
