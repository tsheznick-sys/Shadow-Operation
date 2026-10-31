# JARVIS Agent Scripts → n8n Wiring + Every Platform Connection
**Branch `arena/6c47af3d-shadow-operation` `pr_open` | Latest `785d2c4` | Zip `jarvis_whole_bundle.zip` 49M 232 files**

> Whole Jarvis = Vercel Squad PWA (3 bros equal SEND, Vercel $20+Neon $19) + n8n Cloud $20 full-time content 6/day. This doc breaks down **every Jarvis Agent Script** (tools/*.py, gas/*.gs, prompts, templates) → **exact n8n node to connect it**, then **each platform** (Gmail, Linear, Whop, ManyChat, IG/TikTok/YT, etc.) **how to connect credentials, scopes, quotas**.

---

## A) JARVIS AGENT SCRIPTS → n8n (What each script does → which n8n node replaces/hosts it)

| # | Script in Repo (path) | What Jarvis does (brain) | n8n Node to Connect It (pick one) | How to wire in n8n Cloud $20 |
|---|---|---|---|---|
| **1** | `tools/algorithm_engine.py` (8-Gate VET + Conversion/Fit scores + revenue math) | Scout→VET: 8-Gate filter (followers 10K-100K, buyer_pool_x3=avg_comments*3, ratio<50:1, ER 3%+ ideal5%+, comments trustworthy, niche ban, Gate G6 gap, etc.) + score 0-100 + writes `templates/creator_tracker.csv` (fill-only merge) | **n8n Code node (JavaScript/Python) + Postgres/Airtable** | Code node: paste `algorithm_engine.py` logic → translate to JS: `pool=avg_comments*3; ratio=followers/(comments||est); ER=...; gate= pool&&ratio<50&&ER>=3 ? GREEN : RED` → IF node `gate==GREEN` → Postgres `INSERT creators`. Backs up to `templates/backups/` via n8n S3 node. |
| **2** | `tools/revenue_model.py --followers 46000 --avg_comments 82 --price 79` | Tri-Model revenue: Naive (followers*conv%) vs Comment-anchored (pool*3%→15%*price) vs Funnel (views*click*buy) → Headline lower of methods → gap naive/base | **n8n OpenAI Code node OR Function node** | Exec: `python3 tools/revenue_model.py --followers {{$json.followers}} ...` via **n8n Execute Command node** (self-host) OR port math to JS Code node: `naive=followers*cRate*price; ca_low=pool*0.03*price; fn_base=followers*0.035*0.05*0.05*price; headline=min(ca,fn)` → Set node to Telegram “Headline ${base} op share $${base*0.4}” |
| **3** | `tools/leak_finder.py leaks / queue / brief` | DAILY BRIEF + leak analysis: funnel stage conversion, biggest leak + ONE fix, who due for Touch2/3, 14-day launch leak | **n8n Postgres + Code + Telegram Cron** | Cron `45 5 * * *` → Postgres `SELECT status,count(*) FROM creators GROUP BY status` → Code node replicate `leak_finder.py leaks` math → Telegram “Sir, leak: Touch2 due for 12” |
| **4** | `tools/tracker_log.py note/touch/set/show --handle @x` | Safe append-only edits to `creator_tracker.csv` (never overwrites filled cells, keeps column order, writes backup) | **n8n Postgres Update node** | Replace CSV with **Neon Postgres** table `creators` — n8n Postgres node `UPDATE creators SET notes=$1 WHERE handle=$2` — same fill-only logic in Code node |
| **5** | `tools/reconcile_gmail.py --export gmail_export.csv --dry-run` | Reconcile Gmail SENT vs tracker: unmatched → QUARANTINED (counts to denominator, never re-pitched), fills blank cells only | **n8n Gmail + Postgres nodes** | Gmail node `listMessages` export → Postgres `SELECT * FROM creators` → Code compare by email/handle → IF unmatched → `INSERT QUARANTINED` → Linear “Reconciled 2 QUARANTINED” |
| **6** | `tools/audit_wave_lists.py --waves wave-lists.json --sent-export` | Gate every bulk wave before schedule: checks tracker, sent exports, Gate G8 declines, bans, cap → exit non-zero if blocked | **n8n IF + Code node (pre-send gate)** | Before WF3 Publish → Code node load `wave-lists.json` + `gmail_top100_manifest` → IF `handle in declines OR followers>100K without exception` → Error + Telegram “Wave blocked for @x G8” |
| **7** | `tools/apparatus_1000.py` / `tools/big_run_1000.py` / `draft_1000_green.py` | Build Apparatus 1000 GREEN (1,462 pool, buyer_pool_x3 filtered, Social Blade verified), then draft 764 email-ready | **n8n Code + HTTP + Postgres** | Already run → `data/creator_apparatus_1000.csv` imported to Postgres `creators`. n8n WF1 re-ranks weekly via same ratio/ER logic (no re-scrape 1,462 daily — use Apify for delta) |
| **8** | `tools/faceless_scraper.py` | Faceless niche scraper (Psych/Mindset/Wolf etc. → Social Blade alternatives + HypeAuditor) | **n8n HTTP Request + Apify nodes** | HTTP `GET https://socialblade.com/instagram/user/{{$json.handle}}` + Apify `instagram-scraper` → Parse followers/ER → Code `pool=comments*3` → IF faceless → Postgres |
| **9** | `tools/run_monetization_verdicts.py` | Regenerates `MONETIZATION_VERDICTS.md` from tracker | **n8n Code → Slack/Linear doc** | Code node aggregates `creators` → Markdown → Linear `Create Document` or Slack message |
| **10** | `prompts/01..09` (scout, outreach, audit, demand_test, product, launch, ops, expansion, legal) | System prompts for each gate (G1-G8) | **n8n OpenAI node system prompt** | OpenAI node `system: {{prompt file}}` — e.g., `prompts/02_outreach.md` → `Quick idea for @handle` P1 style |
| **11** | `templates/creator_tracker.csv` + `templates/gmail_staging_queue.json` 129 | Live pipeline state (message IDs, agreed prices, follow-ups) + engine snapshot staler than tracker | **n8n Postgres (creators, drafts, replies) + Airtable view** | Postgres `creators` replaces CSV; `gmail_staging_queue.json` → n8n queue table `staging_queue` (129) |
| **12** | `marketing/publisher/` (queue38, 6/day IG+TikTok+YT G4 approve) + `marketing/funnel/` | Publisher posts 6/day, ManyChat 8ch, Whop $27/$9/$79/$19/mo | **n8n HTTP Request + ManyChat + Whop nodes** | n8n WF2 → Postgres `publisher_queue38` pending_G4 → HTTP Publisher API → G4 Telegram approve → 6/day live |
| **13** | `gas/*.gs` (`GMAIL_G4_SEND_200_VERIFIED.gs`, `FORWARD_DRAFTS_TO_INBOX.gs`, etc.) | GAS 1-click sender (DRAFT→SENT, 1.5s throttle, 100/day), DRAFT+INBOX eyeball, wave autopilot safe (25/day ceiling) | **n8n Gmail node replaces GAS** | n8n Gmail `createDraft` + `batchModify add INBOX` + `sendDraft` (1.5s wait via n8n Wait node) — keep GAS as backup 1-click in Google Script editor for B50 |
| **14** | `reference/SHADOW_OPERATION_RULES.md` (Hard Rules 1-11) | 3-email cap→FINAL TERMS, no free audit before commitment, hard no on tweaks, no Whop before PASS (1%+25), strict 1%+25, personalize voice | **n8n IF + Code + OpenAI classifier nodes** | IF `email_count>3` → OpenAI `is FINAL_TERMS?` → IF tweak after FINAL → Code `THREAD_CLOSED → LOST` + Linear |
| **15** | `reference/learnings.md` + `execution_tracker.json` | Learnings loop, apparatus updates | **n8n Postgres + Linear Update** | After each WF3 PASS/FAIL → Postgres `INSERT learnings` → Linear project update |

**n8n wiring pattern (all scripts):** **Postgres/Airtable as source of truth** (replaces CSV) + **Code node** (JS port of Python logic) + **HTTP Request** (for Flow/Pillow/Wan/Drive + Publisher/ManyChat/Whop) + **Wait** (GAS 1.5s/2s delay) + **Telegram/Gmail** (Butler pings).

---

## B) EVERY PLATFORM → How to Connect in n8n (Credentials, Scopes, Quotas)

| Platform | Node in n8n | Credential to Create in n8n (step-by-step) | Scopes / Limits | What Whole Jarvis does with it (WF map) |
|---|---|---|---|---|
| **Gmail `scott.abuya@gmail.com`** | `Gmail` (OAuth2) + `Gmail Trigger` | 1) Google Cloud Console → Enable Gmail API → OAuth consent (scott.abuya@gmail.com) → Create OAuth Client → `GMAIL_CLIENT_ID/SECRET` 2) n8n Credentials → Gmail OAuth2 → paste ID/Secret → sign in → allow `gmail.modify` + `gmail.send` + `gmail.compose` 3) n8n Gmail node `createDraft` (DRAFT) / `batchModify add INBOX` (DRAFT+INBOX eyeball B50) / `sendDraft` (SEND) + Trigger `is:from:premiereprotutos@gmail.com newer_than:1d` for Omar | `gmail.modify` + 500/day Gmail limit, Strict auto-pause 2×550 (R7) → n8n IF `bounce.code==550` ×2 → Pause workflow + Telegram `Auto-paused` | WF2 create 6/day drafts → WF3 send/forward → WF4 brand IMAP → WF Reconcile (QUARANTINED) |
| **Linear `SHA` team `98004e03...` project `79092591` SHA-16 Done** | `Linear` | Linear Settings → API → Create `LINEAR_API_KEY=lin_api_xxx` → n8n Linear credentials → paste | Rate 500/hr | WF1-4 → `Create Issue/Update` + `Create Project Update` execution_tracker → your Daily Brief pulls Linear |
| **Neon Postgres / Airtable** | `Postgres` or `Airtable` | Neon Console → Project `shadow-operation` → `DATABASE_URL=postgresql://...` → n8n Postgres creds (SSL require) OR Airtable → Base `Shadow Operation` tables `creators/drafts/replies/publisher_queue38` → Airtable API key | 3GB free Neon (1,462 GREEN ~2.4M csv) | Source of truth: WF1 SELECT pool*ER, WF2 INSERT queue38, WF3 UPDATE replies, WF4 log |
| **OpenAI `gpt-4o-mini` + Whisper + ElevenLabs** | `OpenAI` | OpenAI Platform → `OPENAI_API_KEY=sk-proj-...` → n8n OpenAI creds → model `gpt-4o-mini` $0.15/1M in | $30/mo (1k videos) → $60/mo (10k) | WF1 rank top5 monetizable, WF2 write 6 scripts (Butler formal), WF3 classify reply FINAL TERMS, WF4 brand classify |
| **Telegram Bot + Signal** | `Telegram` + `Signal`/`HTTP` | @BotFather → `/newbot JarvisSquad` → `TELEGRAM_BOT_TOKEN` + your `TELEGRAM_CHAT_ID_SQUAD` 3-bros group → n8n Telegram creds. Signal: `SIGNAL_API` HTTP node `signal.me` | Unlimited | 05:45 Daily Brief `Sir 6 ready` + 21:00 Omar nudge + WF1 Top5 approve button + brand alerts |
| **Whop `$28+$17+$35+$89+$44+$53+$62/mo`** | `HTTP Request` (Whop API) + `Whop` node if exists | Whop Dashboard → Developers → `WHOP_API_KEY=whop_xxx` → n8n HTTP Header `Authorization: Bearer whop_xxx` → `POST https://api.whop.com/products` (ladder) | 13% Whop fee | WF3 PASS (1%+25 of YOUR 6/day views) → Whop Create Product `Your Domain Official Vault` → grant admin (you) → ManyChat entitlement |
| **ManyChat 8ch** | `ManyChat` | ManyChat Settings → API → `MANYCHAT_API_KEY` → n8n ManyChat creds → connect Page/IG | $15/mo | WF3 PASS → ManyChat `Push Flow 8ch` DM “Reply VAULT 40 early” → Whop |
| **Publisher queue38 6/day IG+TikTok+YT G4** | `HTTP Request` | `marketing/publisher/` repo → Publisher API key → n8n HTTP `POST https://publisherapi.com/queue38` {caption, video_url, date} | 6/day hard cap (G4) | WF2 INSERT queue38 pending_G4 → Vercel /n8n approve (any of 3 equal SEND) → HTTP Publisher → 6/day live |
| **IG / TikTok / YT (Publisher + Apify)** | `Apify` + `HTTP Request` | Apify Console → `instagram-scraper` + `tiktok-scraper` actors → `APIFY_API_KEY` → n8n Apify nodes. YT via `youtube-scraper` | $49/mo Apify or manual 12-post check $0 | WF1 research ER/pool/ratio + WF3 analytics views+replies for 1%+25 |
| **Social Blade / HypeAuditor / NotJustAnalytics** | `HTTP Request` | No key: `GET https://socialblade.com/instagram/user/{{$json.handle}}` → HTML parse followers/ER (or `picuki` alt per your Social Blade alternatives ask) | Free, rate-limit gentle | WF1 full vision for 1,462 → buyer_pool_x3 |
| **Flow wisely 8s/32s/60s + Pillow HD mock 0cr + Wan 1.3B T4 (no card)** | `HTTP Request` + `Google Drive` + `Execute Command` | Flow API key → n8n HTTP `POST https://flow.googleapis.com/generate` (8s/32s/60s) → Pillow `POST` mock HD 1080x1920 (Tier0 0cr) → Wan Colab T4 webhook `https://xxx.ngrok.io/generate` (Tier2) → Google Drive OAuth2 cred → `NUMINOUS_WHOP_DEPLOY/` folder `17KpzZCm...` → Katana `p01_32s_9x16.mp4` ffmpeg `queue70/schedule38` | No card (Veо veo-3.1 billing blocked) → use free rails, Higgsfield UI manual Tier1 fallback | WF2 make 6/day: 3×8s Short +2×32s Long +1×60s → Drive → queue38 |
| **Google Drive `NUMINOUS_WHOP_DEPLOY/` + HQ `17KpzZCm...`** | `Google Drive` | Google Cloud → Drive API OAuth → n8n Google Drive creds (same GCP as Gmail) → folder ID `17KpzZCmxxz13vJfkKv96EZZ5e7KTft8G` | 15GB free | WF2 uploads p01→queue38 videos → Squad pulls Zip `jarvis_whole_bundle.zip` 49M |
| **R2/S3 Backup** | `S3` | Cloudflare R2 → `R2_ACCESS_KEY/SECRET` → n8n S3 creds → bucket `jarvis-backups` | $5/mo | Cron daily `templates/backups/` → R2 |
| **Vercel + Neon Hybrid Monitor** | `Vercel` + `Postgres` + `n8n Webhook` | Vercel Dashboard → import `jarvis-app/` → Env `DATABASE_URL, OPENAI, GMAIL, LINEAR, TELEGRAM` → `vercel.json` Cron `*/15` + `05:45` → n8n Webhook `https://n8n.../webhook/vercel-queue38` → Vercel `/n8n` embeds n8n executions | Vercel $20+Neon $19 hybrid = $59/mo with n8n $20 → $109/mo scaled | Vercel shows squad dashboard (/, /drafts swipe equal SEND, /omar 1%+25, /jarvis chat+mic, /bros 3, /n8n). n8n does work, Vercel shows. |

**Connect in n8n: Credentials → Add → paste key → Test → Save → drag node → select cred → Execute.**

---

## C) n8n WORKFLOWS → How Scripts + Platforms Interact (Hybrid Whole)

**WF1 Research (Mon 08:00):** `Postgres 1,462` → `HTTP Social Blade` (full vision) → `Code` (8-Gate `algorithm_engine.py` → GREEN) → `OpenAI rank top5 monetizable` (`revenue_model.py` math) → `Telegram+Gmail` Squad approve → `Postgres UPDATE top5`
**WF2 Make (02:00 daily):** `Postgres top5` → `OpenAI 6 scripts` (prompts 01-09) → `HTTP Flow/Pillow/Wan` → `Google Drive` → `Postgres queue38` → `Linear + Telegram` (with `tracker_log.py` fill-only logic via Postgres)
**WF3 Publish+Demand→Whop (09:00 + on approve):** `Postgres queue38 pending_G4` → `Vercel /n8n` (any of 3 equal SEND approves) → `HTTP Publisher` 6/day → `HTTP IG/TikTok/YT analytics` → `Code` (1%+25 R10, `leak_finder.py` brief) → `HTTP Whop` ladder → `ManyChat 8ch` → `Gmail` PASS/FAIL
**WF4 Brand+Brief (05:45):** `Gmail Trigger` + `ManyChat webhook` → `OpenAI classify` → `Telegram all 3` → `Linear` + `S3 backup` + `reconcile_gmail.py` QUARANTINED logic

**GAS backup for B50:** Keep `gas/GMAIL_G4_SEND_200_VERIFIED.gs` `forwardDraftsToInbox(50)` / `sendAllDrafts(50)` as 1-click fallback when n8n Gmail quota per minute hits (741298168090).

---

## D) QUICK CONNECT CHECKLIST (copy to n8n)
- [ ] n8n Cloud → Credentials → Gmail OAuth2 gmail.modify (test: listMessages)
- [ ] Postgres DATABASE_URL (test: SELECT 1)
- [ ] OpenAI sk-proj (test: gpt-4o-mini hello)
- [ ] Telegram BOT_TOKEN + chat_id squad (test: sendMessage)
- [ ] Linear lin_api (test: createIssue SHA)
- [ ] Google Drive OAuth2 (test: list folder 17KpzZCm...)
- [ ] Whop whop_xxx (test: POST product $27)
- [ ] ManyChat API (test: list flows 8ch)
- [ ] Flow/Pillow/Wan keys + Drive (test: 1×8s)
- [ ] Publisher API (test: queue38 insert)
- [ ] R2 S3 (test: upload backup)

**All scripts in repo map 1:1 to n8n nodes — Postgres replaces CSV as source of truth (fill-only, backup first).**

