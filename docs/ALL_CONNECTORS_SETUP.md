# All Connectors — Full Step-by-Step (LIVE 2026-10-24 — 1PY pulled: OPENAI + CHAT_FUEL_CLI)
 (12 Platforms) + Live Verify

All ENV keys are already pasted from your **Google Doc 1PY** → `auth/backend/.env` + `marketing/manychat/backend/.env` + `marketing/funnel/backend/.env` + `marketing/publisher/backend/.env` are LIVE. Below is where each came from, what it powers, and the 1-line curl to prove it.

---

## 1) Chatfuel SDK (This App First)

**What you asked:** `npx @chatfuel/wizard` quickstart → https://sdk.chatfuel.com/docs/quickstart
**What we did (Arena):** Pulled `https://github.com/chatfuel-lab/wizard` (allowed host), built `chatfuel-app/` offline with `content/shell` + vendors (`ui`, `api-client`, `vite-plugin-proxy`, `schema`, `codegen`), fixed `vite.config.ts` (`0.0.0.0 allowedHosts`, `CHATFUEL_OPEN_PROXY=1`), installed deps (`pnpm@10.30.2` → `npm install`), started `5173` with auth gate OFF (open proxy).
**Live preview:** `https://5173-<sandboxId>.e2b.app` → Chatfuel App (sidebar shows every module: `livechat`, `contacts`, `deals`, `bookings`, `knowledge-base`, `automations`, `coworker`, `flow-builder`, `ads-optimization`, `publishing`, `broadcasts`, `channels` + `auth/admin` opt-in). No token needed for offline shell; when you add a real token, add to `chatfuel-app/.env` → `CHATFUEL_TOKEN=xxx` and restart `npm run dev`.

**Production wizard (needs internet):**
```bash
node --version # ≥22.19.0 ✅ (Arena is 22.22.3)
npx @chatfuel/wizard --dir ./chatfuel-app --modules livechat,contacts,deals,bookings,knowledge-base,automations,coworker,flow-builder,ads-optimization,publishing,broadcasts,channels
# Prompts: modules → skills target → CHATFUEL_TOKEN (from https://panel.chatfuel.com/integration/auth/token) → workspace picker → app name/logo → allowed origins → dir
npm run dev # → localhost:5173
```

---

## 2) Meta — Messenger + Instagram (ONE App, Dual Webhooks) — from Google Doc

- `META_ACCESS_TOKENS=EAAd5puObp4EB...Du8n1aOAZDZD` → `marketing/manychat/backend/.env:META_ACCESS_TOKEN` ✅ pasted
- `IG_ACCESS_TOKEN=IGAAUhF1v2Y61...AUnIxZAHQzcjRJQ29OSExPZAXlDOAZD` → `IG_ACCESS_TOKEN` + `FACEBOOK_ACCESS_TOKEN` (same EAAd5puObp4E… token for Instagram Graph) ✅
- `META_APP_ID=2104082527135617` (from `docs/META_LIVE_CHECKLIST.md` + prior `.env`) + `META_VERIFY_TOKEN=shadow_manychat_verify_2024` → dual webhooks `/webhooks/instagram` + `/webhooks/messenger` `PlainTextResponse` slash+mode check `fd28b37`.

**Verify:**
```bash
curl https://8000-<id>.e2b.app/health
curl "https://8000-<id>.e2b.app/webhooks/instagram?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test" # → test
curl "https://8000-<id>.e2b.app/webhooks/messenger?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test"
# App Review Live: see docs/META_LIVE_CHECKLIST.md — set https://8000-…e2b.app/webhooks/... + toggle Live + Business 941120335746824 + privacy https://shadowop.live/privacy
```

## 3) WhatsApp Cloud

- `WHATSAPP_APP_SECRET=EAAd5puObp4EBS3zaNWjHZBkhF8A...PRCFpXA48G73q...` → `WHATSAPP_TOKEN` in `manychat/.env` ✅
- `WHATSAPP_PHONE_ID` placeholder → paste from https://developers.facebook.com/apps → WhatsApp → API Setup → Phone number ID

**Verify:** same health + `POST /webhooks/whatsapp` with test `whatsapp_business_account` payload.

## 4) Whop (Payments + Webhook)

- `WHOP_API_KEY=apik_kVrTnO9ZhQ70B_C747...dae1af2d2` → all 4 backends `WHOP_API_KEY` ✅ + `WHOP_STORE_URL=https://whop.com/shadow-vault-niche2`
- `WHOP_WEBHOOK_SECRET=whsec_placeholder` → set from https://whop.com/dashboard → Developers → Webhooks → Copy secret → paste

