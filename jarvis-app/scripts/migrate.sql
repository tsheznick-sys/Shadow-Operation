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

-- ============ 2026-10-31 · TEAM AUTH + INTERVIEW + FUNDING ============
-- 3 seats (owner / content / social). Passwords live in env, not here.
CREATE TABLE IF NOT EXISTS team_profiles (
  email TEXT PRIMARY KEY,
  name TEXT,
  role TEXT CHECK (role IN ('owner','content','social')),
  answers JSONB DEFAULT '{}'::jsonb,
  completeness INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS team_profiles_role_idx ON team_profiles (role);

-- Every privileged action gets a row: who, what, when.
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT,
  action TEXT,
  detail JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);

-- Monthly 14-day sequence assets (Growth Operator book). Content bodies live in R2; this is the index.
CREATE TABLE IF NOT EXISTS sequence_assets (
  id BIGSERIAL PRIMARY KEY,
  cycle TEXT,                     -- e.g. 2026-11
  day INT,                        -- 1..14
  phase TEXT CHECK (phase IN ('warm_up','value_delivery','money_days')),
  slide_no INT,
  headline TEXT,
  body TEXT,
  cta TEXT,
  asset_url TEXT,                 -- R2 object key
  prompt_hash TEXT,
  approved BOOL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sequence_assets_cycle_idx ON sequence_assets (cycle, day, slide_no);

-- Follower gate: TikTok + IG only start the sequence after 1,000 each.
CREATE TABLE IF NOT EXISTS follower_gate (
  platform TEXT PRIMARY KEY,
  followers INT DEFAULT 0,
  unlocked BOOL DEFAULT FALSE,
  unlocked_at TIMESTAMP,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Funding ledger: what the community pot did each month.
CREATE TABLE IF NOT EXISTS funding_ledger (
  id BIGSERIAL PRIMARY KEY,
  period TEXT,                    -- 2026-11
  circle_revenue NUMERIC DEFAULT 0,
  tools_paid NUMERIC DEFAULT 0,
  prizes_paid NUMERIC DEFAULT 0,
  annual_fund NUMERIC DEFAULT 0,
  reserve NUMERIC DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO app_config (key, value) VALUES ('autopay_authority','not_granted') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('follower_gate_ig','1000') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('follower_gate_tiktok','1000') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('sequence_cadence','monthly') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('churn_alert_pct','2.0') ON CONFLICT DO NOTHING;
INSERT INTO app_config (key, value) VALUES ('niches_pool','Stickman Finance,Psychology,Dark Psychology,Marketing History,Mindset,Wolf Mindset,Consumerism,Self-Improvement,Finance Behavior') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO follower_gate (platform, followers, unlocked) VALUES ('instagram',0,false),('tiktok',0,false) ON CONFLICT DO NOTHING;

-- ── THE OPEN LEDGER (public proof) ────────────────────────────────────────────
-- Every real day of every real channel, including the failures.
-- Written by WF9 from Buffer/IG/TikTok/YT analytics. Read by the public /proof page
-- with a 24h lag so nothing can be edited after the fact.
CREATE TABLE IF NOT EXISTS public_ledger (
  id           BIGSERIAL PRIMARY KEY,
  brand        TEXT        NOT NULL,
  platform     TEXT        NOT NULL,
  day          INT         NOT NULL,
  views        BIGINT      NOT NULL DEFAULT 0,
  er_pct       NUMERIC(5,2) NOT NULL DEFAULT 0,
  comments     INT         NOT NULL DEFAULT 0,
  replies      INT         NOT NULL DEFAULT 0,
  posted       INT         NOT NULL DEFAULT 0,
  note         TEXT        DEFAULT '',
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand, platform, day)
);
CREATE INDEX IF NOT EXISTS idx_public_ledger_day ON public_ledger (day DESC);

COMMENT ON TABLE public_ledger IS
  'Public proof ledger — shown on /proof. Never delete a bad day: hiding a failure destroys the only trust signal we have.';

-- ── THE 14-DAY CHALLENGE (trust engine: "DO") ────────────────────────────────
-- Free to join, expensive to finish. Cohorts run monthly (cohort = 'YYYY-MM').
-- Jarvis sends the daily action at 06:00, verifies links, scores, and invites finishers.
CREATE TABLE IF NOT EXISTS challenge_members (
  id          TEXT PRIMARY KEY,
  handle      TEXT        NOT NULL,
  niche       TEXT        NOT NULL,
  email       TEXT        DEFAULT '',
  joined_day  INT         NOT NULL DEFAULT 1,
  cohort      TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cohort, handle)
);
CREATE INDEX IF NOT EXISTS idx_challenge_members_cohort ON challenge_members (cohort);

CREATE TABLE IF NOT EXISTS challenge_checkins (
  member_id   TEXT        NOT NULL REFERENCES challenge_members(id) ON DELETE CASCADE,
  day         INT         NOT NULL CHECK (day BETWEEN 1 AND 14),
  link        TEXT        DEFAULT '',
  note        TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, day)
);

