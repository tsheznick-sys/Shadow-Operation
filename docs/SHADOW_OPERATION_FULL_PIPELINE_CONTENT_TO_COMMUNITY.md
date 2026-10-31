# SHADOW OPERATION — Full Pipeline
## From Content → Digital Products → Private Communities
**Branch:** `arena/6c47af3d-shadow-operation` | **PR:** #6 `pr_open` | **Target:** $1M/year by 2030 | **Mode:** Super Quality + Memory

> **This is YOUR Shadow Operation, not a client operation.** You are the creator, the operator, and the closer. This pipeline turns your content into cash and your buyers into a cult community — all run by JARVIS.

---

## 0) MEMORY — What You Already Have (Use It)

- **Apparatus 1,462 GREEN** (`data/gmail_outreach_complete.json`) — you know how to spot winners (buyer_pool_x3, ratio<50:1, ER 3%+). Now apply it to *your own* content.
- **8 Hard Rules** (`reference/SHADOW_OPERATION_RULES.md`) — no free audits, demand test gate, 3-email cap. Flip them: your community enforces them.
- **Product Blueprint** (`data/product_blueprint.md`) — AI Creator Workflow System ($27 + $19/mo) — your Phase 1 product.
- **Vault Assets** (`daily/2026-10-10/` + `gas/NUMINOUS_WHOP_DEPLOY`) — 14-day sequence, captions, DM replies — repurpose for your own Numinous.
- **JARVIS Cloud→Local** (`docs/JARVIS_CLOUD_VS_LOCAL_1M_2030.md`) — your operator that now runs *you*.

---

## 1) CONTENT ENGINE — Make Content That Sells (Not Just Views)

**Goal:** 6 posts/day on auto-pilot (Publisher: 8s Hook + 32s Trust) → 1 product sold per 150 engaged views.

### A) Content Pillars (3 Only — All Tie to Product)

| Pillar | What You Post | Example Hook (8s) | Product Tie |
|---|---|---|---|
| **1. Leaks** | You leak your prompts/workflows, not theory | “I fed Higgsfield this 1 ChatGPT prompt → 3 cinematic shots in 8s (prompt in vault)” | $27 Starter (35+ prompts) |
| **2. Teardowns** | You tear down viral AI videos (like `quietwolfzz` 514K pattern) | “This @quietwolfzz reel did 3M views — here’s the 1 buyer_pool lever it missed” | $27 Pro (5 automations) |
| **3. Proof** | You show demand tests, Stripe, replies | “3 Stories → 41 replies → 1 vault sale — demand test PASSED (Gate G6)” | $47 Complete + $19/mo Notion |

**Rule:** Every post ends with 1 CTA: Comment `VAULT` → ManyChat → DM.

### B) Production Pipeline — 8s / 32s / 60s (Flow Wisely)

**Stack (no-card Tier 0 → Tier 2 free):**
- **Tier 0 Pillow:** HD mock (0cr) — for thumbnails, carousels
- **Tier 2 Wan 1.3B (Colab T4 free):** 8s cinematic hook (Higgsfield style) — 5 min/render
- **Tier 1 Higgsfield UI manual:** 32s trust + 60s longform — you click, no API card needed
- **Edit:** `tools/full_edit.py` (71kb/s, `-map` audio fix) + `tools/production_pipeline.py` → 8s/32s/60s cuts
- **Voiceover:** `tools/voiceover_stage.py` (Piper 1.8.0, 5.97s, 71kb/s) — your voice, not gTTS

**Daily SOP (60 min with JARVIS):**
1.  **08:00** JARVIS picks 1 leak from `MONETIZATION_VERDICTS.md` + 1 teardown from `templates/creator_tracker.csv` + 1 proof from `logs/gmail_top100_push_log.csv`
2.  **08:15** You record 3 hooks (phone, 8s each) → push to `/outbound/renders/`
3.  **08:30** `python3 tools/production_pipeline.py --in 8s --out 32s --cr edit` → 6 videos queued (3 hooks × 2 cuts)
4.  **08:45** JARVIS writes captions (from `NUMINOUS_WHOP_DEPLOY/captions.txt`) + hashtags → `marketing/publisher/backend/main.py` schedules 6/day (queue38, 6/day ET, G4 16cr/32s)
5.  **09:00** Done. Publisher posts while you sleep.

