# PLATFORMS A→Z — Full Pipeline: Which to REVOKE vs ADD
**Branch `arena/6c47af3d-shadow-operation` `pr_open` | Latest `f052620` | Zip `jarvis_whole_bundle.zip` 50M | Date 2026-10-30**

> You: “All of them. From A to Z based of the pipeline. I will like to see also which platforms to revoke & which ones to add”
> Pipeline source: `00_MASTER_SYSTEM_PROMPT.md` (Gates G1-G8) + `reference/SHADOW_OPERATION_RULES.md` (11 Hard Rules) + `tools/*` + `gas/*` + `prompts/01-09` + `templates/creator_tracker.csv` (source of truth, fill-only) vs Gmail (real pipeline)

### Legend
- **KEEP** = still needed in Whole Hybrid Jarvis (Vercel $20+Neon $19 + n8n $20 = $59/mo)
- **REVOKE / ARCHIVE** = stop using, remove creds, delete from n8n / Vercel env
- **ADD** = new platform to wire now (14-day full) or later when $10k/mo

---

## PIPELINE A→Z + Platform Fate

| Stage | Gate | What Happens | Platforms Used | Fate | Action (Revoke/Add) |
|---|---|---|---|---|---|
| **A — SCOUT** `prompts/01_scout_and_vet.md` | — | Find 60 handles/niche (Psych/Marketing/Mindset/Dark Psych/Marketing history/Wolf/Consumerism) → 12-post manual check | **Social Blade** + **HypeAuditor / NotJustAnalytics / Picuki** (your Social Blade alternatives lock) + **Apify** `instagram-scraper` / `tiktok-scraper` + **Faceless_scraper.py** | **KEEP** Social Blade/HypeAuditor/Apify + **ADD** *NotJustAnalytics* + *Picuki* as 3rd source (you asked always ask + alternatives) → n8n HTTP Request nodes | **REVOKE** manual copy-paste only — automate via n8n WF1 |
| **B — VET** `tools/algorithm_engine.py` 8-Gate | G1-G6 | 8-Gate: followers 10K-100K sweet spot, comment count trustworthy, buyer_pool_x3=avg_comments*3, ratio<50:1, ER 3%+ ideal5%+, niche ban Motivation/Wealth, G6 revenue gap, G8 decline check | **Neon Postgres** (`creators` 1,462 GREEN), **Postgres/Airtable**, **Social Blade data**, `algorithm_engine.py` | **KEEP** All → move to n8n **Code node** (JS port) + **Postgres** as source of truth (fill-only, backup to `templates/backups/` → R2). **REVOKE** CSV-only `creator_tracker.csv` as primary (keep as Linear mirror only). **ADD** Postgres `pool, ratio, er, gate` computed columns |
| **C — OUTREACH** `prompts/02_outreach.md` P1/Tier0-2 | G4, G8 | Draft `Quick idea for @handle` P1 personalization (followers+ER niche) → `gmail__create_draft` DRAFT only → `gmail__batch_modify add INBOX` DRAFT+INBOX eyeball (B50) → human swipe SEND | **Gmail API** `scott.abuya@gmail.com` (`gmail.modify`+`send`), **Linear SHA** team `98004e03` project, **Telegram/Signal** Butler pings | **KEEP** Gmail+Linear+Telegram (squad 3 equal SEND per your final lock). **REVOKE** old `gas/GMAIL_TOP100_DRAFT_SCRIPT.gs` single-handle DRAFTs (`archive/stale_2026-10-27` already) + any `STAGED` 30 fake `r-staged-*` (malformed hygiene `logs/gmail_cleanup_2026-10-22.md`). **ADD** **n8n Gmail node** `createDraft` + `batchModify INBOX` + `Wait 1.5s` throttle (replaces GAS `GMAIL_G4_SEND_200_VERIFIED.gs` as primary; keep GAS as 1-click backup for B50 quota jam) |
| **D — REPLY TRIAGE** Hard Rule 1 | R1-R3 | 3-email cap → Email1 pitch, 2 clarification, 3 reset/audit, 4 FINAL TERMS → hard close on tweaks → Thread Closed/Lost | **Gmail Trigger** `is:from: Shadow Hot`, **OpenAI classifier** (`is FINAL_TERMS?` + `is tweak after FINAL?`), **Linear** | **KEEP** All + **ADD** n8n `OpenAI` node system prompt `prompts/01-09` + Code `THREAD_CLOSED`. **REVOKE** lawyer-review language (your NO LAWYERS HERE lock) — use FINAL TERMS one-pager only |
| **E — AUDIT** `prompts/03_audit_gameplan.md` | R2 | Only after YES to demand test → deliver audit PDF via Google Docs/Drive → niche-based framing (case study = demand test proof) | **Google Docs** + **Drive** (`NUMINOUS_WHOP_DEPLOY/` HQ `17KpzZCm...`), **OpenAI** for audit copy | **KEEP** Docs+Drive+OpenAI. **REVOKE** free audit before commitment (R2) — n8n IF `status!=YES_DEMAND` → block audit. **ADD** n8n Drive OAuth2 for auto-PDF gen |
| **F — DEMAND TEST** `prompts/04_demand_test.md` Personalized Stories | R9-R11, G5 | 3 Stories Thu19:00 POLL / Fri19:00 style / Sat19:00 Reply VAULT → PASS = **strict 1% of Story3 views +25 raw** (AMBER=FAIL) → no Whop before PASS → daily 09:00 EAT Shadow Hot scan → Sun 09:00 you shoot PASS/FAIL live | **IG via Publisher** `queue38` + **Camera OCR** (`Tesseract.js` + OpenAI Vision), **Gmail** PASS/FAIL shooter, **Telegram all 3** | **KEEP** Publisher+OCR+Whop gate. **REVOKE** `draft_now_admin_later` draft store before PASS (your `no_store_until_pass` lock → screenshot-only until PASS). **ADD** n8n HTTP IG analytics `views/replies` → Code `need=max(25,ceil(views*0.01))` → Whop gate. **KEEP** Omar precedent `164K >100K cap` exception 4.85% ER+273 Whop products as template for future exceptions |
| **G — COMMITMENT** `templates/commitment_outline.md` | G5 | Signed one-pager 10 points verbatim → 60/40 vs Flat-Fee TBD models (R6) | **Google Docs / DocuSign** + **Whop** auto-split vs flat-fee | **KEEP** Both offer models. **REVOKE** 65/35 tweak (your “Where did he say 65/35? nowhere” lock). **ADD** n8n Whop `Create Product` with split param |
| **H — PRODUCT BUILD** `prompts/05_product_builder.md` | — | Numinous 14-day Sequence v2 (already in `NUMINOUS_WHOP_DEPLOY/`) + Flow/Pillow/Wan pipeline 8s/32s/60s Tier0 Pillow 0cr + Tier2 Wan 1.3B T4 + Tier1 Higgsfield UI manual (no card, Veo blocked) | **Flow wisely** 8s/32s/60s, **Pillow HD mock**, **Wan 1.3B T4**, **Higgsfield UI manual**, **FFmpeg Katana** `p01_32s_9x16.mp4→queue70/schedule38`, **Drive**, **Vercel cron** | **KEEP** All free rails (no card). **REVOKE** Veo `veo-3.1-generate-001` paid entitlements until card available (your NO CARD lock). **REVOKE** OpenChatCut Pro `0xsline`. **ADD** n8n HTTP Flow + Execute Command FFmpeg + Drive upload WF2 |
| **I — LAUNCH** `prompts/06_launch_sequence.md` + `marketing/funnel` | — | 14-day caption packs, Whop $27→$9→$79→$19/mo ladder, ManyChat 8ch, Vault Circle + Council + SOPs | **Whop** API, **ManyChat** 8ch, **Publisher** 6/day, **Telegram** launch pings | **KEEP** All (ladder $27+$9+$79+$19 per your final lock). **REVOKE** standalone `Whop-Bot-*.zip` legacy bot (migrate to Whop API + ManyChat). **ADD** n8n Whop `Create Product` ladder + ManyChat `Push Flow` WF3 |
| **J — OPS / OPTIMIZE** `prompts/07_pipeline_ops.md` + `tools/leak_finder.py` + `reconcile_gmail.py` + `audit_wave_lists.py` | G8 | Funnel leak finder (biggest leak + ONE fix), queue cap 8, tracker is source of truth (post-Gmail reconcile → QUARANTINED terminal), Gate every wave before schedule | **Linear** SHA-16 Done, **Neon** backups → **R2 $5/mo** (Litestream), **Gmail** 550 auto-pause | **KEEP** All. **REVOKE** Motivation/Wealth niche handles (banned) + hard fail 550 `numinous.support@gmail.com` REMOVE, + mass IG DMs (rejected connector ToS). **ADD** n8n `reconcile_gmail` (Gmail export → QUARANTINED) + `audit_wave_lists` Code gate + `leak_finder` Code daily brief 05:45 |
| **K — EXPANSION** `prompts/08_expansion_research.md` | — | 15-niche demand + product-fit → top 3 + monetization verdicts | **Apparatus 1000** `draft_1000_green.py`, **MONETIZATION_VERDICTS.md** | **KEEP** Apparatus 1000 locked `2be9d9f` 882 GREEN → **ADD** n8n WF1 weekly re-rank to top5 domains (fully self sustained) |