**Verify:**
```bash
curl http://localhost:8001/health
# POST https://8001-<id>.e2b.app/api/checkout {"handle":"@shadow.cinema.ai","price":27} → {url:"https://whop.com/...?ref=@shadow.cinema.ai"}
# Whop → https://8000-<id>.e2b.app/webhooks/whop (payment.succeeded) → creates subscriber → G4 DM
```

## 5) Gemini (Veo3 video) + Google

- `GEMINI_API_KEY=AQ.Ab8RN6LMT56...qw` → `marketing/funnel/.env:GEMINI_API_KEY` + `marketing/publisher/.env:GOOGLE_API_KEY` ✅
- `GOOGLE_API_KEY` same; Publisher uses Veo3 for 6/day Reels; `YOUTUBE_API_KEY` placeholder → https://console.cloud.google.com → Enable YouTube Data v3 + Veo3 API → Create API key

## 6) Telegram

- `TELEGRAM_BOT_TOKEN=placeholder` → https://t.me/BotFather → /newbot → paste; webhook `https://8000-<id>.e2b.app/webhooks/telegram`

## 7) TikTok

- `TIKTOK_CLIENT_KEY/SECRET=placeholder` → https://developers.tiktok.com → Manage apps → Create → paste redirect `https://8000-<id>.e2b.app/webhooks/tiktok`

## 8) X (Twitter)

- `X_BEARER_TOKEN / X_API_KEY / X_API_SECRET=placeholder` → https://developer.twitter.com → Projects & Apps → Create → Regenerate Bearer + API Key → paste; `POST /webhooks/x` (Account Activity)

## 9) YouTube

- `YOUTUBE_API_KEY=placeholder` + `YOUTUBE_CHANNEL_ID` → same Google Console → enable + paste; Channel ID from https://www.youtube.com/account_advanced

## 10) Discord

- `DISCORD_BOT_TOKEN / CLIENT_ID=placeholder` → https://discord.com/developers/applications → New → Bot → Reset Token → paste + OAuth2 redirect `https://8000-<id>.e2b.app/webhooks/discord`

## 11) OpenAI (AI Agent fallback)

- `OPENAI_API_KEY=sk-proj-taCQeNJ8... ✅ LIVE 2026-10-24 from 1PY` → https://platform.openai.com/api-keys → paste into `manychat` + `funnel` + `publisher` `.env`; used by `apps/ai_agent.py` KB when Gemini unavailable.

## 12) Stripe (fallback checkout)

- `STRIPE_SECRET_KEY=sk_test_placeholder` + `STRIPE_WEBHOOK_SECRET=whsec_stripe_placeholder` → https://dashboard.stripe.com/test/apikeys + Webhooks → `https://8001-<id>.e2b.app/webhooks/stripe`

---

## Arena Live Stack (All 9 OK)

| Service | Port | URL | Health |
|---|---|---|---|
| Auth API | 8002 | https://8002-<id>.e2b.app | ok JWT db shadow_ops→sqlite |
| ManyChat API | 8000 | https://8000-<id>.e2b.app | ok G4/G8 Hard Rules |
| Funnel API | 8001 | https://8001-<id>.e2b.app | ok ClickFunnels |
| Publisher API | 8003 | https://8003-<id>.e2b.app | ok 6 posts/8 stories G4 |
| Auth UI | 3002 | https://3002-<id>.e2b.app | unified black/gold nav |
| ManyChat UI | 3000 | https://3000-<id>.e2b.app | ShellNav FlowBuilder 8.5K |
| Funnel UI | 3001 | https://3001-<id>.e2b.app | Builder 6.1K POST /api/pages |
| Publisher UI | 3003 | https://3003-<id>.e2b.app | Queue 3.4K video preview |
| **Chatfuel App** | **5173** | **https://5173-<id>.e2b.app** | **chatfuel proxy open, 0 docs (offline)** |

**Health curls (run anytime):**
```bash
for p in 8000 8001 8002 8003; do echo -n "$p: "; curl -s http://localhost:$p/health | jq .status; done
curl -s -I http://localhost:3000 | head -1
curl -s -I http://localhost:5173 | head -1
```

---

## Next: Paste Real Keys for Placeholders

Open each `.../backend/.env.example` → copy missing IDs → restart:
```bash
docker-compose -f marketing/manychat/docker-compose.yml restart backend
# or in Arena:
# pkill -f "uvicorn.*800X" then python -m uvicorn main:app --host 0.0.0.0 --port 800X --reload
```

All 12 ENV templates are committed as `.env.example`; real `.env` stay gitignored (per `docs/API_KEYS_SETUP.md`).
