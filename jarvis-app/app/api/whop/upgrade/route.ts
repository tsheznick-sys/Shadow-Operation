import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit, rateLimit } from "@/lib/limits";
import { PRODUCT_ENV, TIER_SPECS, TierSpec, auditTiers } from "@/lib/tiers";

/**
 * WHOP UPGRADE — hardened 2026-10-31.
 *
 * The previous version had three defects, all of them live blockers:
 *   1. NO SESSION CHECK. Anyone who could reach the URL could move any member between plans,
 *      because it called Whop's change_plan with OUR key and took whopUserId from the body.
 *   2. It trusted the client to say who the user was and which tier to move to.
 *   3. It pointed at api/v2 (Whop's current docs use api/v1) and hardcoded "Lite $9 / Pro $29 /
 *      $189" in its own comments, three price changes out of date.
 *
 * Now: the caller must be the owner, the member id must be supplied by the owner (not a member
 * moving themselves), the target must be a real tier, and the prices come from config.
 */

/**
 * Only the three AGENT tiers are movable here. The one-time ladder (First Shot, Lite, GOOD,
 * BETTER) is deliberately excluded: those are builds and a save path, not subscriptions, and
 * change_plan on them is meaningless.
 *
 * The old version accepted six tier names and built env names dynamically, so an upgrade to
 * "good" looked up WHOP_PRODUCT_GOOD_ID — a variable that has never existed — and sent
 * undefined to Whop while reporting success.
 */
const AGENT_TIERS = Object.keys(TIER_SPECS) as (keyof typeof TIER_SPECS)[];

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const lim = rateLimit(`upgrade:${req.headers.get("x-forwarded-for") ?? "local"}`, "money");
  if (!lim.allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited", retry_after_s: lim.retry_after_s }, { status: 429 });
  }

  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  // Only the owner moves money. The social and content seats can see a plan, never change one.
  if (session.role !== "owner") {
    return NextResponse.json({ ok: false, error: "owner_only" }, { status: 403 });
  }

  let body: { whopUserId?: string; toTier?: string; fromTier?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const whopUserId = (body.whopUserId ?? "").trim();
  const toTier = body.toTier as keyof typeof TIER_SPECS | undefined;
  const fromTier = body.fromTier as keyof typeof TIER_SPECS | undefined;
  if (!whopUserId) return NextResponse.json({ ok: false, error: "whopUserId required" }, { status: 400 });
  if (!toTier || !AGENT_TIERS.includes(toTier)) {
    return NextResponse.json({ ok: false, error: `toTier must be one of ${AGENT_TIERS.join(", ")}`, prices: auditTiers().prices }, { status: 400 });
  }
  if (fromTier && !AGENT_TIERS.includes(fromTier)) {
    return NextResponse.json({ ok: false, error: `fromTier must be one of ${AGENT_TIERS.join(", ")}` }, { status: 400 });
  }

  if (!process.env.WHOP_API_KEY) {
    // Fail loudly rather than reporting a successful mock upgrade on a real member.
    return NextResponse.json(
      { ok: false, error: "whop_not_configured", note: "WHOP_API_KEY is unset. No plan was changed." },
      { status: 503 },
    );
  }

  try {
    // v1 is the current Whop API surface. v2 was retired.
    const res = await fetch("https://api.whop.com/api/v1/memberships/change_plan", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: whopUserId,
        // Both sides resolved through the registry, so an id can never be invented from a name.
        from_product_id: fromTier ? process.env[PRODUCT_ENV[fromTier]] || undefined : undefined,
        to_product_id: process.env[PRODUCT_ENV[toTier]],
      }),
    });
    const data = await res.json().catch(() => ({}));

    const sql = getSql();
    if (sql) {
      await sql`INSERT INTO retention_events (id, user_id, action, offer)
                VALUES (${`upg_${Date.now()}`}, ${whopUserId}, 'plan_change', ${toTier})`;
      // Money moved. It gets written down or it did not happen.
      await audit(
        { actor: session.email, role: session.role, action: "plan_change", target: whopUserId, result: res.ok ? "ok" : "error", meta: { fromTier, toTier, price: TIER_SPECS[toTier].price } },
        sql,
      );
    }
    return NextResponse.json({ ok: res.ok, tier: toTier, price: TIER_SPECS[toTier].price, whop: data }, { status: res.ok ? 200 : 502 });
  } catch (e: any) {
    const sql = getSql();
    if (sql) await audit({ actor: session.email, role: session.role, action: "plan_change", target: whopUserId, result: "error", meta: { error: e?.message } }, sql);
    return NextResponse.json({ ok: false, error: "whop_request_failed", detail: e?.message }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST as the owner. Prices are read from config, never from the client.",
    tiers: AGENT_TIERS.map((t) => ({ tier: t, price: (TIER_SPECS[t] as TierSpec).price, env: PRODUCT_ENV[t as keyof typeof PRODUCT_ENV] })),
    auth: "owner session required",
  });
}