**Output:** 42 videos/week = 168/month → at 5% ER on 10K followers = 500 engaged/post × 168 = 84K engaged → 1.5% click × 3.5% conv × $27 = **$1,190/mo at 10K** (scales linearly).

---

## 2) DISTRIBUTION — Publisher to IG + TikTok + YT

**Goal:** One video → 3 platforms → 1 Whop → ManyChat auto-DM → sale or community join. All 6/day, no manual posting.

### A) Publisher Stack

- **Scheduler:** `tools/social_scheduler.py` (queue38, 70 queue) + `marketing/publisher/backend/` (FastAPI)
  - `POST /api/schedule` → creates 8s/32s/60s variants → pushes to IG Graph API + TikTok API + YT Shorts
  - Rate: **6/day max** (Hard Rule 8) → protects deliverability, avoids spam flag
  - Gate G4 approve: you swipe YES in app or Linear SHA issue before it posts
- **ManyChat:** 8 channels live (IG DM, TikTok DM, YT comment, Email, Telegram, Discord, WhatsApp, SMS)
  - Keyword `VAULT` → auto-DM: “Proof = your demand test. Want the 1-page teardown? Reply YES” (Hard Rule 4 niche framing)
  - Longform: 8s hook (ManyChat trigger) + 32s Trust (auto-DM sequence) → no audit before YES (Rule 2)
- **Cross-post:** One p01_32s_9x16.mp4 → `ffmpeg` Katana → 9x16 (IG/TikTok), 16x9 (YT), 1x1 (FB) → `schedule38` queue70

### B) Distribution SOP

1.  **Mon:** JARVIS publishes “Leak” pillar to IG + TikTok (6 videos)
2.  **Tue:** “Teardown” pillar to YT + IG (6 videos)
3.  **Wed:** “Proof” pillar to all 3 (6 videos)
4.  **Repeat:** Comments → ManyChat auto-DM by keyword → Whop Vault behind — zero build on your side, 60/40 if partner says YES (now *your* product)
5.  **Cleanup:** `tools/reconcile_gmail.py` syncs Gmail → `creator_tracker.csv` → never lose a send

**Metrics to Watch (not vanity followers):**
- `buyer_pool_x3` (avg_comments ×3) → trustworthy pool
- `ratio <50:1` (likes:comments) → depth, not viral junk
- `ER 3%+` (ideal 5%+) → engaged, not dead
- `Demand Test PASS` = ≥1% story views + ≥25 replies → BUILD (Hard Rule 5)

---

## 3) FUNNEL — From Comment → Cash (Short + Long)

**Goal:** Short 8s (impulse $27) + Long 32s (trust → $47 + community). Both end in Whop.

### Short Funnel (8s Hook) — For Cold
1.  Post 8s hook (Higgsfield) → “Comment VAULT”
2.  ManyChat instant DM → 1-page note (your `outreach_BATCH_1000_GREEN...` teardown style, 90 words, 0 links, G4 human-send) + Whop $27 Starter link
3.  If YES → Gumroad/Whop checkout → deliver Starter vault (35 prompts) → upsell $9 bump (+10 prompts)
4.  If ghost after 2 emails + Oct 28 bump → X/TikTok DM where they live (Hard Rule 8: try_dm)

### Long Funnel (32s Trust) — For Warm
1.  Post 32s Trust (your face + story + leak) → “Comment SYSTEM”
2.  ManyChat sequence (3 DMs over 24h) → 1-page Publisher + auto-DM + Whop Vault teardown (6/day system, 60/40) → Whop $79 + $19/mo
3.  Demand test (Hard Rule 2 exception): They reply YES → you build audit + story scripts (not before)
4.  Build → launch via Whop clipping ($1.50-2 CPM, cheap distro) → community invite

**Both funnels run 6/day Publisher + auto-DM → zero build until YES.**

---

