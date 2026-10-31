import { NextRequest, NextResponse } from "next/server";
import { calcPass } from "@/lib/ocr";
export async function POST(req: NextRequest) {
  const { views, replies } = await req.json();
  const res = calcPass(Number(views), Number(replies));
  // Real: also save snapshot + generate Sun 09:00 email draft via Gmail API
  return NextResponse.json({ ...res, message: res.pass ? "Sir, PASS — auto Whop vault ready, shooting email for your Sun 09:00 live decision." : "Sir, FAIL — no Whop per R9. Log as LOST if one_bump Mon 3 Nov fails." });
}
