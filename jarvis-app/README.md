# JARVIS — Shadow Operation Brain
**PWA • Vercel Cheap • Cloud-Only Fast • Squad 3-5 • Chat-First • Full Auto to Whop — Grok + Claude Primary (Claude+Grok removed 2026-10-30)**

30/30 answers locked — synthesis in `../docs/JARVIS_30_ANSWERS_SYNTHESIS.md` — brain now **Anthropic Claude 3.5 Sonnet primary + xAI Grok secondary** (Claude+Grok removed)

## Quick start (7-day sprint)
```bash
cd jarvis-app
npm install
cp .env.example .env.local # fill DATABASE_URL + CLAUDE_API_KEY + GROK_API_KEY + GMAIL_*
npm run dev # 0.0.0.0:3000 — PWA, chat-first, mic button (Vesper)
```
Deploy to Vercel:
1. Push branch `arena/6c47af3d-shadow-operation` → Vercel import jarvis-app folder
2. Set env vars same as .env.example (CLAUDE_API_KEY + GROK_API_KEY via XAI_BASE_URL https://api.x.ai/v1)
3. Cron auto-active via vercel.json (*/15 + daily 05:45) or stay_hobby_0 $0 via n8n WF6

## What's inside (30 answers mapped, Grok+Claude)
- **Hosted & connected:** Vercel + Neon free (cloud truth, no Beelink v1) + vercel.json cron 15min (or n8n timer)
- **Agent primarily:** **Claude 3.5 Sonnet primary + Grok-2 secondary** (was Claude+Grok claude-3-5-sonnet + grok-2-latest now removed) — system prompt = 8 Hard Rules + R9-11, does VET→DRAFT→TRACK→Triage→Whop — logic in `lib/jarvis.ts` tries Claude first, fallback Grok via anthropic+grok SDK at api.x.ai/v1
- **Real-life JARVIS for bros:** PWA chat + mic (Whisper via Grok) + 08:45 voice briefing (ElevenLabs Vesper 20yo playful witty) → all 3 channels ping (Telegram+Gmail+Signal) + equal approve + admin SEND/money gate
- **Pipeline pages:**
  - `/` — Pipeline board SCOUT→WHOP + butler briefing (Vesper)
  - `/drafts` — Swipe deck (human swipe keeps Gate G4) — DRAFT+INBOX → SEND
  - `/omar` — Thu→Sun tracker + camera scan OCR (Claude Vision + Grok Vision fallback, Tesseract.js) → 1%+25 auto PASS/FAIL + Sun 09:00 email shooter
  - `/content` — Content G4 queue38 (TubeGen 30m -> OpusClip -> Higgsfield per-clip)
  - `/social` — Social Buffer Team unlimited + Chatfuel/ManyChat 8ch
  - `/admin` — Admin whole pipeline + Jive One permanent Big Red Button
  - `/n8n` — n8n 7 WFs embedded (WF7 Jive Vesper broadcast)
  - `/jarvis` — Chat-first + 🎙️ mic + 🔊 briefing (Hey Jarvis wake-word native in v2 30d, Vesper voice)
  - `/bros` — Squad 3-5 + per-niche ownership + Google OAuth invite-only

## How it brings Real-life JARVIS to any operation with bros
1. **Hosted:** Cloud Vercel always-on — bros open URL on iPhone/Android/laptop, no install (PWA installable).
2. **Connected:** Gmail API (scott.abuya@gmail.com), Linear SHA, Whop, ManyChat 8ch — all OAuth in settings + Grok/Claude keys.
3. **Agent primarily:** Cron auto-runs while you sleep (auto_while_sleep) — VET auto-rejects RED (<2% ER), drafts 6/day via Claude Sonnet, triages replies (3-email cap→FINAL TERMS via Grok real-time X), prepares demand test, auto-creates Whop on PASS. You only swipe SEND + sign + money.
4. **Bros real-time:** Pipeline board live for all, bros comment/approve, JARVIS pings all 3 channels — equal_all but admin guard on money.
5. **Eyes + Hands:** Full vision (Social Blade/HypeAuditor scrape + Grok Vision) + camera OCR for story views (Claude Vision + Grok Vision) + hands-except-money (auto clicks except money).
6. **Memory forever:** Neon stores every DM/email/reply — forever — plus Vesper adaptive learns Fixes/Preferences/Jokes to avoid via device sensors tonality.

## Cost (Grok+Claude, Claude+Grok removed)
Vercel $0→$20 + Neon $0→$19 + Claude $20 + Grok $16 + R2 $5 = **$41 MVP → $80 scaled** < $150 cap — free 14d. *Was Claude+Grok $30, now Claude $20 + Grok $16 = $36 (save, plus Grok X real-time).*

## Success = 1 partner live (Q6)
Outreach→PASS (1%+25)→Whop LIVE→first sale — then native v2.
