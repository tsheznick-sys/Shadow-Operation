# JARVIS 30/30 ANSWERS — SYNTHESIS → BUILD PLAN
Date: 2026-10-29 | Branch: arena/6c47af3d-shadow-operation pr_open #6 | Status: CLEAN pass

## Decisions (30/30)
| # | Q | Answer | Impact |
|---|---|---|---|
|1|Bros| **squad_3_5_roles** — 3-5 bros, roles needed | Auth: admin (you) + bros (approver/viewer) → per-niche ownership later |
|2|Voice style| **chat_first_practical** — chat in Telegram/Signal + mic button | PWA chat-first, voice briefing @ 08:45 EAT (ElevenLabs) |
|3|Scope| **all_ops_unified** — Shadow + Numinous + future niches | One dashboard, filter by niche |
|4|Autonomy| **auto_while_sleep** — vet/draft/follow-ups auto 24/7 | Cron every 15min on Vercel, you wake to approve |
|5|Personality| **keep_butler** — Sir, 6 drafts await | Butler for all (formal, trusted) |
|6|Success| **1_partner_live** — outreach→PASS→Whop LIVE→first sale | v1 done when 1 partner live end-to-end |
|7|Hosting| **vercel_cheap** — Vercel + Neon free tier | Vercel Frontend + Vercel Functions backend + Neon Postgres (free) |
|8|Brain| **cloud_only_fast** — 100% Cloud OpenAI | gpt-4o-mini only, no Ollama v1 — $30/mo LLM |
|9|Wake| **wake_on_voice_locked** — Hey Jarvis while locked | ⚠️ CONFLICT with PWA fast — Phased: mic button v1 (PWA), wake word v2 (Expo native @ 30d) |
|10|Truth| **cloud_only_no_local** — Cloud only, no Beelink v1 | Respects your $10k/mo rule — local queued for $10k/mo |
|11|App form| **pwa_fast** — PWA 7 days | Next.js 14 PWA, installable iOS/Android |
|12|Offline| **offline_block** — Show offline, no queue | Simple — queue in v2 |
|13|Auto steps| **full_auto_to_whop** — Auto until Whop build | Scout→VET→DRAFT→TRACK→Triage→Audit→Demand test→Whop — you sign + money only |
|14|VET RED| **auto_reject_red** — Auto-reject ER<2% | Saves time, apparatus auto-filters |
|15|Send gate| **human_swipe_keep** — You swipe SEND in app | Gate G4 preserved — DRAFT+INBOX → you swipe → Gmail SENT |
|16|Camera| **yes_camera** — Photo story views → OCR | Camera scan → OCR reads 1% + 25 logic → auto email to you |
|17|Whop| **auto_create_whop** — Auto-create on PASS | Premiere Vault style, grant admin instantly |
|18|ManyChat| **auto_many_8ch** — Auto-push 8ch | DM flows auto to ManyChat on launch |
|19|Voice both| **text_plus_voice_brief** — Text + voice briefing | Text primary, 08:45 EAT butler briefing spoken |
|20|Eyes| **full_vision** — Full scrape vision | Social Blade + HypeAuditor + scraping (Apify later) |
|21|Hands| **hands_except_money** — Auto except money | JARVIS does hands, you approve money/sign |
|22|Memory| **forever** — Every DM/email forever | Neon stores 1,462 GREEN + all replies forever |
|23|Proactive| **all_3_channels** — Telegram+Gmail+Signal | Your config — 08:45 EAT + Thu 21:00 Omar nudge |
|24|Equality| **equal_all** — Equal power all bros | ⚠️ RISK vs Hands-except-money — Resolved: equal approve, but only you + designated can SEND/money (admin flag) |
|25|Integrations| **plus_whop** — Gmail+Linear+Whop first | Gmail Drafts + Linear SHA + Whop auto-create (Phase 1) |
|26|Gmail strict| **keep_strict** — Strict 0% 550 auto-pause | Protect scott.abuya@gmail.com |
|27|Auth| **google_oauth** — Google OAuth | Same GCP project as Gmail API |
|28|Encryption| **yes_encrypt_r2** — Encrypt + R2 backup | Litestream-like daily → R2 $5/mo + Tailscale later |
|29|Cost| **150_ok_faster** — $150/mo OK to ship in 7 days | MVP $70 ideal, $150 ceiling accepted for speed |
|30|Ship| **pwa_7_days** — PWA 7 days then native | PWA 7d → native wake word 30d |

