import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { HANDLED, WhopEvent, planFor, verifySignature } from "@/lib/webhook";

export const dynamic = "force-dynamic";

/**
 * POST /api/whop/webhook
 *
 * Reachable without a session — by design — because Whop cannot hold a cookie. Verified by
 * HMAC instead. If WHOP_WEBHOOK_SECRET is unset we refuse every event rather than trust
 * unverified money, and we say so with a 503 so the failure is visible in Whop's dashboard.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = verifySignature(raw, req.headers, process.env.WHOP_WEBHOOK_SECRET);
  if (!sig.ok) {
    const status = sig.reason.includes("not configured") ? 503 : 401;
    return NextResponse.json({ ok: false, error: "signature", reason: sig.reason }, { status });
  }

  let payload: any = {};
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const type = (payload?.type ?? payload?.event ?? "unknown") as WhopEvent;
  if (!HANDLED.includes(type)) return NextResponse.json({ ok: true, ignored: type });

  const plan = planFor(type, payload);
  const memberId = payload?.data?.user_id ?? payload?.data?.member_id ?? payload?.user_id;
  if (!memberId) return NextResponse.json({ ok: false, error: "no_member_id", type }, { status: 400 });

  const sql = getSql();
  if (!sql) return NextResponse.json({ ok: false, error: "no_database", note: "event verified but not recorded" }, { status: 503 });

  try {
    if (plan.action === "upsert_member" && plan.tier) {
      await sql`
        INSERT INTO agent_members (id, tier, joined_via, watermark)
        VALUES (${memberId}, ${plan.tier}, 'funnel', ${plan.tier === "free"})
        ON CONFLICT (id) DO UPDATE SET tier = ${plan.tier}, watermark = ${plan.tier === "free"}
      `;
    }
    if (plan.action === "revoke_access") {
      await sql`UPDATE agent_members SET tier = 'free', watermark = true WHERE id = ${memberId}`;
      if (plan.revoke_oauth) {
        await sql`
          UPDATE agent_oauth_grants
             SET revoked_at = NOW(), revoke_reason = 'churn'
           WHERE member_id = ${memberId} AND revoked_at IS NULL
        `;
      }
    }
    if (plan.action === "mark_payment_failed") {
      await sql`UPDATE agent_members SET flagged = true WHERE id = ${memberId}`;
    }
    return NextResponse.json({ ok: true, type, action: plan.action, tier: plan.tier ?? null, reason: plan.reason });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "write_failed", detail: e?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "HMAC-verified. Set WHOP_WEBHOOK_SECRET in Vercel; until then every event is refused with 503.",
    handles: HANDLED,
  });
}