-- One row per member: the number the cohort board and the upgrade decision read.
CREATE TABLE IF NOT EXISTS challenge_scores (
  member_id   TEXT PRIMARY KEY REFERENCES challenge_members(id) ON DELETE CASCADE,
  checked_in  INT         NOT NULL DEFAULT 0,
  streak      INT         NOT NULL DEFAULT 0,
  score       INT         NOT NULL DEFAULT 0,
  status      TEXT        NOT NULL DEFAULT 'active',  -- active | quiet | finisher | dropped
  verdict     TEXT,                                    -- PASS | AMBER | RED (day 13)
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE challenge_scores IS
  'Completion rate is the only predictor of upgrade. 10/14 days + a day-13 verdict = finisher.';

-- ── CHALLENGE v2: operator gate + verified numbers ───────────────────────────
-- Operators only. The gate is 14 days of PAID tenure, not eagerness. Entry fee $0.
ALTER TABLE challenge_members ADD COLUMN IF NOT EXISTS tier             TEXT NOT NULL DEFAULT 'none';
ALTER TABLE challenge_members ADD COLUMN IF NOT EXISTS paid_since       TIMESTAMPTZ;
ALTER TABLE challenge_members ADD COLUMN IF NOT EXISTS share_results    BOOLEAN NOT NULL DEFAULT false;

-- claimed vs verified, so a member cannot inflate a number and win the board
ALTER TABLE challenge_checkins ADD COLUMN IF NOT EXISTS claimed         INT;
ALTER TABLE challenge_checkins ADD COLUMN IF NOT EXISTS actual          INT;
ALTER TABLE challenge_checkins ADD COLUMN IF NOT EXISTS mismatch_pct    INT NOT NULL DEFAULT 0;
ALTER TABLE challenge_checkins ADD COLUMN IF NOT EXISTS verify_status   TEXT NOT NULL DEFAULT 'api_missing';
  -- verified | mismatch | api_missing | unreachable
ALTER TABLE challenge_checkins ADD COLUMN IF NOT EXISTS counted         BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_checkins_unverified ON challenge_checkins (verify_status)
  WHERE verify_status <> 'verified';

COMMENT ON COLUMN challenge_checkins.verify_status IS
  'api_missing days still count but are excluded from the leaderboard top 3. mismatch days do not count until corrected.';

-- Gate helper: days of paid tenure for a handle.
CREATE OR REPLACE VIEW challenge_eligibility AS
SELECT m.id, m.handle, m.tier,
       COALESCE(EXTRACT(DAY FROM now() - m.paid_since), 0)::int AS paid_tenure_days,
       (m.tier <> 'none' AND COALESCE(EXTRACT(DAY FROM now() - m.paid_since), 0) >= 14) AS eligible
FROM challenge_members m;

-- ── LEDGER v2: opt-in revenue sharing ────────────────────────────────────────
-- Public by default: views, ER, comments, replies, posts.
-- Revenue is ADMIN ONLY unless that brand turns sharing on themselves.
CREATE TABLE IF NOT EXISTS ledger_brand_settings (
  brand           TEXT PRIMARY KEY,
  share_revenue   BOOLEAN NOT NULL DEFAULT false,   -- opt-in, never assumed
  share_buyers    BOOLEAN NOT NULL DEFAULT false,
  opted_in_at     TIMESTAMPTZ,
  opted_in_by     TEXT
);

COMMENT ON TABLE ledger_brand_settings IS
  'Nobody publishes someone else''s revenue. A brand opts itself in, or it stays admin-only.';

-- ── SELF-IMPROVEMENT (WF15) ──────────────────────────────────────────────────
-- A hunch may be tested, never shipped. One variable per test, 20% holdout.
CREATE TABLE IF NOT EXISTS experiments (
  id                TEXT PRIMARY KEY,
  stage             TEXT NOT NULL CHECK (stage IN ('self','operation','money')),
  page              TEXT NOT NULL,
  variable          TEXT NOT NULL,
  incumbent         TEXT NOT NULL,
  challenger        TEXT NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  sample            INT  NOT NULL DEFAULT 0,
  incumbent_score   NUMERIC(12,4) NOT NULL DEFAULT 0,
  challenger_score  NUMERIC(12,4) NOT NULL DEFAULT 0,
  outcome           TEXT NOT NULL DEFAULT 'running'
                    CHECK (outcome IN ('running','promoted','killed','inconclusive')),
  note              TEXT
);

-- What actually works, per niche. Archived on retirement, never deleted —
-- so a dead idea is not retried in six months under a new name.
CREATE TABLE IF NOT EXISTS playbook (
  key          TEXT PRIMARY KEY,
  stage        TEXT NOT NULL,
  page         TEXT NOT NULL,
  rule         TEXT NOT NULL,
  wins         INT  NOT NULL DEFAULT 0,
  losses       INT  NOT NULL DEFAULT 0,
  promoted_at  TIMESTAMPTZ,
  retired_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_playbook_live ON playbook (wins DESC) WHERE retired_at IS NULL;

-- ── SCALEOUT (WF16) ──────────────────────────────────────────────────────────
-- One row per page. Revenue is read PER PAGE — an average hides a dead one.
CREATE TABLE IF NOT EXISTS page_portfolio (
  page        TEXT PRIMARY KEY,
  niche       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'cloning'
              CHECK (status IN ('live','cloning','graduated','archived')),
  template_of TEXT,                                  -- which graduated page this was cloned from
  template_ver TEXT,
  graduating  JSONB,                                 -- the eight gate results at decision time
  revenue     NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost        NUMERIC(12,2) NOT NULL DEFAULT 0,
  fails       INT NOT NULL DEFAULT 0,                -- 72h demand-test failures
  graduated_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE page_portfolio IS
  'Duplication rule: a page must clear all eight graduation gates before its template may be cloned.';

-- ── RELIABILITY (three separate targets, never one headline) ─────────────────
-- correct_or_caught = correct OR blocked before shipping (caught errors count as wins)
-- end_to_end        = full 8-stage runs completing correctly
-- money             = prices, payouts, entitlements, refunds, ledger rows (100%, human gate)
CREATE TABLE IF NOT EXISTS reliability_daily (
  day                DATE PRIMARY KEY,
  outbound_total     INT NOT NULL DEFAULT 0,
  outbound_ok        INT NOT NULL DEFAULT 0,
  outbound_blocked   INT NOT NULL DEFAULT 0,
  runs_total         INT NOT NULL DEFAULT 0,
  runs_ok            INT NOT NULL DEFAULT 0,
  money_total        INT NOT NULL DEFAULT 0,
  money_ok           INT NOT NULL DEFAULT 0,
  policy_blocks      INT NOT NULL DEFAULT 0,
  silent_failures    INT NOT NULL DEFAULT 0,   -- the only number that is never acceptable
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reliability_daily IS
  'Three targets, three columns. A caught error is a win; a silent one is the only real failure.';

-- ── DUAL OUTPUT (raw -> Whop, edited -> public) ──────────────────────────────
CREATE TABLE IF NOT EXISTS asset_cuts (
  id             TEXT PRIMARY KEY,
  script_id      TEXT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('raw','edited')),
  destination    TEXT NOT NULL,
  policy_pass    BOOLEAN NOT NULL DEFAULT false,
  policy_failed  JSONB,
  blocked        BOOLEAN NOT NULL DEFAULT false,
  body_hash      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_asset_cuts_blocked ON asset_cuts (blocked) WHERE blocked = true;

COMMENT ON TABLE asset_cuts IS
  'One script, two cuts. If the public cut fails the policy gate the asset does not ship — the raw cut still reaches the community.';

-- ============================================================
-- PAGE LAW (2026-10-31) — one niche per page, enforced by the database.
-- The 6 channels are surfaces of one page. They are not 6 pages.
-- ============================================================
ALTER TABLE solo_domains ADD COLUMN IF NOT EXISTS cluster      TEXT;
ALTER TABLE solo_domains ADD COLUMN IF NOT EXISTS angle        TEXT;
ALTER TABLE solo_domains ADD COLUMN IF NOT EXISTS audience     TEXT;
ALTER TABLE solo_domains ADD COLUMN IF NOT EXISTS visual_world TEXT;
ALTER TABLE solo_domains ADD COLUMN IF NOT EXISTS slot_status  TEXT NOT NULL DEFAULT 'assigned';

-- The actual fix: two pages can no longer share a niche.
-- Before this index, cloning 6 pages produced 6 identical niches and nothing objected.
CREATE UNIQUE INDEX IF NOT EXISTS solo_domains_niche_uniq
  ON solo_domains (lower(regexp_replace(coalesce(niche,''), '[^a-zA-Z0-9]', '', 'g')));

-- Policy is not taste: these niches have no row, ever.
ALTER TABLE solo_domains DROP CONSTRAINT IF EXISTS solo_domains_no_banned_niche;
ALTER TABLE solo_domains ADD CONSTRAINT solo_domains_no_banned_niche CHECK (
  lower(coalesce(niche,'')) NOT SIMILAR TO '%(finance|investing|credit|debt|health|medical|legal|crypto|trading)%'
);

-- 6 channels per page, 2 of them YouTube, longform is page 1.
CREATE TABLE IF NOT EXISTS page_channels (
  id          SERIAL PRIMARY KEY,
  page_id     TEXT NOT NULL REFERENCES solo_domains(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL,
  kind        TEXT NOT NULL,
  is_page_one BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','killed')),
  -- every public surface carries the edited cut; raw lives on Whop only
  cut         TEXT NOT NULL DEFAULT 'edited' CHECK (cut IN ('edited')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (page_id, platform, kind)
);

-- Longform YouTube is the main page, and there is exactly one of it per page.
CREATE UNIQUE INDEX IF NOT EXISTS page_channels_one_page_one
  ON page_channels (page_id) WHERE is_page_one;

COMMENT ON TABLE page_channels IS
  '6 surfaces per page: 2 YouTube (longform = page one) + TikTok + IG + FB + X. Raw cuts never appear here.';

-- ============================================================
-- BOARD (2026-10-31) — three partners, and the things one person may not decide alone.
-- ----------------------------------------------------------------------------
-- The Content Guy proposes the niche. Jarvis brings the market scan. The owner holds the
-- key. None of those three is sufficient on its own, which is the entire point of a board.
-- ============================================================
CREATE TABLE IF NOT EXISTS board_meetings (
  id          SERIAL PRIMARY KEY,
  held_on     DATE NOT NULL DEFAULT CURRENT_DATE,
  title       TEXT NOT NULL,
  agenda      JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- 3 of 3. A meeting without all three partners is a conversation, not a decision.
  attendees   TEXT[] NOT NULL DEFAULT '{}',
  quorum_met  BOOLEAN NOT NULL DEFAULT false,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS board_motions (
  id          SERIAL PRIMARY KEY,
  meeting_id  INT REFERENCES board_meetings(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN (
                'launch_page','kill_page','price_change','spend','niche_choice',
                'policy_override','cadence','angle','other')),
  motion      TEXT NOT NULL,
  evidence    JSONB NOT NULL DEFAULT '[]'::jsonb,
  votes       JSONB NOT NULL DEFAULT '{}'::jsonb,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','passed','rejected','blocked')),
  decided_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE board_motions IS
  'launch_page, kill_page, price_change, spend, niche_choice and policy_override require 3 of 3. Everything else is 2 of 3.';

-- ============================================================
-- STICKMAN AGENT (2026-10-31) — the product inside the community.
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_members (
  id             TEXT PRIMARY KEY,
  tier           TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','circle','pro','max')),
  joined_via     TEXT NOT NULL DEFAULT 'funnel' CHECK (joined_via IN ('funnel','direct_community','referral')),
  watermark      BOOLEAN NOT NULL DEFAULT true,
  publish_passes INT NOT NULL DEFAULT 0,
  flagged        BOOLEAN NOT NULL DEFAULT false,
  window_started TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_in_window INT NOT NULL DEFAULT 0,
  used_this_month INT NOT NULL DEFAULT 0,
  month_key      TEXT NOT NULL DEFAULT to_char(NOW(),'YYYY-MM'),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id          BIGSERIAL PRIMARY KEY,
  member_id   TEXT REFERENCES agent_members(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('script','render','clip','schedule','audit','community')),
  status      TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','blocked','failed','retried')),
  cost        NUMERIC(8,4) NOT NULL DEFAULT 0.008,
  asset_id    TEXT,
  detail      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_runs_member_time ON agent_runs (member_id, created_at DESC);

CREATE TABLE IF NOT EXISTS agent_schedule (
  id          BIGSERIAL PRIMARY KEY,
  member_id   TEXT REFERENCES agent_members(id) ON DELETE CASCADE,
  page_ref    TEXT NOT NULL,
  platform    TEXT NOT NULL CHECK (platform IN ('youtube_longform','youtube_shorts','tiktok','instagram','facebook')),
  publish_at  TIMESTAMPTZ NOT NULL,
  asset_id    TEXT NOT NULL,
  watermark   BOOLEAN NOT NULL DEFAULT true,
  gate_status TEXT NOT NULL DEFAULT 'pending' CHECK (gate_status IN ('pending','g4_review','pass','blocked','published')),
  blocked_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_schedule_due ON agent_schedule (publish_at) WHERE gate_status IN ('pending','g4_review');

COMMENT ON TABLE agent_members IS
  'Free = 20 runs/5h and a watermark on every export. Paid = clean. Three clean publishes earn auto-publish.';
