import { NextResponse } from "next/server";
import { getSql, MissingDatabaseError } from "@/lib/db";
import { bearered } from "@/lib/cron-auth";
import { channelsFromEnv, type Surface } from "@/lib/publish";
import { SCHEDULABLE_SURFACES, planAsset, type Tier } from "@/lib/schedule";

/**
 * THE AGENT'S CALENDAR.
 *
 *   POST  /api/schedule   plan an asset into slots and book them
 *   GET   /api/schedule   what is queued, and what is waiting on a human
 *   PATCH /api/schedule   approve or block a G4 row
 *
 * Auth: a session in the app, or a machine token for n8n (Bearer $N8N_BRAIN_TOKEN).
 *
 * The planning is pure (`lib/schedule.ts`); this route only does I/O. That split is deliberate —
 * slot arithmetic is the part that must be provable without a database, and it is tested that way.
 */
function machineOk(req: Request) {
  const name = (process.env.N8N_BRAIN_TOKEN || "").trim() ? "N8N_BRAIN_TOKEN" : "CRON_SECRET";
  return bearered(req, name).ok;
}

async function sqlOr503() {
  try {
    const sql = getSql();
    if (!sql) return { sql: null as any, res: NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 }) };
    return { sql, res: null };
  } catch (e) {
    if (e instanceof MissingDatabaseError) {
      return { sql: null as any, res: NextResponse.json({ ok: false, error: "db_not_configured", detail: e.message }, { status: 503 }) };
    }
    throw e;
  }
}

