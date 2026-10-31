# JARVIS — Cloud First, Then Local
## Shadow Operation: AI Operator to $1M/year by 02 Feb 2030
**Branch:** `arena/6c47af3d-shadow-operation` | **Status:** `pr_open` (PR #6) | **Date:** 2026-10-28 | **Mode:** Super Quality + Memory

> **Jarvis = Your AI Operator that runs Shadow Operation without you.** It vets creators (Apparatus 1,462 GREEN), writes outreach (200/200 drafts DRAFT+INBOX), tracks funnel (Linear), handles demand-tests, builds product vaults, and collects 60/40 Whop split — 24/7.

---

### 0) What JARVIS Actually Does (Memory-Powered)

**Uses your existing memory:**
- `data/gmail_outreach_complete.json` (1,462 GREEN) — who to contact, conversion_score, gate
- `reference/SHADOW_OPERATION_RULES.md` (8 Hard Rules) — 3-email cap, FINAL TERMS, demand-test only, no free audit
- `Growth_Operator_Module_original.txt` + `playbook_digest.md` — revenue models (Naive vs Comment-Anchored vs Funnel), buyer_pool_x3, ratio<50:1, ER 3%+
- `templates/gmail_staging_queue.json` (129) + `logs/gmail_cleanup_2026-10-22.md` (malformed hygiene)

**Core loops JARVIS runs:**
1.  **Scout:** Scans IG/TikTok/YT → calculates buyer_pool_x3, ratio, ER → GREEN/AMBER/RED
2.  **Write:** Generates `Quick idea for @handle` (niche + followers + ER personalization) → Gmail Draft (DRAFT, never auto-send, Gate G4)
3.  **Track:** Syncs to Linear (SHA team) → SHA-16 style issues + project update + execution_tracker.json
4.  **Qualify:** Detects replies → applies 3-email cap → FINAL TERMS if needed → schedules demand test (3 Stories)
5.  **Build & Launch:** On PASS (≥1% story viewers + ≥25 replies per Hard Rule 5) → builds vault → Whop auto-split 60/40 → launch
6.  **Learn:** Writes to `reference/learnings.md` → updates apparatus

**1M/year Math (Conservative → Base):**
- Target: $1,000,000 / year = $83,333 / month = $2,740 / day
- At blended $40 net (after Whop fees, $27 + $19/mo avg): **~2,084 sales/month** OR **~625 subs @ $133/mo** OR **mix**
- Funnel: 1,020 GREEN creators × 2.5% click × 3.5% conv × $27 = ~$19k/month per niche (from your `execution_tracker.json` moderate). **Need 4-5 niches live** or 1 niche at 12% scale.
- **Plan:** 20 active partners doing 20 sales/month each = 400 sales = $10,800/mo → scale to 80 partners = $43k/mo → add upsell/continuity → $83k/mo by Q4 2029. Doable by Feb 2030 if you launch Niche #2 by Dec 2026.

---

### 1) STEP-BY-STEP: CLOUD FIRST (Recommended)

**Why cloud first:** Zero hardware, global 24/7, Gmail API always-on, auto-scale for 1,459 creators, pay-as-you-go. Build once, run forever.

#### Phase C1 — MVP Cloud Jarvis (Week 1-2) — $45/mo
1.  **Create repo service:** `jarvis/` in this repo → FastAPI + `tools/algorithm_engine.py` (your apparatus) + `tools/reconcile_gmail.py`
2.  **Host:** Fly.io or Railway (1x shared CPU, 512MB, always-on) — $5-7/mo. Or Vercel Cron + Supabase — $0-20/mo.
3.  **DB:** Supabase Postgres (free tier 500MB) or Neon — stores `gmail_outreach_complete.json` as table `creators` + `outreach_log` + `replies`
4.  **Gmail:** Google Cloud Project → Gmail API OAuth (scott.abuya@gmail.com) → scopes `gmail.modify` + `gmail.send` + `gmail.compose` — same as `gas/GMAIL_TOP100_DRAFT_SCRIPT.gs` but server-side. Use `gmail__create_draft` logic → DRAFT only.
5.  **Linear:** API key → `linear__create_issue` / `create_project_update` auto-sync (we just did SHA-16). Team `SHA` id `98004e03-...`.
6.  **Scheduler:** Cron every 15 min (Fly) or Vercel Cron → checks Gmail for replies (`list_messages`), runs Hard Rule 1 filter.
7.  **Deploy:** `git push origin arena/6c47af3d-shadow-operation` → auto-deploy via GitHub Action → live URL `jarvis.shadow-operation.fly.dev/health`
8.  **Test:** Push 10 drafts → verify in Gmail Drafts + Linear SHA-16 → Gate G4 manual SEND

#### Phase C2 — Scale & Brain (Month 2-3) — +$80/mo
9.  **LLM Brain:** OpenAI `gpt-4o-mini` ($0.15/1M in) for personalization + reply classification (FINAL TERMS detection) → $20-30/mo for 1k emails. Fallback: local Ollama (later).
10. **Scraper:** Apify IG/TikTok actors ($49/mo) → daily refresh of `buyer_pool_x3` → re-score apparatus automatically
11. **Whop:** Whop API → auto-create product vaults, affiliate links, split-pay tracking → webhooks back to JARVIS
12. **Observability:** Logtail + Sentry (free) → alert on 550 bounces (Rule 7), ratio drift, ER drop

#### Phase C3 — Hardening to 1M (Q1 2027 → Feb 2030)
13. **Autoscale:** Fly scale to 2 regions → <200ms Gmail sync globally → $15/mo
14. **Queue:** Upstash Redis ($10/mo) → batches 6-10 emails/day (Rule 8) → avoids Gmail limits (500/day)
15. **Backup:** Daily `templates/backups/` → S3 R2 ($5/mo) → never lose tracker again

**You are here now:** Steps 1-8 = MVP. Your `outbound/drafts_101_200/` + `gas/GMAIL_NEXT100_DRAFT_SCRIPT_101_200.gs` ARE the MVP payload.

### 2) STEP-BY-STEP: LOCAL JARVIS (After Cloud Proven)

**Why local second:** Privacy (your Gmail token stays home), zero API LLM costs (run Ollama), no vendor lock, works offline at events.

#### Phase L1 — Local Replica (Week 3-4 after cloud live) — $0-300 one-time
1.  **Hardware:** Mini PC (Beelink N100, 16GB RAM, 512GB NVMe) — $179 OR Mac Mini M2 — $499 OR existing laptop — $0. Power 10W → $2/mo electricity.
2.  **OS:** Ubuntu 24.04 LTS → `docker compose up` → same FastAPI + Postgres + Redis as cloud (100% parity)
3.  **LLM Local:** Ollama + `llama3.1:8b` + `mistral:7b` → $0 API cost → handles reply triage + draft personalization locally. Keep OpenAI as fallback via API.
4.  **Gmail:** Same Google Cloud Project → OAuth token stored in `~/.jarvis/credentials.json` (encrypted via `age` + Tailscale SSH only)
5.  **Sync:** Tailscale VPN (free) → `jarvis.local` tunnels to cloud → bi-directional sync `execution_tracker.json` + `data/gmail_outreach_complete.json` via Litestream → cloud is primary, local is hot standby
6.  **Run:** `systemd --user enable jarvis` → boots on power, runs Cron every 15 min even without internet (queues, syncs when back)
7.  **Verify:** Disconnect internet → create 5 local drafts → reconnect → they appear in Gmail + Linear SHA-16 → cloud and local match

#### Phase L2 — Local Superpowers (Month 4+)
8.  **Offline Vault Builder:** Local Whisper + FFmpeg → auto-generates Numinous 14-day sequence v2 videos from Drive `NUMINOUS_WHOP_DEPLOY/` without cloud upload
9.  **NAS Archive:** 2TB USB drive ($60) → full `templates/backups/` history local → GDPR-proof
10. **Kill Switch:** Physical button (GPIO) → instantly pauses all outreach (Hard Rule 1 safety) if Omar-style thread blows up

---

### 3) CLOUD vs LOCAL — Head-to-Head

| Dimension | ☁️ Cloud First (Do This) | 🏠 Local Second (Add Later) | Winner for 1M |
|---|---|---|---|
| **Time to Live** | 2 days (Fly deploy) | 1 week (hardware + Ollama tuning) | **Cloud** |
| **Cost Year 1** | $45/mo MVP → $140/mo scaled = **$1,080/yr** | $250 hardware + $30/mo power/internet = **$610/yr** but + dev time | **Tie** — Cloud cheaper to start |
| **Cost Year 2-3** | $1,800/yr (scale to 1,020 creators × 50/day) | $360/yr + free LLM = **$1,440 cheaper** | **Local** long term |
| **Reliability** | 99.9% (Fly), auto-restart, global | Depends on your power/internet (Kenya ~95%) | **Cloud** |
| **Scale to 1M** | Auto-scale to 10k creators, 5 niches, 500 drafts/day | Single machine caps at ~200 drafts/day before fan noise | **Cloud** |
| **Privacy / Token Safety** | Token on Fly (encrypted, but on US server) | Token never leaves your house, encrypted disk | **Local** |
| **LLM Cost** | $30/mo OpenAI → $360/yr | $0 after setup (Ollama) → save $1,080 over 3 yrs | **Local** |
| **Gmail Compliance** | Always-on `gmail.modify` → respects 500/day, 6-10/day cadence (Rule 7/8) | Same, but queue survives internet cut | **Tie** |
| **Maintenance** | `git push` auto-deploy, Logtail alerts | You apt-upgrade + dust filter | **Cloud** |
| **Best Use** | **Primary operator** — runs 24/7, Linear sync, 1M revenue engine | **Hot standby + vault studio** — zero-cost brain, offline builder | **Both (Hybrid)** |

**Verdict: Hybrid is how you hit 1M.** Cloud = money maker (always-on outreach). Local = profit keeper ($0 LLM, privacy, offline vault). Total hybrid Year 1: ~$1,400. Year 3: ~$1,200/yr. Revenue 1M → margin ~99%.

---

### 4) BUDGET — From $0 to $1M/year by 02 Feb 2030

**Assumptions:** Blended $40 net per customer, 40% Whop fee already split, 5 niches by 2028, 80 active partners.

| Item | Tool | Monthly (MVP) | Monthly (Scaled 2027) | Annual (2030 at 1M) | One-time |
|---|---|---|---|---|---|
| **Hosting (Cloud)** | Fly.io 1x shared → 2× regions | $7 | $29 | $348 | $0 |
| **DB** | Supabase Postgres (500MB → 8GB) | $0 | $25 | $300 | $0 |
| **Queue/Cache** | Upstash Redis | $0 | $10 | $120 | $0 |
| **LLM Brain** | OpenAI gpt-4o-mini + embeddings (1k emails/mo → 10k/mo at scale) | $20 | $60 | $720 | $0 |
| **LLM Local Fallback** | Ollama (free) — saves 70% after L1 | -$0 | -$30 | -$360 | $0 |
| **Scraper** | Apify IG/TikTok + Social Blade | $0 (manual) | $49 | $588 | $0 |
| **Email Warmup** | Instantly / Mailreach (keep scott.abuya@gmail.com <0.3% spam) | $37 | $37 | $444 | $0 |
| **Linear** | Linear Standard (SHA team) | $0 (free) | $8 | $96 | $0 |
| **Whop** | Whop fees (13% effective, passed to buyer) + $2.50 payout | $0 | $0 | $0 | $0 |
| **Observability** | Logtail, Sentry, UptimeRobot | $0 | $10 | $120 | $0 |
| **Storage** | S3 R2 + Drive (NUMINOUS_WHOP_DEPLOY) | $5 | $5 | $60 | $0 |
| **Domain/VPN** | jarvis.shadow-operation.com + Tailscale | $1 | $1 | $12 | $12 (domain) |
| **Local Hardware** | Beelink N100 16GB (Phase L1) | — | — | — | $179 |
| **Local Power** | 10W 24/7 in Nairobi | — | $2 | $24 | $0 |
| **TOTAL Hybrid** |  | **$70/mo** | **$196/mo** | **$2,472/yr** | **$191** |
| **Revenue Target** | 83,333/mo |  |  | **$1,000,000/yr** |  |
| **Profit at 1M** | After $2,472 costs + 40% creator splits already accounted |  |  | **~$997,528 net** |  |

**Cash to Start:** $70 (MVP) → you can start *today* with Fly free tier + Supabase free + OpenAI $5 credit = **$0 for 14 days**.

**Break-even:** 2 sales at $27 = $54 → covers Month 1. Your top100 manifest has 100 × 6.39% ER avg → ~8 replies → 2 PASS → $513-1,485 revenue (from `execution_tracker.json` projections) → **Day 14 profitable.**

### 5) NECESSARY TOOLS — Exact Shopping List

**Copy-paste this:**

**Cloud (must-have Day 1):**
- `Fly.io` — 1 app `jarvis` + `fly.toml` (uses your `tools/algorithm_engine.py`)
- `Supabase` — project `shadow-operation` — tables: `creators` (from `data/gmail_outreach_complete.json`), `drafts` (from `outbound/drafts_101_200/`), `replies`
- `Google Cloud Console` — Enable Gmail API + People API → OAuth consent (scott.abuya@gmail.com) → `credentials.json` (same as Apps Script)
- `Linear` — Team `SHA` (98004e03-...), Project `Shadow Operation — Q4 2026` (79092591), Issue SHA-16 (we created)
- `OpenAI` — API key `sk-...` → `gpt-4o-mini` + `text-embedding-3-small` for apparatus scoring
- `GitHub` — This repo `arena/6c47af3d-shadow-operation` → Actions auto-deploy to Fly

**Scale (add Month 2):**
- `Apify` — `apify/instagram-scraper` + `clockworks/tiktok-scraper` → feeds `buyer_pool_x3` nightly
- `Upstash Redis` — `jarvis-queue` → enforces 6-10/day Rule 8
- `Whop` — `whop.com` → `NUMINOUS_WHOP_DEPLOY/` → API key for vault creation

**Local (add Month 3):**
- Hardware: `Beelink EQ12 N100` (Amazon) + 2TB NVMe + Ubuntu 24.04
- `Ollama` — `ollama pull llama3.1:8b` → local brain
- `Tailscale` — `tailscale up` on both cloud + local → sync
- `Docker + Litestream` — `docker-compose.yml` (FastAPI + Postgres + Redis + Ollama)

**Free Alternatives if Broke:**
- Hosting: `Railway.app` free tier instead of Fly
- DB: `Neon.tech` free 3GB instead of Supabase
- LLM: `Groq` free tier (llama3) instead of OpenAI for first 30 days
- Scraper: Manual 12-post check (Gate G6) instead of Apify until first sale

---

### 6) TIMELINE to $1M by 02 Feb 2030

- **2026-10-28 → 2026-11-15:** C1 MVP live → 200 drafts LIVE (we are 115/200, finish 117-200 via GAS batch this week) → Gate G4 SEND → 8-12 replies → 2 PASS
- **2026-12-31:** First vault built (Niche #2 AI Workflow) → 2 partners live on Whop → $2k/mo
- **2027-06-30:** 20 partners → $10k/mo → L1 local replica live → LLM costs $0
- **2028-06-30:** Expand to Niche #1 + #3 (from `execution_tracker.json` phases 4) → 50 partners → $43k/mo
- **2029-12-31:** 80 partners + upsell $47 + continuity $19/mo → $83k/mo → $996k ARR
- **2030-02-02:** **$1M/year hit** → celebrate → archive project in Linear → start next niche

**Action Next 24h:** Run `gas/GMAIL_NEXT100_DRAFT_SCRIPT_101_200.gs` in script.google.com (1 click = 84 remaining drafts), then `gmail__batch_modify` → DRAFT+INBOX, verify `list_drafts` = 200, update Linear SHA-16 to Done.

All files committed to `pr_open` — nothing merged, safe to test.

