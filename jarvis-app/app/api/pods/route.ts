import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function GET() {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({
      mock: true,
      pods: [
        { pod_id: "pod_red", name: "Pod Red", member_count: 5, streak: 28, members: [{ user_id: "u1", streak: 4, posts_7d: 6 }, { user_id: "u2", streak: 3, posts_7d: 5 }] },
        { pod_id: "pod_blue", name: "Pod Blue", member_count: 5, streak: 22, members: [] },
        { pod_id: "pod_green", name: "Pod Green", member_count: 4, streak: 18, members: [] },
      ],
      reason: "DATABASE_URL missing — mock pods, Good-Better-Best wired"
    });
  }
  const pods: any = await sql`SELECT pod_id, name, member_count, streak FROM pods ORDER BY streak DESC`;
  const members: any = await sql`SELECT pod_id, user_id, streak, posts_7d, last_post_at FROM pod_members`;
  return NextResponse.json({ mock: false, pods, members, updated: new Date().toISOString() });
}

export async function POST(req: Request) {
  const { user_id, action } = await req.json();
  const sql = getSql();
  if (!sql) return NextResponse.json({ mock: true, assigned: "pod_red", message: "Mock assigned to Pod Red — set DATABASE_URL for live" });
  // Assign to pod with fewest members (max 5)
  const pod: any = await sql`SELECT pod_id FROM pods ORDER BY member_count ASC LIMIT 1`;
  const podId = pod[0]?.pod_id || "pod_red";
  await sql`INSERT INTO pod_members (pod_id, user_id) VALUES (${podId}, ${user_id}) ON CONFLICT DO NOTHING`;
  await sql`UPDATE pods SET member_count = member_count + 1 WHERE pod_id = ${podId}`;
  await sql`INSERT INTO user_vault (user_id, pod_id) VALUES (${user_id}, ${podId}) ON CONFLICT (user_id) DO UPDATE SET pod_id = ${podId}`;
  return NextResponse.json({ ok: true, pod_id: podId, message: `Sir, ${user_id} assigned to ${podId} — accountability locked` });
}
