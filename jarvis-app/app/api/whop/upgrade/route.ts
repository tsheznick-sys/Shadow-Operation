import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

// Upgrade Lite $9 -> Pro $29 via Whop change_plan + log ascension for 1-2% churn (upgrade not churn)
export async function POST(req: NextRequest) {
  const { whopUserId, fromTier, toTier } = await req.json(); // fromTier=WHOP_PRODUCT_LITE_ID toTier=WHOP_PRODUCT_PRO_ID
  if (!whopUserId) return NextResponse.json({ error: "whopUserId required" }, { status: 400 });
  if (!process.env.WHOP_API_KEY) {
    return NextResponse.json({ mock: true, message: "WHOP_API_KEY missing — mock upgrade Lite→Pro $29 OK. Set key + WHOP_PRODUCT_PRO_ID for live.", whopUserId, fromTier, toTier });
  }
  try {
    const res = await fetch(`https://api.whop.com/api/v2/memberships/change_plan`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: whopUserId, from_product_id: fromTier || process.env.WHOP_PRODUCT_LITE_ID, to_product_id: toTier || process.env.WHOP_PRODUCT_PRO_ID }),
    });
    const data = await res.json().catch(() => ({}));
    // log ascension to Neon
    const sql = getSql();
    if (sql) await sql`INSERT INTO retention_events (id, user_id, action, offer) VALUES (${`upg_${Date.now()}`}, ${whopUserId}, 'upgrade_lite_to_pro', ${toTier || 'pro'})`;
    return NextResponse.json({ ok: res.ok, live: true, whopUserId, upgradedTo: toTier || process.env.WHOP_PRODUCT_PRO_ID, whopResponse: data });
  } catch (e: any) {
    return NextResponse.json({ mock: true, error: e.message, whopUserId, note: "Fallback mock — set WHOP_API_KEY for live" });
  }
}
export async function GET() {
  return NextResponse.json({ hint: "POST {whopUserId, fromTier, toTier} → change_plan Lite $9 → Pro $29 full stack $189", wired: "lib/entitlement.ts lite→pro 30→9999 runs, 1→5 domains, 3→6 clips/day" });
}
