import { NextResponse } from "next/server";
import { cronAllowed } from "@/lib/cron-auth";
import { getSql, MissingDatabaseError } from "@/lib/db";
import { channelsFromEnv, publish, canScheduleToBuffer, SURFACES } from "@/lib/publish";
import {
  CLAIM_SQL, MARK_SQL, MAX_ATTEMPTS, batchSize, backoffMinutes, resolveChannel, shouldCountAsPublished,
  type DueRow, type Surface,
} from "@/lib/schedule";
import type { AgentTier } from "@/lib/tiers";

/**
 * THE AUTO-PUBLISHER. This is the loop the product sells: the agent books a slot, and the slot
 * keeps itself.
 *
 * Runs every 15 minutes (vercel.json). Each pass:
 *
 *   1. CLAIM — one conditional UPDATE … RETURNING. Not SELECT-then-POST. Two overlapping runs
 *      (a retry, a deploy, a manual trigger during the cron) must not both send the same row.
 *   2. RESOLVE the channel — the member's own Buffer channel if they connected one, else the page's
 *      channel from env. If neither, the row is blocked. A channel is never guessed.
 *   3. PUBLISH via lib/publish.ts, which already refuses to read HTTP 200 as success.
 *   4. MARK — `published` only when Buffer returned a post id. Anything else is an error with a
 *      backoff, and after three attempts the row is blocked for a human.
 *
 * If DATABASE_URL is missing this returns 503 rather than pretending to have published anything.
 */
