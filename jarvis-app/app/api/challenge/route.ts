import { NextResponse } from "next/server";
import { COHORT_SIZE, DAYS, ENTRY_FEE, MIN_TENURE_DAYS, gate, isFinisher, nextDoor, readCohort } from "@/lib/challenge";
import { getSql } from "@/lib/db";
import { verifySubmission } from "@/lib/verify";

export const dynamic = "force-dynamic";

// GET /api/challenge — public cohort state. No emails, no revenue, no personal data.
export async function GET() {
  const { members, source } = await readCohort();
  return NextResponse.json({
    ok: true,
    source,
    audience: "operators",
    cohort_cap: COHORT_SIZE,
    min_tenure_days: MIN_TENURE_DAYS,
    entry_fee: ENTRY_FEE,
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
      unverified: m.unverified ?? 0,
    })),
  });
}

// POST /api/challenge
//   { action: "join", handle, niche }         — requires 14 days paid tenure
//   { action: "checkin", handle, day, link, claimed }
export async function POST(req: Request) {
  const ctype = req.headers.get("content-type") || "";
  let body: any = {};
  if (ctype.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const fd = await req.formData().catch(() => null);
    body = fd
      ? {
          action: String(fd.get("action") || ""),
          handle: String(fd.get("handle") || ""),
          niche: String(fd.get("niche") || ""),
          day: fd.get("day"),
          link: String(fd.get("link") || ""),
          claimed: fd.get("claimed"),
        }
      : {};
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json(
      { ok: false, error: "no_database", detail: "DATABASE_URL is not set — the challenge needs Neon." },
      { status: 503 }
    );
  }

  const action = String(body.action || "");
  const handle = String(body.handle || "").replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9._]{2,40}$/.test(handle)) {
    return NextResponse.json({ ok: false, error: "invalid_handle" }, { status: 400 });
  }

  try {
    const cohort = currentCohort();

    if (action === "join") {
      // THE GATE — paid tenure, enforced server-side. No public sign-ups.
      const el: any = await sql`
        SELECT tier, COALESCE(EXTRACT(DAY FROM now() - paid_since), 0)::int AS paid_tenure_days
        FROM challenge_members WHERE handle = ${handle} ORDER BY created_at DESC LIMIT 1
      `;
      const verdict = gate(el?.[0] ? { paid_tenure_days: el[0].paid_tenure_days, tier: el[0].tier } : null);
      if (!verdict.allowed) {
        return NextResponse.json(
          { ok: false, error: "not_eligible", reason: verdict.reason, min_tenure_days: MIN_TENURE_DAYS },
          { status: 403 }
        );
      }

      const [{ count }]: any = await sql`
        SELECT COUNT(*)::int AS count FROM challenge_members WHERE cohort = ${cohort}
      `;
      if (count >= COHORT_SIZE) {
        return NextResponse.json({ ok: false, error: "cohort_full", cap: COHORT_SIZE }, { status: 409 });
      }

      const niche = String(body.niche || "").slice(0, 80);
      if (!niche) return NextResponse.json({ ok: false, error: "niche_required" }, { status: 400 });

      await sql`
        INSERT INTO challenge_members (id, handle, niche, joined_day, cohort, tier, paid_since)
        VALUES (${crypto.randomUUID()}, ${handle}, ${niche}, 1, ${cohort}, ${el[0].tier}, now() - make_interval(days => ${el[0].paid_tenure_days}))
        ON CONFLICT (cohort, handle) DO NOTHING
      `;
      return NextResponse.json({ ok: true, joined: true, handle, cohort, gate: verdict.reason });
    }

    if (action === "checkin") {
      const day = Number(body.day);
      if (!Number.isInteger(day) || day < 1 || day > 14) {
        return NextResponse.json({ ok: false, error: "day must be 1-14" }, { status: 400 });
      }

      const rows: any = await sql`
        SELECT id FROM challenge_members WHERE cohort = ${cohort} AND handle = ${handle} LIMIT 1
      `;
      if (!rows?.[0]) return NextResponse.json({ ok: false, error: "not_in_cohort" }, { status: 404 });
      const memberId = rows[0].id;

      const link = String(body.link || "").slice(0, 500);
      const claimedRaw = body.claimed;
      const claimed = claimedRaw === undefined || claimedRaw === null || claimedRaw === "" ? null : Number(claimedRaw);

      // VERIFY — claimed vs the platform's real number. A >20% gap rejects the day.
      const metric: "views" | "comments" = day === 13 ? "comments" : "views";
      const v =
        claimed !== null && Number.isFinite(claimed)
          ? await verifySubmission(link, claimed, metric)
          : { ok: true, status: "api_missing" as const, claimed: 0, actual: null, mismatch_pct: 0, reason: "no number claimed" };

      await sql`
        INSERT INTO challenge_checkins (member_id, day, link, claimed, actual, mismatch_pct, verify_status, counted, created_at)
        VALUES (${memberId}, ${day}, ${link}, ${claimed}, ${v.actual}, ${v.mismatch_pct}, ${v.status}, ${v.ok}, now())
        ON CONFLICT (member_id, day) DO UPDATE SET
          link = EXCLUDED.link, claimed = EXCLUDED.claimed, actual = EXCLUDED.actual,
          mismatch_pct = EXCLUDED.mismatch_pct, verify_status = EXCLUDED.verify_status, counted = EXCLUDED.counted
      `;

      // Recompute server-side. Counted days only — an unverified claim never inflates a score.
      const [{ checked_in }]: any = await sql`
        SELECT COUNT(*)::int AS checked_in FROM challenge_checkins WHERE member_id = ${memberId} AND counted = true
      `;
      const [{ unverified }]: any = await sql`
        SELECT COUNT(*)::int AS unverified FROM challenge_checkins
        WHERE member_id = ${memberId} AND verify_status = 'api_missing'
      `;
      const [{ verdict: vd }]: any = await sql`
        SELECT claimed AS verdict FROM challenge_checkins WHERE member_id = ${memberId} AND day = 13 LIMIT 1
      `;
      const verdictLabel = verdictFor(typeof vd === "number" ? vd : null);
      const score = checked_in * 1;
      const status = isFinisher(checked_in, verdictLabel) ? "finisher" : "active";

      await sql`
        INSERT INTO challenge_scores (member_id, checked_in, streak, score, status, verdict, updated_at)
        VALUES (${memberId}, ${checked_in}, ${checked_in}, ${score}, ${status}, ${verdictLabel}, now())
        ON CONFLICT (member_id) DO UPDATE SET
          checked_in = EXCLUDED.checked_in, streak = EXCLUDED.streak, score = EXCLUDED.score,
          status = EXCLUDED.status, verdict = EXCLUDED.verdict, updated_at = now()
      `;

      return NextResponse.json({
        ok: v.ok,
        day,
        counted: v.ok,
        verify: { status: v.status, claimed: v.claimed, actual: v.actual, mismatch_pct: v.mismatch_pct, reason: v.reason },
        checked_in,
        unverified,
        score,
        status,
        verdict: verdictLabel,
        next_door: nextDoor({ checked_in, verdict: verdictLabel }),
      });
    }

    return NextResponse.json({ ok: false, error: "action must be join or checkin" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

/** 50+ PASS · 25–49 AMBER · <25 RED — the member's own number, never reinterpreted. */
function verdictFor(comments: number | null): "PASS" | "AMBER" | "RED" | null {
  if (comments === null || !Number.isFinite(comments)) return null;
  if (comments >= 50) return "PASS";
  if (comments >= 25) return "AMBER";
  return "RED";
}

/** Cohorts run monthly: YYYY-MM, so a new month is a new room. */
function currentCohort(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
