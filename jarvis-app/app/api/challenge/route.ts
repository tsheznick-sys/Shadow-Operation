import { NextResponse } from "next/server";
import { COHORT_SIZE, DAYS, isFinisher, readCohort } from "@/lib/challenge";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/challenge — public cohort state (no emails, no personal data)
export async function GET() {
  const { members, source } = await readCohort();
  return NextResponse.json({
    ok: true,
    source,
    cohort_cap: COHORT_SIZE,
    joined: members.length,
    days: DAYS.length,
    members: members.map((m) => ({
      handle: m.handle,
      niche: m.niche,
      checked_in: m.checked_in,
      streak: m.streak,
      score: m.score,
      status: m.status,
      verdict: m.verdict,
    })),
  });
}

// POST /api/challenge — join or check in
//   { action: "join", handle, niche, email }
//   { action: "checkin", handle, day, link, note }
export async function POST(req: Request) {
  const ctype = req.headers.get("content-type") || "";
  let body: any = {};
  if (ctype.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const fd = await req.formData().catch(() => null);
    body = fd
      ? { action: String(fd.get("action") || ""), handle: String(fd.get("handle") || ""), niche: String(fd.get("niche") || ""), email: String(fd.get("email") || ""), day: fd.get("day"), link: String(fd.get("link") || ""), note: String(fd.get("note") || "") }
      : {};
  }

  const action = String(body.action || "");
  const sql = getSql();
  if (!sql) {
    return NextResponse.json(
      { ok: false, error: "no_database", detail: "DATABASE_URL is not set — the challenge needs Neon." },
      { status: 503 }
    );
  }

  const handle = String(body.handle || "").replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9._]{2,40}$/.test(handle)) {
    return NextResponse.json({ ok: false, error: "invalid_handle" }, { status: 400 });
  }

  try {
    if (action === "join") {
      const [{ count }]: any = await sql`SELECT COUNT(*)::int AS count FROM challenge_members WHERE cohort = ${currentCohort()}`;
      if (count >= COHORT_SIZE) {
        return NextResponse.json({ ok: false, error: "cohort_full", cap: COHORT_SIZE }, { status: 409 });
      }
      const niche = String(body.niche || "").slice(0, 80);
      if (!niche) return NextResponse.json({ ok: false, error: "niche_required" }, { status: 400 });

      await sql`
        INSERT INTO challenge_members (id, handle, niche, email, joined_day, cohort)
        VALUES (${crypto.randomUUID()}, ${handle}, ${niche}, ${String(body.email || "").slice(0, 160)}, 1, ${currentCohort()})
        ON CONFLICT (cohort, handle) DO NOTHING
      `;
      return NextResponse.json({ ok: true, joined: true, handle, cohort: currentCohort() });
    }

    if (action === "checkin") {
      const day = Number(body.day);
      if (!Number.isInteger(day) || day < 1 || day > 14) {
        return NextResponse.json({ ok: false, error: "day must be 1-14" }, { status: 400 });
      }
      const rows: any = await sql`
        SELECT id FROM challenge_members WHERE cohort = ${currentCohort()} AND handle = ${handle} LIMIT 1
      `;
      if (!rows?.[0]) return NextResponse.json({ ok: false, error: "not_in_cohort" }, { status: 404 });
      const memberId = rows[0].id;

      await sql`
        INSERT INTO challenge_checkins (member_id, day, link, note, created_at)
        VALUES (${memberId}, ${day}, ${String(body.link || "").slice(0, 500)}, ${String(body.note || "").slice(0, 500)}, now())
        ON CONFLICT (member_id, day) DO UPDATE SET link = EXCLUDED.link, note = EXCLUDED.note
      `;

      // Recompute score server-side: never trust a client number.
      const [{ checked_in }]: any = await sql`
        SELECT COUNT(*)::int AS checked_in FROM challenge_checkins WHERE member_id = ${memberId}
      `;
      const [{ verdict }]: any = await sql`
        SELECT verdict FROM challenge_checkins WHERE member_id = ${memberId} AND day = 13 LIMIT 1
      `;
      const score = checked_in * 1;
      const status = isFinisher(checked_in, verdict || null) ? "finisher" : "active";

      await sql`
        INSERT INTO challenge_scores (member_id, checked_in, streak, score, status, verdict, updated_at)
        VALUES (${memberId}, ${checked_in}, ${streakOf(checked_in)}, ${score}, ${status}, ${verdict || null}, now())
        ON CONFLICT (member_id) DO UPDATE SET
          checked_in = EXCLUDED.checked_in, streak = EXCLUDED.streak,
          score = EXCLUDED.score, status = EXCLUDED.status,
          verdict = EXCLUDED.verdict, updated_at = now()
      `;

      return NextResponse.json({ ok: true, day, checked_in, score, status, verdict: verdict || null });
    }

    return NextResponse.json({ ok: false, error: "action must be join or checkin" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

/** Cohorts run monthly: YYYY-MM, so a new month is a new room. */
function currentCohort(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Simple streak proxy until per-day timestamps are ranked; replaced by WF14 at 06:00. */
function streakOf(checkedIn: number): number {
  return checkedIn;
}