## Resolved Conflicts
1. **PWA fast vs Wake while locked:** PWA cannot listen while locked. **Phase v1:** mic button in PWA (tap → Whisper). **Phase v2 (30d):** Expo native app adds Hey Jarvis background service.
2. **Full auto to Whop vs Human swipe:** Full auto means JARVIS builds up to Whop draft. **Human gate re-injected at money:** SEND and Stripe/Whop payout require your swipe. Hands-except-money lock.
3. **Equal all vs Admin:** Equal approve for pipeline, but **SEND/money = admin-only** toggle per bros — you are super-admin, bros are admin-by-niche.

## Architecture — Vercel Cheap + Cloud Brain + PWA
**Hosting:** Vercel (Frontend PWA + Serverless Functions) + Neon Postgres free (3GB) + Vercel Cron (15min) — $0 free tier 14d → $20/mo scaled. No Fly.io (per your pick). Saves Fly $7/mo.
**Brain:** OpenAI gpt-4o-mini ($20-30/mo for 1k emails) — gpt-4o for audit, whisper for voice-in, ElevenLabs for voice-out briefing.
**DB:** Neon tables: creators (from gmail_outreach_complete.json 1,462 GREEN), drafts (outbound/drafts_101_200), replies, bros, pipeline (Linear mirror), snapshots (story views OCR).
**Agent Cron (Vercel):** Every 15min → list Gmail replies → Hard Rule 1 filter (3-email cap → FINAL TERMS) → classify → draft audit/demand test → push DRAFT+INBOX → notify all 3 channels.
**PWA Frontend (Next.js 14):**
- / — Pipeline board (SCOUT→VET→OUTREACH→REPLY→DEMAND→WHOP→LIVE) — filter by niche + bro
- /drafts — Swipe deck: draft card → you swipe right = SEND (calls gmail__send_draft via backend)
- /jarvis — Chat-first + mic button → Whisper → agent → text + optional TTS briefing
- /omar — Dedicated Omar demand tracker: Story1/2/3 countdown + camera scan + 1%+25 auto-calc + PASS/FAIL email shooter (Sun 09:00 EAT)
- /bros — Squad 3-5 roster + per-niche ownership + equal approve toggles
- /settings — Gmail/Linear/Whop/ManyChat OAuth + Strict toggle + cost meter

**Real-Life JARVIS Flow Example:**
You: (tap mic) "JARVIS, how's Omar?"
JARVIS: (Whisper→GPT) "Sir, Omar's Story 1 is due Thu 19:00 EAT. 3 slides ready, V2 ZIP sent 23:38Z. No screenshot yet. I will nudge via Gmail + IG at 21:00 if missing. 6 other drafts await approval." + Telegram ping to bros.

**Security:** Google OAuth (next-auth), Neon encrypted at rest, Gmail token in Vercel env encrypted, R2 daily backup, Strict auto-pause on 2×550 (protect sender).

**Budget:** Vercel $0→$20 + Neon $0→$19 + OpenAI $30 + R2 $5 + Domain $1 = **$36/mo MVP → $75/mo scaled** — under your $150 cap. Profit at 1 partner LIVE ($27×20 sales = $540) covers 7 months.

## 7-Day Build Sprint (PWA MVP → 1 Partner Live)
**Day 1-2:** Scaffold jarvis-app (Next.js PWA + Neon + Auth) — pipeline board + drafts swipe — connects to scott.abuya@gmail.com via Gmail API
**Day 3-4:** Agent cron + 8-Gate VET + DRAFT generation (reuses algorithm_engine.py) + Linear sync + All-3 pings
**Day 5:** Omar camera tracker + Whop auto-create on PASS (whop.py) + ManyChat 8ch push
**Day 6:** Voice briefing (Whisper in, ElevenLabs out) + Bros squad roles + cost meter
**Day 7:** Test end-to-end with 10 drafts → SEND 1 → Linear Done → Whop draft — deploy to Vercel — handover "1 partner live" demo

**After 7d:** Native Expo app (Hey Jarvis wake word while locked) + Tailscale + Beelink queued for $10k/mo — but cloud is primary until then (your lock).

File: docs/JARVIS_FULLSTACK_30_QUESTIONS.md (30Qs) — this synthesis — next: code scaffold.