---

## REVOKE vs ADD Summary (Action Now)

### 🔴 REVOKE / ARCHIVE (Stop, remove creds, delete from env)
| Platform / File | Why revoke | Where it was |
|---|---|---|
| `veo-3.1-generate-001` Veo paid + GCP billing | **NO CARD** lock — billing blocked, use Pillow/Wan free | Flow wisely Tier1-2 |
| OpenChatCut Pro `0xsline` | Amended lock | Pipeline |
| `gas/GMAIL_TOP100_DRAFT_SCRIPT.gs` old single-handle + `STAGED r-staged-*` fake drafts | Malformed hygiene `logs/gmail_cleanup_2026-10-22.md` — replaced by verified 200/200 LIVE `GMAIL_G4_SEND_200_VERIFIED.gs` | GAS |
| `archive/stale_2026-10-27/` outreach_DRAFTs + TOP100 md | Stale, quarantined | Templates |
| Motivation/Wealth niche handles | Banned niche `tools/audit_wave_lists.py` | Scout |
| Hard fail `numinous.support@gmail.com` (550) | REMOVE from all lists (Rule 7) | Gmail |
| Mass IG DM connector | Rejected — ToS violation — use targeted DM only on THEIR platform (X/TikTok where they live) | Outreach |
| CSV-only tracker as primary | Tracker is source of truth but Gmail is real pipeline — move to Postgres fill-only + Linear mirror | Templates |
| `Whop-Bot-arena-*.zip` legacy | Migrate to Whop API + ManyChat 8ch | Product |
| `wave_autopilot_safe.gs` sending enabled + no draft fallback | Hardened sender ships disabled — replace with n8n Wait 1.5s throttle | GAS |
| Omar tweak after FINAL TERMS `65/35` | Nowhere in thread — hard close (your lock) | Commitment |
| `draft_now_admin_later` before PASS | Revoked by `no_store_until_pass` — screenshot-only | Demand |

