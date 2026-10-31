-- Base tables (creators etc already exists from older migrate)
-- Run in Neon SQL Editor: copy paste this whole file once
CREATE TABLE IF NOT EXISTS user_vault (
  user_id TEXT PRIMARY KEY,
  tier TEXT DEFAULT 'none',
  pod_id TEXT,
  scripts INT DEFAULT 0,
  streak INT DEFAULT 0,
  posts_7d INT DEFAULT 0,
  last_post_at TIMESTAMP,
  last_agent_use TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS pods (
  pod_id TEXT PRIMARY KEY,
  name TEXT,
  member_count INT DEFAULT 0,
  streak INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS pod_members (
  pod_id TEXT,
  user_id TEXT,
  streak INT DEFAULT 0,
  posts_7d INT DEFAULT 0,
  last_post_at TIMESTAMP,
  PRIMARY KEY (pod_id, user_id)
);
CREATE TABLE IF NOT EXISTS retention_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  offer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS wins (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  proof_url TEXT,
  views INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS revenue_log (
  id TEXT PRIMARY KEY,
  source TEXT,
  amount NUMERIC,
  paid_at TIMESTAMP DEFAULT NOW()
);
-- Adaptable niches/pods branding — no hardcoded niches in app code, Grok WF1 writes here
CREATE TABLE IF NOT EXISTS solo_domains (
  id TEXT PRIMARY KEY,
  name TEXT,
  niche TEXT,
  brand_voice TEXT DEFAULT 'Vesper 20yo playful witty adaptive',
  youtube_channel_id TEXT,
  buffer_profile_ids TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE solo_domains ADD COLUMN IF NOT EXISTS brand_voice TEXT;
ALTER TABLE solo_domains ADD COLUMN IF NOT EXISTS buffer_profile_ids TEXT;
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
-- Seed adaptable defaults (override via ADMIN_EMAIL /admin → Create Niche)
INSERT INTO app_config (key, value) VALUES ('niches_pool','Psychology,Dark Psychology,Marketing History,Mindset,Wolf Mindset,Consumerism,Self-Improvement,Finance Behavior') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('pages_count','5') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('threshold_ratio_green','50') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('threshold_er_green','5') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('whop_ladder','27+9+79+19') ON CONFLICT DO NOTHING;
-- Seed 6 pods Red..Purple max 5 each for pod accountability next (Good-Better-Best)
INSERT INTO pods (pod_id, name) VALUES ('pod_red','Pod Red'),('pod_blue','Pod Blue'),('pod_green','Pod Green'),('pod_yellow','Pod Yellow'),('pod_purple','Pod Purple'),('pod_teal','Pod Teal') ON CONFLICT DO NOTHING;