export async function GET(req: Request) {
  if (!machineOk(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { sql, res } = await sqlOr503();
  if (!sql) return res;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 50) || 50, 200);

  try {
    const rows = await sql`
      SELECT id, member_id, page_ref, platform, publish_at, gate_status, watermark, attempts,
             claimed_at, published_at, buffer_post_id, last_error
        FROM agent_schedule
       WHERE gate_status IN ('pending','g4_review','pass','blocked','published')
       ORDER BY publish_at ASC
       LIMIT ${limit}
    `;
    const counts = await sql`
      SELECT gate_status, count(*)::int AS n
        FROM agent_schedule
       WHERE publish_at >= NOW() - INTERVAL '7 days'
       GROUP BY gate_status
    `;
    return NextResponse.json({
      ok: true,
      now: new Date().toISOString(),
      counts: Object.fromEntries((counts as any[]).map((c) => [c.gate_status, c.n])),
      rows,
      note: "g4_review rows are waiting for a human. pass rows publish on their own.",
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "query_failed", detail: String(e?.message || e).slice(0, 200) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!machineOk(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { sql, res } = await sqlOr503();
  if (!sql) return res;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const assetId = typeof body?.asset_id === "string" ? body.asset_id.trim() : "";
  const pageRef = typeof body?.page_ref === "string" ? body.page_ref.trim() : "";
  const memberId = typeof body?.member_id === "string" ? body.member_id.trim() : "";
  if (!assetId || !pageRef) {
    return NextResponse.json({ ok: false, error: "asset_id_and_page_ref_required" }, { status: 400 });
  }

  // Tier comes from the database, not the request body. A client that says "I am team" is not
  // evidence, and scheduling is a paid capability.
  let tier: Tier = "free";
  let flagged = false;
  let passes = 0;
  if (memberId) {
    try {
      const rows: any[] = await sql`SELECT tier, flagged, publish_passes FROM agent_members WHERE id = ${memberId} LIMIT 1`;
      if (rows.length) {
        tier = rows[0].tier as Tier;
        flagged = !!rows[0].flagged;
        passes = Number(rows[0].publish_passes) || 0;
      }
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: "member_lookup_failed", detail: String(e?.message || e).slice(0, 160) }, { status: 500 });
    }
  }

  // What is already booked for this page, so the one-per-surface-per-day rule can see it.
  let booked: any[] = [];
  try {
    booked = await sql`
      SELECT platform AS surface, publish_at
        FROM agent_schedule
       WHERE page_ref = ${pageRef}
         AND publish_at > NOW() - INTERVAL '1 day'
         AND gate_status IN ('pending','g4_review','pass','published')
    `;
  } catch { booked = []; }

  const surfaces: Surface[] = Array.isArray(body?.surfaces)
    ? body.surfaces.filter((s: any) => SCHEDULABLE_SURFACES.includes(s))
    : SCHEDULABLE_SURFACES;

  const plan = planAsset(
    {
      asset_id: assetId,
      page_ref: pageRef,
      member_id: memberId || undefined,
      tier,
      rules_ok: body?.rules_ok !== false,
      policy_ok: body?.policy_ok !== false,
      disclosure_ok: body?.disclosure_ok !== false,
      flagged,
      passes,
      surfaces,
      not_before: body?.not_before ? new Date(body.not_before) : undefined,
    },
    { booked: booked as any },
  );

  if (plan.refused) {
    return NextResponse.json(
      { ok: false, error: plan.refused.code, detail: plan.refused.detail, tier, booked: booked.length },
      { status: plan.refused.code === "manual_tier" ? 402 : 409 },
    );
  }

  const inserted: any[] = [];
  const skipped: string[] = [];
  for (const r of plan.rows) {
    try {
      const out: any[] = await sql`
        INSERT INTO agent_schedule (member_id, page_ref, platform, publish_at, asset_id, watermark, gate_status, publish_path, sla_due_at)
        VALUES (${r.member_id || null}, ${r.page_ref}, ${r.surface}, ${r.publish_at}, ${r.asset_id}, ${r.watermark}, ${r.gate_status}, ${r.publish_path}, ${r.sla_due_at})
        ON CONFLICT (member_id, asset_id, platform) DO NOTHING
        RETURNING id, platform, publish_at, gate_status
      `;
      if (out.length) inserted.push(out[0]);
      else skipped.push(r.surface);
    } catch (e: any) {
      skipped.push(`${r.surface}: ${String(e?.message || e).slice(0, 80)}`);
    }
  }

  return NextResponse.json({
    ok: inserted.length > 0,
    tier,
    path: plan.rows[0]?.publish_path ?? null,
    booked: inserted,
    skipped,
    // The distinction matters to a member: pass publishes itself, g4_review waits for a person.
    auto: inserted.filter((i) => i.gate_status === "pass").length,
    needs_review: inserted.filter((i) => i.gate_status === "g4_review").length,
    channels_configured: channelsFromEnv(process.env).missing.length === 0,
  });
}

export async function PATCH(req: Request) {
  if (!machineOk(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { sql, res } = await sqlOr503();
  if (!sql) return res;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const id = Number(body?.id);
  const action = String(body?.action || "");
  if (!Number.isFinite(id) || !["approve", "block"].includes(action)) {
    return NextResponse.json({ ok: false, error: "id_and_action_required", actions: ["approve", "block"] }, { status: 400 });
  }

  try {
    // A human moving a row out of g4_review. `approve` sets gate_status='pass' so the publisher
    // will pick it up on its next pass; `block` stops it permanently with a reason.
    const out: any[] =
      action === "approve"
        ? await sql`UPDATE agent_schedule SET gate_status = 'pass', blocked_by = NULL
                     WHERE id = ${id} AND gate_status IN ('pending','g4_review') RETURNING id, gate_status, publish_at`
        : await sql`UPDATE agent_schedule SET gate_status = 'blocked', blocked_by = ${String(body?.reason || "human review")}
                     WHERE id = ${id} AND gate_status <> 'published' RETURNING id, gate_status`;
    if (!out.length) return NextResponse.json({ ok: false, error: "not_found_or_not_editable" }, { status: 404 });
    return NextResponse.json({ ok: true, row: out[0] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "update_failed", detail: String(e?.message || e).slice(0, 200) }, { status: 500 });
  }
}
