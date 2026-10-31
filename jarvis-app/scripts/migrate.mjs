#!/usr/bin/env node
// STAGE 1 — put the schema into Neon, then prove it landed.
//
//   DATABASE_URL="postgresql://...-pooler...?sslmode=require" npm run migrate
//
// There is no psql on most machines that will run this, so the same `postgres` client the app
// already uses executes the file. Two rules:
//
//   1. Refuse a connection string that is not pooled. Vercel opens a connection per lambda;
//      the direct endpoint runs out of slots at exactly the wrong moment.
//   2. Re-count the tables and FAIL if the count is short. A migration that half-applied and
//      exited 0 is how a "finished" setup produces a broken first run three days later.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const EXPECTED_MIN = 34;

const url = (process.env.DATABASE_URL || "").trim();
if (!url) {
  console.error("DATABASE_URL is not set. Nothing to migrate.");
  process.exit(2);
}
if (!/-pooler\./.test(url)) {
  console.error("DATABASE_URL is not the pooled endpoint (-pooler). Refusing: serverless + direct = exhausted connections.");
  process.exit(2);
}
if (!/sslmode=require/.test(url)) {
  console.error("DATABASE_URL is missing sslmode=require. Neon rejects the handshake without it.");
  process.exit(2);
}

const { default: postgres } = await import("postgres");

const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });

try {
  const file = join(here, "migrate.sql");
  const body = readFileSync(file, "utf8");
  if (!/CREATE TABLE/i.test(body)) {
    console.error(`${file} contains no CREATE TABLE. Refusing to run a file that does nothing.`);
    process.exit(3);
  }

  console.log(`applying ${file} (${body.length.toLocaleString()} bytes)…`);
  await sql.unsafe(body);

  const [{ count }] = await sql`
    SELECT count(*)::int AS count
      FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  const cols = await sql`
    SELECT count(*)::int AS count
      FROM information_schema.columns
     WHERE table_schema = 'public'
  `;

  const required = ["agent_members", "agent_runs", "agent_schedule"];
  const missing = [];
  for (const t of required) {
    const [{ present }] = await sql`
      SELECT to_regclass(${`public.${t}`}) IS NOT NULL AS present
    `;
    if (!present) missing.push(t);
  }

  console.log(`tables=${count} columns=${cols[0].count} required_missing=[${missing.join(",")}]`);

  if (missing.length || count < EXPECTED_MIN) {
    console.error(`FAILED: expected at least ${EXPECTED_MIN} tables and ${required.join("/")}.`);
    process.exit(4);
  }
  console.log("schema is in place");
} catch (e) {
  console.error("migration failed:", e?.message || e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
