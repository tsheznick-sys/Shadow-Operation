// Neon Postgres — Vercel cheap (free tier 3GB)
// Tables: creators (1,462 GREEN), drafts, replies, bros, pipeline, snapshots
// Connection via DATABASE_URL in Vercel env — uses postgres.js
import postgres from "postgres";
let sql: any = null;
export function getSql() {
  if (!process.env.DATABASE_URL) return null; // local dev without DB — mock mode
  if (!sql) sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
  return sql;
}
// Schema (run once): see jarvis-app/scripts/migrate.sql
// creators: handle, platform, followers, avg_comments, buyer_pool_x3, ratio, er, gate, niche, source
// drafts: id, handle, subject, body, gate, status (draft/sent), created_by (jarvis/bro)
// replies: thread_id, message_id, body, classification (positive/negative/bounce), hard_rule_action
// bros: email, name, role, is_super_admin, niches_owned
