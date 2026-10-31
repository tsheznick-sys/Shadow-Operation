import { NextRequest, NextResponse } from "next/server";
import { askJarvis } from "@/lib/jarvis";
export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();
  const res = await askJarvis(prompt, history);
  return NextResponse.json(res);
}
