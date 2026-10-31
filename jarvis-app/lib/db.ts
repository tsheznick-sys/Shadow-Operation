// Neon Postgres — Vercel cheap (free tier 3GB) — entitlement + pods wired
// Tables: creators (1,462 GREEN), drafts, replies, bros, pipeline, snapshots + retention (pods, user_vault, retention_events)
// Connection via DATABASE_URL in Vercel env — uses postgres.js
import postgres from "postgres";
import { isProduction } from "./security";
let sql: any = null;

export class MissingDatabaseError extends Error {
  constructor() {
    super(
      "DATABASE_URL is not set. In production this is fatal: every route would return 200 while " +
        "recording nothing — a store that takes money and forgets. Set DATABASE_URL or set " +
        "ALLOW_MOCK_DB=true for a deliberate demo.",
    );
    this.name = "MissingDatabaseError";
  }
}

/**
 * The connection. Returns null ONLY in a deliberate demo.
 *
 * Before 2026-10-31 this returned null whenever DATABASE_URL was missing, silently, in every
 * environment. Routes caught the null and answered 200 with mock data. That is fine for a
 * screenshot and catastrophic for a customer: the payment goes through and nothing is written.
 */
export function getSql() {
  if (!process.env.DATABASE_URL) {
    if (isProduction() && process.env.ALLOW_MOCK_DB !== "true") throw new MissingDatabaseError();
    return null; // local dev, or an explicit demo
  }
  if (!sql) sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 5 });
  return sql;
}
// Schema (run once): see jarvis-app/scripts/migrate.sql
// creators: handle, platform, followers, avg_comments, buyer_pool_x3, ratio, er, gate, niche, source
// drafts: id, handle, subject, body, gate, status (draft/sent), created_by (jarvis/bro)
// replies: thread_id, message_id, body, classification (positive/negative/bounce), hard_rule_action
// bros: email, name, role, is_super_admin, niches_owned
// NEW 1-2% churn lock:
// user_vault: user_id PK, tier (none/lite/pro/team), pod_id FK, scripts INT, streak INT, posts_7d INT, last_post_at, last_agent_use
// pods: pod_id PK, name (Pod Red/Blue...), member_count INT, streak INT, created_at
// pod_members: pod_id + user_id PK, streak INT, posts_7d INT, last_post_at
// retention_events: id, user_id, action (pause/discount50/downgrade_lite/cancel), offer, created_at
// wins: id, user_id, title, proof_url, views INT, verified BOOL, created_at
// revenue_log: alias Wise pay (source, amount, paid_at)
