import { NextResponse } from "next/server";
import { cronAllowed } from "@/lib/cron-auth";
import { getSql } from "@/lib/db";

/**
 * The 05:45 brief that n8n forwards to Telegram.
 *
 * It used to return a fixed sentence with no field saying so, which meant n8n would happily push
 * "1,462 GREEN pool · 200/200 LIVE" as though it had read the database. It had not.
 *
 * Now every response carries `source`: "db" when the numbers were read, "placeholder" when they
 * were not. WF4 prints that field, so a placeholder can never be quoted as a metric.
 */
export async function GET(req: Request) {
  const gate = cronAllowed(req);
  if (!gate.ok) return gate.response!;

  const time = new Date().toISOString();
  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      time,
      source: "placeholder",
      briefing: "Sir, the brief is a placeholder: DATABASE_URL is not set. Nothing here was read from the database.",
      channels: ["Telegram", "Gmail Shadow Hot", "Signal"],
    });
  }

  try {
    const [creators] = await sql`SELECT count(*)::int AS n FROM creators WHERE gate = 'GREEN'`;
    const [members] = await sql`SELECT count(*)::int AS n FROM agent_members WHERE tier <> 'free'`;
    const [queue] = await sql`SELECT count(*)::int AS n FROM publisher_queue38 WHERE status = 'pending_G4'`;
    return NextResponse.json({
      time,
      source: "db",
      briefing:
        `Sir, ${creators?.n ?? 0} GREEN creators in the pool · ${members?.n ?? 0} paying agent members · ` +
        `${queue?.n ?? 0} assets waiting on G4.`,
      numbers: { green_creators: creators?.n ?? 0, paying_members: members?.n ?? 0, pending_g4: queue?.n ?? 0 },
      channels: ["Telegram", "Gmail Shadow Hot", "Signal"],
    });
  } catch (e: any) {
    return NextResponse.json(
      { time, source: "error", briefing: "The brief query failed. No numbers are being reported.", detail: String(e?.message || e).slice(0, 200) },
      { status: 500 },
    );
  }
}
