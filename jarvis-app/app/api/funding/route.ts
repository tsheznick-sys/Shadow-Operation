import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { autopayState, computeFunding, fundingInputs } from "@/lib/funding";

export const dynamic = "force-dynamic";

async function memberCount(): Promise<{ members: number; source: string }> {
  const sql = getSql();
  if (!sql) return { members: Number(process.env.FUNDING_MEMBERS || 0), source: "env" };
  try {
    const rows: any = await sql`SELECT count(*)::int AS c FROM members WHERE plan = 'circle'`;
    return { members: rows?.[0]?.c || 0, source: "neon" };
  } catch {
    try {
      const rows: any = await sql`SELECT count(*)::int AS c FROM user_vault`;
      return { members: rows?.[0]?.c || 0, source: "neon:user_vault" };
    } catch {
      return { members: Number(process.env.FUNDING_MEMBERS || 0), source: "env" };
    }
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
  const { members, source } = await memberCount();
  const model = computeFunding(fundingInputs(members));
  const dbAuth = await dbAuthority();
  const state = autopayState();
  return NextResponse.json({
    ok: true,
    members,
    membersSource: source,
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