## 4) PRODUCTS — Digital Ladder ($27 → $9 → $79 → $19/mo)

**Goal:** 3 tiers + continuity → $40 blended net → 1M math works.

### A) Ladder (Live in `data/product_blueprint.md`)

| Tier | Price | What They Get | When to Offer |
|---|---|---|---|
| **Starter** | **$27** | 35+ prompts (Higgsfield + ChatGPT Vault) + 5 video walkthroughs + Notion | Cold (8s funnel) |
| **Bump** | **$9** | +10 “Midnight Prompts” (scarcity, dark psych) | At checkout (1-click) |
| **Pro** | **$79** | Starter + 5 automation templates + 14-day caption sequence + DM replies (from `NUMINOUS_WHOP_DEPLOY`) | Warm (32s funnel) |
| **Continuity** | **$19/mo** | Vault updates + 5 new prompts/mo + private community + monthly teardown live | Post-purchase (30 days) |

**Platform:** Whop (`whop.py`) — auto-split 60/40 if you ever co-sell, else 100% yours. Backup Gumroad (13% fee) for Starter. Payout: Whop next-day ACH $2.50 → test Kenya payout first (Hard Rule benchmark).

### B) Product SOP

1.  **Vault Build:** `product_blueprint.md` (35+ prompts, 5 automations, Notion) → package in Whop → `scripts/whop_cli.py` deploy
2.  **Gumroad Listing:** (`SHA-8` Backlog) → 3 tiers → screenshots → `GUMROAD_TOP100_DRAFT_SCRIPT` → live
3.  **Upsell Logic:** `gas/WAVE_AUTOPILOT_SAFE.gs` → detects Starter purchase → auto-offers $9 bump + $19/mo → 18% take rate target
4.  **Updates:** JARVIS pulls `MONETIZATION_VERDICTS.md` → generates 5 new prompts/mo → pushes to Whop → email “Vault Update” → retention

**Revenue per 100 buyers:** 100 × $27 = $2,700 + (30×$9=$270) + (15×$79=$1,185) + (40×$19/mo=$760 MRR) = **$4,915 first month, $760 MRR ongoing.** 80 partners × 20 buyers = **$7,864 MRR** → $94k/yr per niche → 4 niches = $376k → add continuity → $1M.

---

## 5) PRIVATE COMMUNITIES — Where Buyers Become Cult

**Goal:** Communities are the *product* after the product. They hold retention, create proof, and spawn partners.

### A) Two Communities (Start with ONE)

| Community | Price | Platform | Who’s In | What Happens Daily |
|---|---|---|---|---|
| **The Vault Circle** | **$19/mo** (continuity buyers) | **Whop Community** (or Skool $99/mo) | Starter/Pro buyers | Daily prompt drop, weekly teardown live, #wins channel, DM review |
| **Shadow Council** | **$79/mo** or $500/yr | **Private Telegram + Whop** | Pro buyers + 5% who pass demand test | Daily Operator drop, partner invites, 10% override (Rule 3 network) |

**Why Whop > Skool/Discord for you:** Whop already holds product + community + payments + affiliate split → one login, no Zap hell. Skool is prettier but extra $99/mo. Discord is free but no paywall natively. Start Whop, migrate winners to Skool later.

### B) Community SOP (JARVIS Runs 80%)

**Daily (JARVIS auto):**
- 09:00 Prompt Drop → from `MONETIZATION_VERDICTS.md` → #daily-prompt
- 12:00 Teardown → from `templates/creator_tracker.csv` GREEN → #teardown
- 18:00 Win Repost → from `logs/gmail_top100_push_log.csv` → #wins (social proof loop)

**Weekly (You, 1 hour):**
- **Mon 19:00 EAT:** Live Teardown (Zoom → Whop replay) → 30 min + 15 Q&A → clip to 8s/32s content (feeds Phase 1)
- **Fri:** Partner Spotlight → invite 1 GREEN creator who passed demand test → they pitch → you get 10% override

**Monthly:**
- **Vault Update:** 5 new prompts + 1 automation → push to Whop → email → community challenge (e.g., “Post 1 Higgsfield reel → best wins audit”)

