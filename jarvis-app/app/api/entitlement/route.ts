import { NextRequest, NextResponse } from "next/server";
import { checkEntitlement, tierLimits } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  const whopUserId = req.nextUrl.searchParams.get("whop_user_id") || req.headers.get("x-whop-user-id") || req.headers.get("x-whop-user-token") || "";
  const ent = await checkEntitlement(whopUserId || undefined);
  const limits = tierLimits(ent.tier);
  return NextResponse.json({ ...ent, limits, checked_at: new Date().toISOString() });
}
export async function POST(req: NextRequest) {
  const { whopUserId } = await req.json();
  const ent = await checkEntitlement(whopUserId);
  return NextResponse.json(ent);
}