### 🟢 ADD (Wire now in 14-day Whole Hybrid)
| Platform | Cred to Add | Cost | WF |
|---|---|---|---|
| **n8n Cloud** | `n8n Cloud $20/mo` + creds below | $20/mo | All WF1-4 (replaces/augments GAS) |
| **Neon Postgres** (replaces CSV primary) | `DATABASE_URL` Neon free 3GB → n8n Postgres | $0→$19/mo | B, C, F, J (forever memory) |
| **NotJustAnalytics + Picuki** | Free HTTP `GET https://.../user/handle` parse | $0 | A Scout alternatives (your always ask + Social Blade alternatives lock) |
| **OpenAI `gpt-4o-mini` (+ hybrid Ollama later $10k/mo)** | `OPENAI_API_KEY` → n8n OpenAI | $30/mo → $60/mo | C outreach, D triage, E audit, H product, J leak |
| **Google Drive OAuth2** (Flow/Pillow/Wan uploads + bundle) | Drive API OAuth same GCP → folder `17KpzZCm...` HQ | $0 | H product, J backup |
| **R2 $5/mo** Litestream | `R2_ACCESS_KEY` → n8n S3 | $5/mo | J backup |
| **Apify** TikTok/IG scraper (or manual $0) | `APIFY_API_KEY` → n8n Apify | $49/mo or $0 manual 12-post | A Scout + E demand analytics |
| **ManyChat 8ch** (already keep, ensure wired) | `MANYCHAT_API_KEY` → n8n ManyChat | $15/mo | I Launch |
| **Publisher queue38 6/day** (ensure wired) | `PUBLISHER_API_KEY` → n8n HTTP → IG+TikTok+YT G4 approve | $0 | F Demand + I Launch |

### ✅ KEEP (Already wired, just connect creds in n8n + Vercel)
Gmail `scott.abuya@gmail.com` (modify+send, 500/day, 2×550 auto-pause), Linear SHA `98004e03` project `79092591`, Telegram Bot + Signal `@scott.428` all 3, Whop ladder $27+$9+$79+$19/mo, IG/TikTok/YT via Publisher, Social Blade + HypeAuditor, Flow/Pillow/Wan free rails (no card), Drive HQ, R2, Vercel+Neon hybrid $59/mo (revived `jarvis-app` + /n8n embed), OpenAI, Hard Rules 1-11, Omar V2 precedent

---

## Whole Pipeline Flow (A→Z) with Connections
```
SCOUT (SocialBlade+Apify+Faceless) → VET (8-Gate algorithm_engine.py Code→Postgres GREEN)
→ OUTREACH (P1 outreach.md → Gmail Draft DRAFT+INBOX → Telegram squad) → REPLY TRIAGE (Gmail Trigger + OpenAI FINAL TERMS + 3-email cap)
→ AUDIT (Docs/Drive, only after YES) → DEMAND (Publisher queue38 6/day + IG Stories + OCR 1%+25 → Telegram 21:00 nudge)
→ COMMITMENT (FINAL TERMS one-pager 10pts, 60/40 vs Flat-Fee) → PRODUCT BUILD (Flow/Pillow/Wan T4 → Drive Katana)
→ LAUNCH (Whop ladder→ManyChat 8ch→14-day captions) → OPS (leak_finder daily 05:45 + reconcile Gmail QUARANTINED + audit wave before schedule + R2 backup)
→ EXPANSION (Apparatus weekly re-rank top5 → both self sustained loops)
```

**n8n hosts J-scripts; Vercel shows squad dashboard (`/`, `/drafts` equal SEND, `/omar`, `/jarvis` chat+mic, `/bros` 3, `/n8n` embed).**

> Whole bundle `jarvis_whole_bundle.zip` 50M already includes all KEEP scripts/tools + 1,462 GREEN + 7M Omar V2 assets. Add the green ADD creds above to go live 14d. Revoke red to stay compliant.

