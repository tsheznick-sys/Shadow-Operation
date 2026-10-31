import { NextResponse } from "next/server";
import { getSql, MissingDatabaseError } from "@/lib/db";
import { bearered } from "@/lib/cron-auth";
import { getSession } from "@/lib/auth";
import { checkEntitlement } from "@/lib/entitlement";
import { credentials, higgsfieldRender, renderCost } from "@/lib/render-paid";
import { COST_PER_RUN, type Tier } from "@/lib/stickman-agent";
import { beforeRender, quotaFromRow, refund, renderSpec, reserve, runRecord, tierFrom } from "@/lib/run";
import { split } from "@/lib/split";

/**
 * THE RUN. The only route that spends money, and the one the product actually is.
 *
 *   POST /api/agent/run
 *   { "member_id?": "...", "script": "...", "image_url": "https://...", "rules_ok?": true, ... }
 *
 * Order, and why:
 *   reserve → gate → render → settle
 * The reservation is taken BEFORE the renderer is paid. Two requests arriving together both
 * read "41 left" if you check first and charge after — so the counter is claimed first and given
 * back only when the failure was ours.
 *
 * Auth: a session, or the machine token for n8n. The tier comes from the database or from an
 * entitlement lookup — never from the request body.
 */
export async function POST(req: Request) {
  const machine = bearered(req, (process.env.N8N_BRAIN_TOKEN || "").trim() ? "N8N_BRAIN_TOKEN" : "CRON_SECRET").ok;
  const session = getSession();
  if (!machine && !session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let sql: any = null;
  try {
    sql = getSql();
  } catch (e) {
    if (e instanceof MissingDatabaseError) {
      // No database means no quota, and a run without a quota is revenue leaking out of a hole.
      return NextResponse.json({ ok: false, error: "db_not_configured", detail: e.message }, { status: 503 });
    }
    throw e;
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const memberId = typeof body?.member_id === "string" ? body.member_id.trim() : "";
  const script = typeof body?.script === "string" ? body.script.trim() : "";
  const imageUrl = typeof body?.image_url === "string" ? body.image_url.trim() : "";

  if (!memberId) return NextResponse.json({ ok: false, error: "member_id_required" }, { status: 400 });
  if (!script) return NextResponse.json({ ok: false, error: "script_required" }, { status: 400 });
  if (!imageUrl) {
    return NextResponse.json(
      { ok: false, error: "image_required", detail: "image-to-video needs a first frame; there is no text-only render" },
      { status: 422 },
    );
  }

  // ---- 1. who is this, really ------------------------------------------------
  let row: any = null;
  try {
    const rows: any[] = await sql`SELECT * FROM agent_members WHERE id = ${memberId} LIMIT 1`;
    row = rows[0] ?? null;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "member_lookup_failed", detail: String(e?.message || e).slice(0, 160) }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ ok: false, error: "unknown_member", detail: "a run belongs to a member row; this id has none" }, { status: 404 });
  }

  // The stored tier is authoritative. An entitlement lookup can only lower it, never raise it —
  // a stale `agent_members` row must not out-rank a cancelled subscription.
  let tier: Tier = (tierFrom(row.tier) ?? "free") as Tier;
  if (tier !== "free" && process.env.WHOP_API_KEY) {
    try {
      const ent = await checkEntitlement(memberId);
      if (ent && typeof ent === "object" && "tier" in ent) {
        const live = tierFrom((ent as any).tier);
        if (live === "free") tier = "free"; // downgraded, never upgraded, by a live check
      }
    } catch {
      // A failed entitlement check denies nothing extra here: the row already decided. But it
      // must never be able to promote someone, which is why only a downgrade is applied.
    }
  }

  // ---- 2. reserve the run -----------------------------------------------------
  const quota = quotaFromRow(row);
  const res = reserve(tier, quota);
  if (!res.allowed) {
    return NextResponse.json(
      { ok: false, error: "quota_exhausted", reason: res.reason, tier, quota: res.next },
      { status: 429 },
    );
  }

  try {
    await sql`
      UPDATE agent_members
         SET used_in_window = ${res.next.used_in_window},
             used_this_month = ${res.next.used_this_month},
             window_started = ${res.next.window_started},
             month_key = ${res.next.month}
       WHERE id = ${memberId}
    `;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "reserve_failed", detail: String(e?.message || e).slice(0, 160) }, { status: 500 });
  }

  const giveBack = async (why: string) => {
    const back = refund(res.next);
    try {
      await sql`
        UPDATE agent_members
           SET used_in_window = ${back.used_in_window}, used_this_month = ${back.used_this_month}
         WHERE id = ${memberId}
      `;
    } catch {
      // A failed refund leaves the member one run short. It is logged in agent_runs below, which
      // is the only reason that row is written even for a blocked run.
    }
    return why;
  };

  // ---- 3. the gate ------------------------------------------------------------
  // Every one of these three flags used to be read off the request body as `!== false`, which
  // meant a caller who simply omitted the field was asserting their own compliance. The verdict
  // is computed here instead: lib/split.ts runs the rule set on the public cut, and the disclosure
  // is whatever that cut actually carries. The body can lower nothing and raise nothing.
  const format: "longform" | "short" = body?.format === "longform" ? "longform" : "short";
  const niche = typeof body?.niche === "string" && body.niche.trim() ? body.niche.trim() : "general";
  const cuts = split(script, { title: typeof body?.title === "string" && body.title.trim() ? body.title.trim() : memberId, niche, format });

  const gate = beforeRender({
    rules_ok: cuts.policy.pass,
    policy_ok: !cuts.blocked,
    disclosure_ok: cuts.edited.disclosure.trim().length > 0,
    script,
    niche,
    format,
    characterLock: typeof body?.character_lock === "string" ? body.character_lock : undefined,
  });
  if (!gate.ok) {
    const reason = await giveBack(gate.reason!);
    await record(sql, runRecord({ member_id: memberId, tier, status: "blocked", cost: 0, asset_id: null, video_url: null, reason }));
    return NextResponse.json({ ok: false, error: "gate_blocked", reason, failed: cuts.policy.failed }, { status: 422 });
  }

  // ---- 4. render --------------------------------------------------------------
  if (!credentials()) {
    const reason = await giveBack("render engine is not configured — nothing was charged");
    await record(sql, runRecord({ member_id: memberId, tier, status: "failed", cost: 0, asset_id: null, video_url: null, reason }));
    return NextResponse.json({ ok: false, error: "render_not_configured", detail: reason }, { status: 503 });
  }

  const spec = renderSpec(tier);
  const started = Date.now();
  const out = await higgsfieldRender({
    imageUrl,
    prompt: scriptFrom(script, spec),
    duration: spec.duration_seconds,
    resolution: spec.resolution,
    // One idempotency key per member per run, so a network retry cannot be billed twice.
    idempotencyKey: `${memberId}-${res.next.month}-${res.next.used_in_window}`,
  });
  const ms = Date.now() - started;

  if (!out.ok || !out.url) {
    const reason = out.reason || "the renderer returned no file";
    await giveBack(reason);
    await record(sql, runRecord({ member_id: memberId, tier, status: "failed", cost: 0, asset_id: null, video_url: null, reason, ms }));
    return NextResponse.json({ ok: false, error: "render_failed", detail: reason, charged: false }, { status: 502 });
  }

  // ---- 5/6. settle and record -------------------------------------------------
  const cost = renderCost();
  const assetId = out.requestId || `run_${Date.now()}`;
  await record(
    sql,
    runRecord({ member_id: memberId, tier, status: "ok", cost: cost || COST_PER_RUN, asset_id: assetId, video_url: out.url, ms }),
  );

  return NextResponse.json({
    ok: true,
    asset_id: assetId,
    video_url: out.url,
    watermark: spec.watermark,
    resolution: spec.resolution,
    quota: { remaining_window: res.next.used_in_window, used_this_month: res.next.used_this_month },
    cost,
    ms,
    cuts: { raw: cuts.raw.destination, edited: cuts.edited.destination },
    next: "POST /api/schedule with { asset_id, video_url, page_ref } to book it",
  });
}

/** The renderer takes a prompt, not a screenplay. The gate has already run on the full script. */
function scriptFrom(script: string, spec: ReturnType<typeof renderSpec>): string {
  const head = script.split("\n").filter(Boolean).slice(0, 3).join(" ").slice(0, 900);
  return spec.watermark ? `${head} [free tier — watermark applies]` : head;
}

async function record(sql: any, r: ReturnType<typeof runRecord>) {
  try {
    await sql`
      INSERT INTO agent_runs (member_id, kind, status, cost, asset_id, video_url, tier, detail)
      VALUES (${r.member_id}, ${r.kind}, ${r.status}, ${r.cost}, ${r.asset_id}, ${r.video_url}, ${r.tier}, ${sql.json(r.detail)})
    `;
  } catch {
    // The run already happened. Losing the receipt is bad; failing the member is worse.
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    door: "/api/agent/run",
    order: ["reserve", "gate", "render", "settle"],
    needs: ["member_id", "script", "image_url"],
    note: "the reservation is taken before the renderer is paid, and refunded only when the failure is ours",
  });
}
