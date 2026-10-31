import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { questionsFor, type Role } from "@/lib/interview";

// In-memory fallback so the interview works before DATABASE_URL exists.
const MEM: Record<string, { answers: Record<string, string>; updated_at: string }> = {};

export const dynamic = "force-dynamic";

function scoreAnswers(role: Role, answers: Record<string, string>) {
  const qs = questionsFor(role);
  const answered = qs.filter((q) => (answers[q.id] || "").trim().length >= (q.minLength || 3));
  return {
    answered: answered.length,
    total: qs.length,
    completeness: Math.round((answered.length / qs.length) * 100),
    missing: qs.filter((q) => !answered.includes(q)).map((q) => q.id),
  };
}

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });

  const role = session.role as Role;
  const sql = getSql();
  let answers: Record<string, string> = {};
  let updated_at = "";

  if (sql) {
    try {
      const rows: any = await sql`SELECT answers, updated_at FROM team_profiles WHERE email = ${session.email} LIMIT 1`;
      if (rows.length) {
        answers = rows[0].answers || {};
        updated_at = rows[0].updated_at || "";
      }
    } catch {
      // table missing — fall through to memory
    }
  }
  if (!updated_at && MEM[session.email]) {
    answers = MEM[session.email].answers;
    updated_at = MEM[session.email].updated_at;
  }

  return NextResponse.json({ ok: true, ...scoreAnswers(role, answers), answers, updated_at, mock: !sql });
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });

  let body: { answers?: Record<string, string> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const incoming = body.answers || {};
  const role = session.role as Role;
  const qs = questionsFor(role);
  const clean: Record<string, string> = {};
  for (const q of qs) {
    const v = (incoming[q.id] || "").toString().trim();
    if (v) clean[q.id] = v.slice(0, 4000);
  }

  const score = scoreAnswers(role, clean);
  const payload = { ...clean };

  const sql = getSql();
  if (sql) {
    try {
      await sql`
        INSERT INTO team_profiles (email, name, role, answers, completeness, updated_at)
        VALUES (${session.email}, ${session.name}, ${role}, ${JSON.stringify(payload)}::jsonb, ${score.completeness}, now())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          answers = EXCLUDED.answers,
          completeness = EXCLUDED.completeness,
          updated_at = now()
      `;
      return NextResponse.json({ ok: true, saved: "neon", ...score });
    } catch (err: any) {
      MEM[session.email] = { answers: payload, updated_at: new Date().toISOString() };
      return NextResponse.json({
        ok: true,
        saved: "memory",
        warning: "team_profiles table missing — run scripts/migrate.sql",
        ...score,
      });
    }
  }

  MEM[session.email] = { answers: payload, updated_at: new Date().toISOString() };
  return NextResponse.json({ ok: true, saved: "memory", mock: true, ...score });
}