**Rules (Mirror Hard Rules for Your Members):**
1. No free audits — PASS demand test first (≥1% views + 25 replies) → then you build for them
2. 3-email cap on support → FINAL TERMS template (copy/paste from `SHADOW_OPERATION_RULES.md`)
3. Niche framing → “What works for Leak pillar won’t for Proof”

**Stack:**
- **Whop Community:** $0 (included) → holds vault + chat + live + DMs
- **Backup:** Telegram (free) for hot alerts + Signal @scott.428 for 1:1s (from your Ghassen draft)
- **Bot:** ManyChat 8 channels → auto-welcomes new members → assigns #roles by tier

**Growth Loop:** Community wins → you clip → 8s hook → new buyers → community grows → more wins. **This is the flywheel to $1M.** At 200 members × $19 = $3,800 MRR → 1,000 members = $19k MRR → $228k/yr just from continuity.

---

## 6) FULL PIPELINE — One Page SOP (Stick This on Wall)

```
CONTENT (Make) → PUBLISHER (6/day) → MANYCHAT (VAULT) → FUNNEL (8s $27 / 32s $79) → WHOP (Vault) → COMMUNITY ($19/mo) → JARVIS (Loop)
```

**Daily You (30 min):** Record 3 hooks (phone) → approve 6 drafts in Gmail Drafts (Gate G4) → show up to 1 live/week.

**Daily JARVIS (24/7, $70/mo cloud):** Creates 6 videos → schedules 6/day → auto-DMs → tracks Linear SHA-16 → updates `gmail_outreach_complete.json` → posts prompt drop → clips wins.

**Weekly You (2 hours):** 1 live teardown + 1 partner spotlight → both become content.

**Metrics Dashboard (Hard, Not Vanity):**
- 10K-100K sweet spot, buyer_pool_x3, ratio<50:1, ER 3%+, 8-Gate GREEN, G6 Tri-Model (headline / anchored / naive gap)
- `execution_tracker.json` phases: Phase 1 Validation (10 surveys, 5 replies) → Phase 2 Build → Phase 3 Launch (12 GREEN → 1,020) → Phase 4 Scale (1M)

**Budget to Run Full Pipeline:**
- Content: $0 (phone + Wan 1.3B free + Piper)
- Publisher: $0 (your `marketing/publisher/backend/`)
- ManyChat: $15/mo (8 channels)
- Whop: $0 + 13% fee (passed to buyer)
- Community: $0 (Whop) or $99/mo Skool when 100 members
- JARVIS: $70/mo MVP → $196/mo scaled (from `JARVIS_CLOUD_VS_LOCAL_1M_2030.md`)
- **Total Day 1: $85/mo → profitable at 4 sales ($108)**

---

## 7) WHAT TO DO NEXT 7 DAYS

- **Day 1:** Create Whop “Vault Circle” ($19/mo) + Skool backup → connect `scripts/whop_cli.py` → test $2.50 payout (Kenya)
- **Day 2:** Record 3 hooks → run `tools/production_pipeline.py` → schedule 6 via Publisher → ManyChat VAULT keyword live
- **Day 3:** Push 200 drafts DRAFT+INBOX (we are 115/200 → run `gas/GMAIL_NEXT100_DRAFT_SCRIPT_101_200.gs` → `batch_modify` → verify `list_drafts`=200)
- **Day 4:** Whop vaults live: Starter $27 → Gumroad listing SHA-8 → test checkout
- **Day 5:** Invite first 10 buyers (from survey PASS) to Vault Circle → first prompt drop
- **Day 7:** First Live Teardown → clip → next week’s 6/day content done

**All templates exist:** `outreach_BATCH_1000_GREEN...` (emails), `gas/` (Whop deploy), `tools/` (video), `marketing/publisher/` (schedule), `reference/SHADOW_OPERATION_RULES.md` (community rules). JARVIS just connects them.

---

**Next:** Say “Build Day 1” and I’ll create your Whop Circle + first 3 hooks with JARVIS, step-by-step, on `pr_open`.

