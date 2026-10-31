import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const kpi = {
    churn30: 1.4, churnTarget: "1-2%",
    saveRate: 44, saveTarget: 45,
    activation7d: 82, activationTarget: 85,
    dau7: 58, dauTarget: 60,
    wwsReplay: 41, wwsTarget: 40,
    active: 347, cancelled30: 5, paused: 12, failedPayment: 3,
    pages: 5, viewsBuffer: 18200, replies: 312, er: "9.1%",
    updated: new Date().toISOString(),
    provider: "mock until DATABASE_URL live"
  };
  return NextResponse.json(kpi);
}

export async function POST(req: NextRequest) {
  const { action, userId, offer } = await req.json();
  if (!["pause", "discount50", "downgrade_lite", "cancel"].includes(action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, action, userId, offer, message: `Sir, ${action} applied for ${userId} — saved before churn. Vesper logged.`, mock: true });
}
