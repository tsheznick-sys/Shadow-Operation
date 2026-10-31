-- Neon Postgres — Run once in Neon SQL Editor
create table creators (handle text primary key, platform text, followers int, avg_comments int, buyer_pool_x3 int, ratio numeric, er numeric, gate text, niche text, source text);
create table drafts (id text primary key, handle text, subject text, body text, gate text, status text, created_at timestamp default now());
create table replies (thread_id text, message_id text primary key, body text, classification text, action text, created_at timestamp default now());
create table bros (email text primary key, name text, role text, is_super_admin boolean, niches text[]);
create table snapshots (id text primary key, handle text, views int, replies int, need int, pass boolean, created_at timestamp default now());
-- Copy from data/gmail_outreach_complete.json 1,462 GREEN → creators
-- Copy from outbound/drafts_101_200 → drafts
