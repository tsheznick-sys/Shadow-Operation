import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkEntitlement, tierLimits } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  const whopUserId = req.nextUrl.searchParams.get("whop_user_id") || req.headers.get("x-whop-user-id") || req.headers.get("x-whop-user-token") || "";
  const ent = await checkEntitlement(whopUserId || undefined);
  const limits = tierLimits(ent.tier);
  return NextResponse.json({ ...ent, limits, checked_at: new Date().toISOString() });
}
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  const requested = (await req.json().catch(() => ({}))).whopUserId;
  // Only the owner may ask about somebody else's entitlements.
  const whopUserId = session.role === "owner" ? requested : session.email;
  const ent = await checkEntitlement(whopUserId);
  return NextResponse.json(ent);
}
