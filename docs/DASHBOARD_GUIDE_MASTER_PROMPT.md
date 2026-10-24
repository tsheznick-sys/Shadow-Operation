# Shadow Operation — Dashboard Runs the Apps from Sandbox
**Sandbox:** `im0filypzl0c1k06umq6z` | **One-Port Unified:** `app/backend :8000` serves API + Frontend | **Template:** `mn0k6lgvyo6q8utbj8jh`

---

## 1) OPEN THE DASHBOARD (It IS the App)

**You don't need 9 ports anymore. One URL runs everything.**

### Option A — Arena Live Preview (recommended, no 403)
In your Arena session, next to process `FullStack Unified 8000 v2` click **LIVE PREVIEW** → opens:
```
https://8000-im0filypzl0c1k06umq6z.e2b.app/
```
> This auto-injects header `e2b-traffic-access-token`. Direct raw `https://8000-...e2b.app` without Live Preview = `403 Missing traffic access token`.

### Option B — Inside Sandbox (always works)
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api
open http://localhost:8000/          # frontend shell
open http://localhost:8000/docs      # Swagger
open http://localhost:8000/app       # same frontend
```

**Verify it's up:**
```bash
curl -s http://localhost:8000/health | jq
# {"status":"ok","version":"2.0.0","publisher":{"posts_day":6,"stories_day":8,"cap":"G4 approve + 25/day/account"}}
```

---

## 2) WHAT THE DASHBOARD HAS — 5 Tabs

Open `/` → you see left nav `SHADOW OPS Unified v2`:

| Tab | Icon | What it runs | Backend it controls |
|-----|------|--------------|---------------------|
| **Questions** | ❓ | Every Run • MCQ • Add | `GET/POST /api/questions/` auto-seeded if empty |
| **Publisher** | 🎬 | 6 HSO • Veo3 • Queue | `POST /api/content/seed-day1` → `POST /api/video/generate-day1` → `POST /api/publish/schedule-day1` → G4 approve |
| **Funnel** | 🔗 | Tripwire • Whop • Pages | `POST /api/funnels/seed-tripwire` → 4 pages with Whop checkout |
| **ManyChat** | 💬 | Flows • 8 platforms | `POST /api/flows/seed-demo` → 4 live flows, webhooks `/webhooks/*` |
| **Auth** | 🔐 | Creators • Accounts | `POST /api/auth/` CreatorAccount |

Footer links: `/docs` (Swagger) + `/health` (live status).

---

## 3) STEP-BY-STEP — DO THIS IN ORDER

### Step 0 — Check Health (30 sec)
1. Open dashboard `https://8000-im0filypzl0c1k06umq6z.e2b.app/`
2. Left nav shows `BE: ok 8000`, `DB: unified sqlite→postgres`, `Pay: Whop`
3. Or `curl http://localhost:8000/health` should be `ok`.

### Step 1 — Questions (Every Run) — 2 min
1. Click **Questions** tab.
2. See `Count: 5 • Auto-seeded if empty`. Default 5 Qs:
   - HSO framework? → Hook Story Offer
   - $1.50 CPM platform? → ManyChat Post-Purchase Clip
   - G4 gate? → Human approve before publish
   - Whop replaces? → Stripe
   - Veo3 fallback? → Pillow 720x1280
3. Try **Question Tab**: select A/B/C/D radio → **Submit** → see ✅/❌
4. Switch to **Addition Tab** → fill `Question + Option A/B/C/D + Correct + category` → **Add Question** → appears every run (persisted in `Question` table, `GET /api/questions/`).
5. Optional: **Re-seed 7** rebuilds canonical 7 (6 publisher+1 funnel).

> API: `curl -s http://localhost:8000/api/questions/ | jq .count` → 5+

### Step 2 — Publisher (Create 6 HSO Videos) — 3 min
1. Click **Publisher**.
2. Click **Seed Day 1 (6)** → generates 6 HSO ContentItems in DB (`/api/content/seed-day1`):
   - `@shadow.cinema.ai` ×2 (Instagram 09:00, 19:00)
   - `@shadow.edits.ai` ×2 (TikTok 10:00, 20:00)
   - `@vault.prompt.lab` ×2 (Instagram 11:00, 18:00)
3. See grid `Content Queue — 6 HSO` each with hook/story/offer + `prompt_id` + `render_path`.
4. Click **Generate Videos** → `POST /api/video/generate-day1` → creates 9:16 placeholders `outbound/renders/@shadow.cinema.ai/p01_20h_to_20m.mp4` etc (gold/black Pillow → `imageio` mp4). In Arena `veo_configured:true` but fallback; on Fly with `GOOGLE_API_KEY` it calls real Veo3 8s.
5. Click **Schedule → queue** → `POST /api/publish/schedule-day1` → moves 6 ContentItems → Post queue `pending_approval` (G4 gate).
6. In `Publish Queue` click **Approve → posted** per post → `POST /api/publish/approve/{post_id}` → status `posted` → would call Meta Graph API with `META_ACCESS_TOKENS` (from `.env`) to publish to IG/TikTok.

> Verify: `curl -s http://localhost:8000/api/content/ | jq .content[].prompt_id` → 6, `curl -s http://localhost:8000/api/publish/ | jq .queue[].status`

### Step 3 — Funnel (Tripwire $27 → $79 → $19/mo) — 2 min
1. Click **Funnel**.
2. Click **Seed Vault Tripwire (4 pages)** → `POST /api/funnels/seed-tripwire` creates:
   - Funnel `Vault Tripwire` (tripwire, live, `whop_store_url https://whop.com/shadow-vault-niche2`)
   - 4 Steps + 4 Pages:
     1. **Squeeze — Free Chapter** (`/vault-tripwire/squeeze`) → hook `20h→20m: Free chapter (35 prompts)` → offer `Email → free chapter PDF + Loom 1`
     2. **Tripwire — $27 Vault Lite** (`/vault-tripwire/checkout`) → bump `Prompt Pack $9` → oto `Vault $79`
     3. **OTO — $79 Vault** (`/vault-tripwire/oto`) → stack `$497→$79`
     4. **Thank You + Continuity $19/mo** (`/vault-tripwire/thankyou`) → offer `$19/mo Prompt Lab`
   - Each page `builder_json` has `headline + video loom placeholder + whop_checkout url?ref=@shadow.cinema.ai + order_bump + countdown`
3. Browse `Funnels — 1` + `Pages — 4`. Each shows `headline/story/offer` + `builder_json` preview.

> API: `curl -s http://localhost:8000/api/funnels/ | jq .funnels[0].whop_store_url` + `curl -s http://localhost:8000/api/pages/ | jq .pages[].slug`

### Step 4 — ManyChat (8 Platforms) — 2 min
1. Click **ManyChat**.
2. Click **Seed Demo Flows (4)** → `POST /api/flows/seed-demo` creates 4 `live` flows:
   - **Keyword VAULT → Whop Checkout** (`keyword:VAULT`, platform `all`)
   - **Welcome** (`welcome`)
   - **Default Reply** (`default_reply` → ai support)
   - **Post-Purchase** (`whop_purchase` → ManyChat post-purchase Clip $1.50 CPM)
3. See `Flows — 4` + `Subscribers — 0`.
4. Copy webhook URLs for Meta App setup:
   ```
   GET https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/messenger?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=123
   GET https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/instagram?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=123
   POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/whop
   POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/telegram
   POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/tiktok
   POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/youtube
   POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/whatsapp
   POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/x
   POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/discord
   ```
5. Verify: `curl "http://localhost:8000/webhooks/instagram?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test"` → `test`

> All 8 platforms use single `META_VERIFY_TOKEN=shadow_manychat_verify_2024` + `META_APP_ID=2104082527135617` from `app/backend/.env`

### Step 5 — Auth (Creator Accounts) — 1 min
1. Click **Auth**.
2. Create `email` + `handle @shadow...` → **Create** → `POST /api/auth/` → stored `CreatorAccount` in unified DB (shared across Publisher/Funnel/ManyChat).
3. List shows `handle • email • status`.

### Step 6 — Test Whop Checkout (End-to-End)
1. In Funnel tripwire, the `builder_json.wh​op_checkout.url` is `https://whop.com/shadow-vault-niche2?ref=@shadow.cinema.ai` (uses `WHOP_API_KEY=apik_kVrTn...` + `WHOP_STORE_URL` from `.env`).
2. Buying triggers `POST /webhooks/whop` → creates `Subscriber.whop_purchased=true` → ManyChat Post-Purchase flow fires.
3. Replace `?ref=` per creator for 60/40 split tracking.

### Step 7 — Re-run Anytime (Persistent)
All tabs read from **single `data.db` sqlite → `shadow_ops` postgres in prod** (10 tables: ContentItem, Post, Funnel, FunnelStep, Page, Subscriber, Flow, MessageLog, Broadcast, CreatorAccount, Question).
- Reload page = same data.
- Restart sandbox: `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir app/backend` + `npm run build` already done → frontend served at `/ + /app + /assets` (no separate 3000 needed, but `vite.config.js` proxy still works for dev).

---

## 4) TIKTOK + YOUTUBE LINKS (All 3 Brands)

Your 6 HSO pieces map to 3 owned pages — each needs TikTok + YouTube. Create these now if missing:

| Brand (Page) | Instagram (existing) | TikTok | YouTube (@handle) | YouTube Channel URL | Content focus |
|--------------|----------------------|--------|-------------------|---------------------|---------------|
| **@shadow.cinema.ai** | https://instagram.com/shadow.cinema.ai | https://tiktok.com/@shadow.cinema.ai | https://youtube.com/@shadow.cinema.ai | `https://www.youtube.com/channel/YOUR_ID` → put ID in `.env:YOUTUBE_CHANNEL_ID` | Cinematic AI video, Veo3 breakdowns |
| **@shadow.edits.ai** | https://instagram.com/shadow.edits.ai | https://tiktok.com/@shadow.edits.ai | https://youtube.com/@shadow.edits.ai | `https://www.youtube.com/channel/YOUR_ID_2` | Editing AI transitions, 9min Reel system |
| **@vault.prompt.lab** | https://instagram.com/vault.prompt.lab | https://tiktok.com/@vault.prompt.lab | https://youtube.com/@vault.prompt.lab | `https://www.youtube.com/channel/YOUR_ID_3` | Prompt Lab 1:1, Stack $497→$27 |

**Day 1 posting map (from `marketing/publisher/content_pieces/`):**
- `p01_20h_to_20m` @shadow.cinema.ai IG 09:00 → also post to TikTok/YouTube Shorts
- `p02_client_250` @shadow.cinema.ai IG 19:00
- `p03_5_transitions` @shadow.edits.ai TikTok 10:00 → cross-post to YT Shorts + IG Reel
- `p04_9min_edit` @shadow.edits.ai TikTok 20:00
- `p05_one_to_one` @vault.prompt.lab IG 11:00 → TikTok
- `p06_stack` @vault.prompt.lab IG 18:00 → YouTube community + TikTok

**Connect them in sandbox:**
- Set in `app/backend/.env` → `YOUTUBE_API_KEY` + `TIKTOK_CLIENT_KEY/SECRET` (from https://developers.tiktok.com → Manage apps → redirect `https://8000-...e2b.app/webhooks/tiktok`, and https://console.cloud.google.com → Enable YouTube Data v3 → API key).
- Verify YouTube webhook: `curl http://localhost:8000/webhooks/youtube` → should 200; TikTok same.

---

## 5) BACKGROUND IMAGES + PROFILE PICS + BIOS (All 3)

### Profile Pics (1:1, 800×800, gold/black)
Stored as placeholders in `outbound/renders/{page}/{prompt_id}.mp4` (720×1280 frame with gold bar + page name) — replace with real profile PNGs:

- **@shadow.cinema.ai** — Gold Anamorphic lens icon on matte black, text `SHADOW CINEMA` thin serif, border gold `1px`. Use for IG/TikTok/YouTube avatar.
  - Download template: `outbound/renders/@shadow.cinema.ai/p01_20h_to_20m.mp4` first frame (screenshot) → crop 1:1 → or generate via `/api/video/generate/{id}` → replace `Image.new(720,1280,(10,10,10))` draw in `video_gen.py`.
- **@shadow.edits.ai** — Timeline + AI spark icon, `SHADOW EDITS` monospace, same gold/black.
- **@vault.prompt.lab** — Vault door + lab beaker icon, `VAULT PROMPT LAB` bold.

**Quick create (local):**
```bash
python3 -c "from PIL import Image,ImageDraw,ImageFont; W=800; H=800; im=Image.new('RGB',(W,H),(10,10,10)); d=ImageDraw.Draw(im); d.rectangle([0,0,W,140],fill=(212,175,55)); d.text((20,55),'@shadow.cinema.ai',fill=(0,0,0)); im.save('profile_shadow_cinema.png')"
```

### Background Images / Banners (16:9, 1920×1080 + 2560×1440 for YouTube banner)
- **Style:** Same black bg + gold bottom gradient, white hook text + `DM VAULT` CTA. From `video_gen.py::_render_placeholder` wrap logic — edit `H,W` to 1920×1080.
- **YouTube banner safe area 1546×423 center** — keep gold bar top, logo center.
- Existing 6 renders are your first 6 background stills — extract frame:
  ```bash
  ffmpeg -i outbound/renders/@shadow.cinema.ai/p01_20h_to_20m.mp4 -vframes 1 -q:v 2 banner_p01.jpg
  # or screenshot https://8000-...e2b.app/renders/@shadow.cinema.ai/p01_20h_to_20m.mp4 preview
  ```

### Bios (copy-paste, 150 chars IG/TikTok, 1000 chars YouTube)

**@shadow.cinema.ai**
- **IG/TikTok bio (150):** `20h → 20m. Same $500 look. One prompt → Veo3. ⬇️ Free Vault (35 prompts + Loom) DM VAULT`
- **YT About:** `Shadow Cinema AI — I turn 20 hours of Premiere+Midjourney into 20 minutes with one Veo3 prompt. Daily cinematic breakdowns, Notion OS, and the Vault Stack $497→$27. Free chapter → whop.com/shadow-vault-niche2?ref=@shadow.cinema.ai | Business: whop DM`
- **Link in bio:** `https://whop.com/shadow-vault-niche2?ref=@shadow.cinema.ai` + `https://8000-...e2b.app/webhooks/instagram` for auto-DM

**@shadow.edits.ai**
- **IG/TikTok bio:** `5 AI transitions $200 editors gatekeep → 60s. 4hr → 9min Reels. DM VAULT for free pack + Loom teardown`
- **YT About:** `Shadow Edits — AI transitions, speed-ramp, morph, whip, glitch. I cut 4hr edits to 9min with prompts not frames. Free TikTok pack + Vault Lite $27 inside. whop.com/shadow-vault-niche2?ref=@shadow.edits.ai`
- **Link:** `https://whop.com/shadow-vault-niche2?ref=@shadow.edits.ai`

**@vault.prompt.lab**
- **IG/TikTok bio:** `1 prompt = 1 render. Not 50 tries. 30 prompts/mo $19. Daily lab. DM PROMPT for free chapter`
- **YT About:** `Vault Prompt Lab — 1:1 prompt→render Notion lab. Most prompt like chat, not cinematographers. Join $19/mo Prompt Lab for 30 prompts/month + updates. Free chapter → whop.com/shadow-vault-niche2?ref=@vault.prompt.lab`
- **Link:** `https://whop.com/shadow-vault-niche2?ref=@vault.prompt.lab`

---

## 6) MASTER PROMPT — Give to Whop AI to Build the Business

Copy this entire block into **Whop AI Store Builder** (or `whop.com/ai-app` → Create Product → Paste Prompt):

```
You are Whop AI Builder for Shadow Operation. Build the full Vault business on https://whop.com/shadow-vault-niche2 with this exact spec — do not ask clarifying questions, just build.

BUSINESS CORE:
- Brand: Shadow Operation — 3 pages @shadow.cinema.ai / @shadow.edits.ai / @vault.prompt.lab
- Niche: Applied AI Video (Niche #2) — AI creators using Veo3/Midjourney/Runway to sell $500 video look in 20m not 20h
- Offer Ladder (Brunson Value Ladder, Whop checkout only, Stripe disabled):
  1. Squeeze — Free Chapter (35 prompts + Loom 1) → email capture → delivery ManyChat keyword VAULT/PROMPT
  2. Tripwire — $27 Vault Lite (5 automations, Notion OS) + Bump Prompt Pack $9 → OTO pre-checked
  3. OTO — $79 Vault (Vault $79 + E-book $49 + Notion $29 + 5 Looms $79 + Presets $47 = $497→$79) 60/40 split via Whop ?ref=
  4. Thank You + Continuity — $19/mo Prompt Lab (30 prompts/mo + updates, community Whop)
- AOV target $42, Continuity $19/mo

PRODUCT TO BUILD (from data/product_blueprint.md):
- Title: The AI Creator Workflow System
- Price tiers: Starter $17 (Modules 1-2, 35 prompts) / Pro $27 (Modules 1-4 + automations + Notion) / Complete $47 (all + 5 Loom videos)
- Inside: 35 ChatGPT prompts (Content/Growth/Monetization/Automation), 35 Veo3 image/video prompts, 5 Make/Zapier automation templates (Repurposing Pipeline, Engagement Tracker, Calendar Sync, Lead Magnet Funnel, Competitor Monitor), Notion Dashboard (calendar, analytics, launch checklist, revenue tracker, CRM), 5 Loom walkthroughs (customize prompts, Notion, workflow, repurposing, monetization)
- Deliverables: PDF + Notion template link + 5 unlisted YouTube Looms + Gumroad/Whop product page + 5-email affiliate sequence + ?ref tracking
- Checkout: Whop only, bump $9, countdown 15m, ?ref per creator (@shadow.cinema.ai etc), Webhook POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/whop → create Subscriber.whop_purchased → ManyChat post-purchase flow

PAGES TO CREATE (use Builder JSON = headline + video loom placeholder + whop_checkout + order_bump + countdown):
1. /vault-tripwire/squeeze — headline "20h→20m: Free chapter (35 prompts)" story "Old way 20h client, new 1 prompt → Veo3. Epiphany Bridge." offer "Email → free chapter PDF + Loom 1" — published true
2. /vault-tripwire/checkout — headline "Client paid $0 → I charged $250. One prompt." story "Same phone, different prompt: anamorphic golden hour 35mm. Notion OS." offer "$27 Vault Lite (5 automations, Whop checkout ?ref=)" bump "Prompt Pack $9" oto "Vault $79"
3. /vault-tripwire/oto — headline "Vault Stack $497→$79 today" story "Vault $79 + E-book $49 + Notion $29 + Looms $79 + Presets $47" offer "One-click OTO $79"
4. /vault-tripwire/thankyou — headline "One prompt = one render. Not 50 tries." story "Daily prompt lab: 1:1 prompt→render. Fail = prompting like chat not DP." offer "Join $19/mo Prompt Lab — 30 prompts/mo + updates"

CONTENT TO SYNC (Publisher — 6 HSO from POST /api/content/seed-day1):
- p01_20h_to_20m @shadow.cinema.ai IG 09:00 hook "20 hours of AI video → 20 minutes. Same $500 look." story "Old: 20h per client (Premiere+Midjourney). New: 1 prompt → Veo3 → done." offer "DM VAULT — free chapter (35 prompts + Loom) → render today." caption "20h → 20m. DM VAULT #aivideo" CTA DM VAULT → ManyChat keyword VAULT → Whop squeeze?ref
- p02_client_250 @shadow.cinema.ai IG 19:00 hook "Client paid $0 → I charged $250. One prompt." story "Left: shaky phone. Right: cinematic render same scene." offer "Full workflow in $27 Vault Lite. DM VAULT preview."
- p03_5_transitions @shadow.edits.ai TikTok 10:00 hook "5 AI transitions editors charge $200 for — 60 seconds." story "Whip/glitch/morph/speed-ramp/match-cut" offer "Want 5 presets? DM VAULT — free TikTok pack."
- p04_9min_edit @shadow.edits.ai TikTok 20:00 hook "I edited 4 hrs per Reel. Now 9 minutes." story "Timeline 4hr → 9min (AI auto-cut+caption)." offer "DM VAULT — free Loom teardown."
- p05_one_to_one @vault.prompt.lab IG 11:00 hook "One prompt = One render. Not 50 tries." story "Prompt lab Notion: 1:1 prompt→render." offer "Daily prompt here. 35 inside DM PROMPT → $19/mo"
- p06_stack @vault.prompt.lab IG 18:00 hook "Vault Stack: $497 value → $27 today" story "Vault $79 + E-book $49 + Notion $29 + 5 Looms $79 + Presets $47" offer "15 min preview — DM VAULT."
- Renders: placeholder 9:16 mp4 at outbound/renders/{page}/{prompt_id}.mp4 → mount /renders on Fly via Google Veo3 real (GEMINI_API_KEY AQ.Ab8***MASKED*** works prod, Pillow fallback in sandbox)

MANYCHAT TO WIRE:
- Flows: Keyword VAULT → Whop Checkout (all platforms), Welcome, Default Reply (AI support), Post-Purchase (whop_purchase → $1.50 CPM clip)
- Platforms: Messenger, Instagram, WhatsApp, Telegram, TikTok, X, YouTube, Discord, Whop — verify token shadow_manychat_verify_2024, META_APP_ID 2104082527135617, META_ACCESS_TOKENS EAAd5pu...
- Subscribers table: capture platform_user_id + whop_customer_id + tags + custom_fields json, G4 pending_approval, G8 opt-out, Hard Rules 1-3

DESIGN:
- Colors: black #0a0a0a bg, gold #D4AF37 accents, white #fff text, charcoal borders rgba(255,255,255,0.1)
- Fonts: Inter/black for headlines, mono for API/BIO blocks
- Pages: gold top bar + black hero + video loom embed + Whop checkout iframe + countdown 15m + stack breakdown table

API TO KEEP:
- Publisher: POST /api/content/seed-day1, POST /api/video/generate-day1, POST /api/publish/schedule-day1, POST /api/publish/approve/{id}
- Funnel: POST /api/funnels/seed-tripwire, GET /api/funnels, GET /api/pages, GET /api/pages/funnel/{id}
- ManyChat: POST /api/flows/seed-demo, GET /api/flows, GET /api/subscribers, webhooks /webhooks/{messenger,instagram,whatsapp,telegram,tiktok,x,youtube,discord,whop}
- Auth: POST /api/auth {email,handle} → CreatorAccount
- Questions: GET /api/questions auto-seed 5→7 HSO multiple-choice A-D + POST /api/questions/ + POST /api/questions/answer
- Health: GET /health, GET /docs, single DB sqlite:///./data.db → postgres shadow_ops, CORS *

LAUNCH PLAN:
Week1 validation survey to 12 GREEN Niche #2 creators, Week2 build product, Week3 Gumroad→Whop listing + Looms, Week4 launch to 1020 GREEN creators affiliate 40% commission, Week5-8 track via analytics + ManyChat broadcasts.

Build now. Output: Whop store live URL, 4 pages live with ?ref, 6 contents linked, 4 flows live, confirmation curls for /health /api/funnels /api/pages /webhooks/instagram.
```

**Where to paste:**
1. Go to https://whop.com/dashboard → **Whop AI** (or https://whop.com/ai-apps/create)
2. Paste above → **Generate Store** → set `WHOP_API_KEY=apik_kVrTn...` + `WHOP_STORE_URL=https://whop.com/shadow-vault-niche2` → **Deploy**
3. Then in dashboard click Funnel **Seed Tripwire** again to sync Whop → Publisher **Generate Videos** to replace placeholders with Veo3 real renders.

---

## 7) QUICK CURL CHEAT SHEET (Copy-Paste)

```bash
Sandbox: im0filypzl0c1k06umq6z
Base: https://8000-im0filypzl0c1k06umq6z.e2b.app or http://localhost:8000

# Health
curl -s http://localhost:8000/health | jq

# Questions
curl -s http://localhost:8000/api/questions/ | jq .count

# Publisher
curl -X POST http://localhost:8000/api/content/seed-day1
curl -X POST http://localhost:8000/api/video/generate-day1
curl -X POST http://localhost:8000/api/publish/schedule-day1
curl -s http://localhost:8000/api/content/ | jq '.content[].hook'

# Funnel
curl -X POST http://localhost:8000/api/funnels/seed-tripwire | jq .funnel.name
curl -s http://localhost:8000/api/pages/ | jq '.pages[].slug'

# ManyChat
curl -X POST http://localhost:8000/api/flows/seed-demo
curl -s http://localhost:8000/api/flows/ | jq '.flows[].name'

# Webhook verify
curl "http://localhost:8000/webhooks/instagram?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test"

# Renders preview
open http://localhost:8000/renders/@shadow.cinema.ai/p01_20h_to_20m.mp4
```

---

**Next turn:** Tell me which handle you want live first (@shadow.cinema.ai vs @shadow.edits.ai) and I'll generate its profile+ banner pack + connect TikTok/YouTube API keys in `.env` and re-run `npm run build` for you.