export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request) {
  const gate = cronAllowed(req);
  if (!gate.ok) return gate.response!;

  let sql: any = null;
  try {
    sql = getSql();
  } catch (e) {
    if (e instanceof MissingDatabaseError) {
      return NextResponse.json({ ok: false, error: "db_not_configured", published: 0 }, { status: 503 });
    }
    throw e;
  }
  if (!sql) return NextResponse.json({ ok: false, error: "db_not_configured", published: 0 }, { status: 503 });

  const started = Date.now();
  const now = new Date().toISOString();
  const lim = Math.min(Number(new URL(req.url).searchParams.get("limit") || 0) || 25, 25);

  // ---- 1. claim -------------------------------------------------------------
  let claimed: DueRow[] = [];
  try {
    claimed = (await sql.unsafe(CLAIM_SQL, [now, lim])) as DueRow[];
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "claim_failed", detail: String(e?.message || e).slice(0, 240), published: 0 },
      { status: 500 },
    );
  }

  if (!claimed.length) {
    return NextResponse.json({ ok: true, now, claimed: 0, published: 0, failed: 0, note: "nothing was due" });
  }

  // ---- tiers, in one query ---------------------------------------------------
  const ids = Array.from(new Set(claimed.map((r) => r.member_id).filter(Boolean))) as string[];
  const tierOf = new Map<string, AgentTier>();
  const memberChannels = new Map<string, Partial<Record<Surface, string>>>();
  try {
    if (ids.length) {
      const members: any[] = await sql`SELECT id, tier FROM agent_members WHERE id = ANY(${ids})`;
      for (const m of members) tierOf.set(m.id, m.tier as AgentTier);

      const chans: any[] = await sql`
        SELECT member_id, platform, buffer_channel_id FROM member_channels
         WHERE member_id = ANY(${ids}) AND revoked_at IS NULL
      `;
      for (const c of chans) {
        const cur = memberChannels.get(c.member_id) ?? {};
        cur[c.platform as Surface] = c.buffer_channel_id;
        memberChannels.set(c.member_id, cur);
      }
    }
  } catch {
    // A failed lookup leaves tierOf empty, which makes canScheduleToBuffer default to false below
    // — deny, never allow, same rule as entitlement.
  }

  const pageChannels = channelsFromEnv(process.env).channels;
  const results: any[] = [];
  let published = 0;
  let failed = 0;

  const budget = batchSize(claimed.length);
  for (const row of claimed.slice(0, budget)) {
    const tier = (row.member_id ? tierOf.get(row.member_id) : "team") ?? "free";

    // A member who churned between booking and publishing does not get the slot.
    if (!canScheduleToBuffer(tier)) {
      await mark(sql, row.id, "blocked", null, `tier is ${tier} — no longer entitled to scheduled publishing`);
      failed++;
      results.push({ id: row.id, outcome: "blocked", reason: `tier ${tier}` });
      continue;
    }

    const resolved = resolveChannel(
      { platform: row.platform },
      row.member_id ? (memberChannels.get(row.member_id) ?? null) : null,
      pageChannels,
    );

    if (!resolved.channelId) {
      await mark(sql, row.id, "blocked", null, `no channel for ${row.platform} (${SURFACES[row.platform]?.env ?? "unknown env"})`);
      failed++;
      results.push({ id: row.id, outcome: "blocked", reason: "no_channel" });
      continue;
    }

    // Read from the row itself. No cross-table lookup, no catch that hides a bad column.
    const videoUrl = (row.video_url || "").trim();
    if (!videoUrl) {
      await mark(sql, row.id, "blocked", null, `asset ${row.asset_id} has no public URL`);
      failed++;
      results.push({ id: row.id, outcome: "blocked", reason: "no_asset_url" });
      continue;
    }

    const out = await publish({
      surface: row.platform,
      channelId: resolved.channelId,
      text: row.caption || "",
      videoUrl,
      dueAt: undefined, // publish now; the slot already decided "when"
    });

    // Buffer answers 200 for a failed mutation, so the decision is `post.id`, not `ok`.
    if (shouldCountAsPublished(out as any)) {
      await mark(sql, row.id, "published", (out as any).post.id, null);
      published++;
      results.push({ id: row.id, outcome: "published", post: (out as any).post.id, via: resolved.source });
    } else {
      const attempts = Number(row.attempts) + 1;
      const giveUp = attempts >= MAX_ATTEMPTS;
      const message = (out as any).status === "error" ? (out as any).message : "no post id returned";
      await mark(sql, row.id, giveUp ? "blocked" : "pass", null, `attempt ${attempts}: ${message}`);
      if (giveUp) {
        failed++;
        results.push({ id: row.id, outcome: "blocked", reason: message });
      } else {
        // Put it back in the queue with a backoff by pushing its publish_at forward.
        await sql`
          UPDATE agent_schedule
             SET claimed_at = NULL,
                 publish_at = GREATEST(publish_at, NOW() + (${backoffMinutes(attempts)} || ' minutes')::interval)
           WHERE id = ${row.id}
        `;
        results.push({ id: row.id, outcome: "retry", in_minutes: backoffMinutes(attempts), reason: message });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    now,
    claimed: claimed.length,
    attempted: Math.min(claimed.length, budget),
    published,
    failed,
    ms: Date.now() - started,
    results,
  });
}

async function mark(sql: any, id: number, status: string, postId: string | null, error: string | null) {
  await sql.unsafe(MARK_SQL, [id, status, postId, error]);
}

/** The finished video. Same source the app renders to, so there is one definition of "the asset". */
async function assetUrl(sql: any, assetId: string): Promise<string | null> {
  try {
    const rows: any[] = await sql`SELECT video_url FROM publisher_queue38 WHERE id = ${assetId} LIMIT 1`;
    if (rows.length && rows[0].video_url) return String(rows[0].video_url);
  } catch { /* fall through */ }
  try {
    const rows: any[] = await sql`SELECT video_url FROM agent_runs WHERE asset_id = ${assetId} ORDER BY created_at DESC LIMIT 1`;
    if (rows.length && rows[0].video_url) return String(rows[0].video_url);
  } catch { /* fall through */ }
  return null;
}

async function captionFor(sql: any, assetId: string): Promise<string> {
  try {
    const rows: any[] = await sql`SELECT caption FROM publisher_queue38 WHERE id = ${assetId} LIMIT 1`;
    if (rows.length && rows[0].caption) return String(rows[0].caption);
  } catch { /* fall through */ }
  return "";
}

export async function HEAD() {
  // Cheap liveness probe for a monitor: does not claim or publish anything.
  return new Response(null, { status: 204 });
}
