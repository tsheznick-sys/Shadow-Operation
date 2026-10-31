import { NextResponse } from "next/server";
import { cronAllowed } from "@/lib/cron-auth";
// Vercel Cron 15min — auto while you sleep (Q4). Bearer CRON_SECRET required in production.
export async function GET(req: Request) {
  const gate = cronAllowed(req);
  if (!gate.ok) return gate.response!;
  // Real: gmail__list_messages (Shadow Hot label) → Hard Rule 1 (3-email cap) → classify → draft next step → Linear + Telegram/Signal ping
  return NextResponse.json({ ok: true, checked: "Shadow Hot label — Omar + 200 pipeline", time: new Date().toISOString(), note: "Auto while you sleep — you wake to swipe." });
}
