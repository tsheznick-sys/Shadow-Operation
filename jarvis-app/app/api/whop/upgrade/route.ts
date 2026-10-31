import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import adaptable from "@/config/adaptable.json";

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

type Tier = "lite" | "good" | "better" | "pro" | "circle" | "team";

const PRICES: Record<Tier, number> = (() => {
  const p = (adaptable as any)?.paywalls ?? {};
  return {
    lite: p.lite ?? 17,
    good: p.good ?? 35,
    better: p.better ?? 89,
    pro: p.pro ?? 53,
    circle: p.circle ?? 44,
    team: p.team ?? 62,
  };
})();

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  // Only the owner moves money. The social and content seats can see a plan, never change one.
  if (session.role !== "owner") {
    return NextResponse.json({ ok: false, error: "owner_only" }, { status: 403 });
  }

  let body: { whopUserId?: string; toTier?: Tier; fromTier?: Tier } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const whopUserId = (body.whopUserId ?? "").trim();
  const toTier = body.toTier;
  if (!whopUserId) return NextResponse.json({ ok: false, error: "whopUserId required" }, { status: 400 });
  if (!toTier || !(toTier in PRICES)) {
    return NextResponse.json({ ok: false, error: `toTier must be one of ${Object.keys(PRICES).join(", ")}` }, { status: 400 });
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
        from_product_id: process.env[`WHOP_PRODUCT_${(body.fromTier ?? "").toUpperCase()}_ID`] || undefined,
        to_product_id: process.env[`WHOP_PRODUCT_${toTier.toUpperCase()}_ID`],
      }),
    });
    const data = await res.json().catch(() => ({}));

    const sql = getSql();
    if (sql) {
      await sql`INSERT INTO retention_events (id, user_id, action, offer)
                VALUES (${`upg_${Date.now()}`}, ${whopUserId}, 'plan_change', ${toTier})`;
    }
    return NextResponse.json({ ok: res.ok, tier: toTier, price: PRICES[toTier], whop: data }, { status: res.ok ? 200 : 502 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "whop_request_failed", detail: e?.message }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST as the owner. Prices are read from config, never from the client.",
    prices: PRICES,
    auth: "owner session required",
  });
}
