# YouTube Only — This Workspace

**Sandbox:** `im0filypzl0c1k06umq6z` **Port:** `8000` **Branch:** `arena/6c47af3d-shadow-operation` (`pr_open`)
**One URL runs everything:** `http://localhost:8000` inside sandbox → `https://8000-im0filypzl0c1k06umq6z.e2b.app/` via Live Preview (no 403)

> This file is YouTube-only. Other platforms (TikTok/X/Discord/etc) are disabled in this workspace. Only YouTube webhook + YouTube Shorts/Looms matter.

---

## 1) Dashboard — YouTube Mode

Your dashboard at `/` is already YouTube-ready. Use only these tabs:

| Tab | Use for YouTube |
|-----|-----------------|
| **Publisher 🎬** | Generates your 6 YouTube Shorts (9:16) + titles/hooks — same HSO → repurpose for YouTube |
| **Funnel 🔗** | Hosts your 4 Whop pages linked from YouTube descriptions |
| **ManyChat 💬** | YouTube webhook lives here — `POST /webhooks/youtube` + flows for comment → Whop |
| **Questions ❓** | Community polls → YouTube Community Tab |

**Ignore:** TikTok/X/Discord/WhatsApp/Telegram inside ManyChat — leave empty.

**Your 6 pieces are already YouTube Shorts (just re-upload):**
- `p01_20h_to_20m` @shadow.cinema.ai → YouTube Short #1
- `p02_client_250` @shadow.cinema.ai → YouTube Short #2
- `p03_5_transitions` @shadow.edits.ai → YouTube Short #3
- `p04_9min_edit` @shadow.edits.ai → YouTube Short #4
- `p05_one_to_one` @vault.prompt.lab → YouTube Short #5
- `p06_stack` @vault.prompt.lab → YouTube Short #6

Files on disk: `outbound/renders/{page}/{prompt_id}.mp4` → preview at `http://localhost:8000/renders/...` or `http://localhost:8000/outbound/renders/...`

---

## 2) Step-by-Step — YouTube Only

### Step 0: Open Dashboard (10 sec)
- Arena → Process `FullStack Unified 8000 v2` → **Live Preview** → `https://8000-im0filypzl0c1k06umq6z.e2b.app/`
- Check `BE: ok 8000` on left nav → `curl http://localhost:8000/health` → `ok`

### Step 1: Create 6 Shorts for YouTube (2 min)
1. Dashboard → **Publisher** → **Seed Day 1 (6)** → 6 HSO load
2. **Generate Videos** → creates 720x1280 gold/black placeholders (free) — real Veo3 on Fly with `GEMINI_API_KEY`
3. **Schedule → queue** → G4 queue → **Approve** to mark posted (no IG publish in YouTube-only)
4. Download: right-click preview `/$render_path` or `ls outbound/renders` → upload to YouTube Studio (next step) — no API/billing needed

### Step 2: Funnel — 4 Pages for YouTube Description Links (1 min)
1. Dashboard → **Funnel** → **Seed Vault Tripwire**
2. Creates Funnel `Vault Tripwire` → 4 pages:
   - `/vault-tripwire/squeeze` (free chapter)
   - `/vault-tripwire/checkout` ($27 Vault Lite + bump $9)
   - `/vault-tripwire/oto` ($79 Vault $497→$79)
   - `/vault-tripwire/thankyou` ($19/mo Prompt Lab)
3. Each page `builder_json.wh​op_checkout.url = https://whop.com/shadow-vault-niche2?ref=@shadow...` → paste this Whop link in every YouTube Short description + pinned comment

### Step 3: ManyChat — Activate YouTube Webhook (1 min, FREE)
Your webhook is already wired: `app/backend/routers/youtube.py` → `GET /webhooks/youtube` verify `shadow_manychat_verify_2024` + `POST /webhooks/youtube` returns `{ok:true}`

But Cloud Shell error you saw is correct: `localhost:8000` fails in Cloud Shell → run curl **inside E2B sandbox** only:
```bash
# INSIDE E2B sandbox terminal:
curl "http://localhost:8000/webhooks/youtube?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test_youtube" # → test_youtube
```

### Step 4: Create YouTube Channels (free, no card)
Create 3 channels (or 1 main + 2 future):
- **@shadow.cinema.ai** → `https://youtube.com/@shadow.cinema.ai` → Cinematic AI
- **@shadow.edits.ai** → `https://youtube.com/@shadow.edits.ai` → Edits Fast
- **@vault.prompt.lab** → `https://youtube.com/@vault.prompt.lab` → Prompt Lab

Set avatar/banner/bio below → upload 6 Shorts → add Whop link in description

---

## 3) YouTube Links Only

| Channel | YouTube URL | Handle to Claim | Channel ID (free) | What to post |
|---------|-------------|-----------------|-------------------|--------------|
| **@shadow.cinema.ai** | `https://youtube.com/@shadow.cinema.ai` | youtube.com/handle → Create `@shadow.cinema.ai` | `youtube.com/account_advanced` → UC... (paste to PubSub) | `p01,p02` cinematic Shorts |
| **@shadow.edits.ai** | `https://youtube.com/@shadow.edits.ai` | Same → `@shadow.edits.ai` | Same → UC... | `p03,p04` transitions/9min Shorts |
| **@vault.prompt.lab** | `https://youtube.com/@vault.prompt.lab` | Same → `@vault.prompt.lab` | Same → UC... | `p05,p06` prompt lab/stack Shorts |

**Free webhook subscribe (no API key, no billing):**
```bash
# Replace UC_YOUR_ID with each Channel ID from account_advanced
curl -X POST https://pubsubhubbub.appspot.com/subscribe \
  -d hub.callback=https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/youtube \
  -d hub.topic=https://www.youtube.com/xml/feeds/videos.xml?channel_id=UC_YOUR_ID \
  -d hub.mode=subscribe
```
For sandbox local test use: `curl "http://localhost:8000/webhooks/youtube?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test_youtube"`

---

## 4) Background Images + Profile Pics + Bios — YouTube Only

All already generated in workspace root (no billing):

**Profile Pics (800x800 1:1, upload as YouTube Avatar):**
- `profile_shadow_cinema.png` 959KB — black/gold anamorphic lens, SHADOW CINEMA
- `profile_shadow_edits.png` 242KB — timeline+AI spark, SHADOW EDITS
- `profile_vault_prompt.png` 781KB — vault door+beaker, VAULT PROMPT LAB

**Banners (2560x1440, YouTube Banner + Shorts thumbnail bg):**
- `banner_shadow_cinema.png` 1.4MB — `20h→20m Same $500 look` + `DM VAULT`
- `banner_shadow_edits.png` 1.8MB — `5 Transitions →60s` + `4hr→9min`
- `banner_vault_prompt_lab.png` 2.3MB — `One Prompt = One Render` + `DM PROMPT`
- Also extract from renders: `ffmpeg -i outbound/renders/@shadow.cinema.ai/p01_20h_to_20m.mp4 -vframes 1 bg.jpg`

**How to upload (free):**
- `https://studio.youtube.com` → left **Customization → Branding** → Upload **Picture** (choose `profile_*.png`) → Upload **Banner** (`banner_*.png`) → **Watermark** same profile → Save
- Then **Content → Shorts** → Upload 6 mp4s → Title = hook, Description = story + offer + Whop link

**Bios — Copy-Paste for YouTube About (YouTube allows 1000 chars):**

**@shadow.cinema.ai — YouTube About:**
```
Shadow Cinema AI — I turn 20 hours of Premiere+Midjourney into 20 minutes with one Veo3 prompt.
Daily cinematic breakdowns, Notion OS, Vault Stack $497→$27.
Free chapter (35 prompts+Loom): https://whop.com/shadow-vault-niche2?ref=@shadow.cinema.ai
Business: whop DM | Shorts daily 09:00 + 19:00 EAT
```
**Bio short (for Shorts overlay):** `20h→20m Same $500 look. Free Vault ↓`

**@shadow.edits.ai — YouTube About:**
```
Shadow Edits — 5 AI transitions editors charge $200 for →60s. I cut 4hr edits to 9min with prompts not frames.
Free TikTok pack + Vault Lite $27: https://whop.com/shadow-vault-niche2?ref=@shadow.edits.ai
Shorts daily 10:00+20:00 EAT
```
**Bio short:** `4hr→9min Reels. Free pack ↓`

**@vault.prompt.lab — YouTube About:**
```
Vault Prompt Lab — 1 prompt =1 render. Not 50 tries. Most prompt like chat, not cinematographers.
Join $19/mo Prompt Lab (30 prompts/mo+updates): https://whop.com/shadow-vault-niche2?ref=@vault.prompt.lab
Free chapter: DM PROMPT
```
**Bio short:** `1 prompt=1 render. $19/mo ↓`

---

## 5) Master Prompt for Whop AI — YouTube Only

Paste this entire block into `https://whop.com/dashboard` → **Whop AI** → **Generate Store** (or `whop.com/ai-apps/create`):

```
You are Whop AI Builder for Shadow Operation — YOUTUBE ONLY WORKSPACE. Build only YouTube business on https://whop.com/shadow-vault-niche2 — ignore TikTok/X/Discord/IG if mentioned. Do not ask questions, just build.

BUSINESS CORE — YOUTUBE ONLY:
- Brands (YouTube channels): @shadow.cinema.ai / @shadow.edits.ai / @vault.prompt.lab — Niche: Applied AI Video (Niche #2) — sell $500 video look in 20m not 20h via Veo3
- YouTube content: 6 Shorts HSO already seeded (p01-p06) → upload to YouTube Shorts + Looms unlisted for deliverables
- Offer Ladder (Brunson, Whop only, Stripe disabled):
  1. Squeeze — Free Chapter (35 prompts+Loom1) → email from YouTube description link → ManyChat YouTube comment keyword VAULT/PROMPT
  2. Tripwire — $27 Vault Lite (5 automations, Notion OS) + Bump $9 → OTO checked
  3. OTO — $79 Vault ($497→$79 stack: $79+$49+$29+$79+$47) 60/40 via Whop ?ref=@shadow.cinema.ai etc
  4. Thank You + Continuity — $19/mo Prompt Lab (30 prompts/mo, community Whop)
- AOV $42, Continuity $19/mo — Whop checkout countdown 15m

PRODUCT — The AI Creator Workflow System:
- Title: The AI Creator Workflow System — YouTube Shorts Edition
- Tiers: Starter $17 (Modules1-2 35 prompts) / Pro $27 (Modules1-4 + automations + Notion) / Complete $47 (all+5 YouTube Looms)
- Inside: 35 ChatGPT prompts, 35 Veo3 image/video prompts, 5 Make/Zapier templates (Repurposing Pipeline, Engagement Tracker, Calendar Sync, Lead Magnet Funnel, Competitor Monitor), Notion Dashboard, 5 Loom walkthroughs (customize prompts, Notion, workflow, repurposing, monetization) — all hosted as unlisted YouTube Looms
- Deliverables: PDF + Notion template link + 5 unlisted YouTube Looms + Whop product page + 5-email affiliate sequence + ?ref tracking per YouTube channel
- Checkout: Whop only, ?ref=@shadow.cinema.ai etc, webhook POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/whop → Subscriber.whop_purchased → ManyChat YouTube post-purchase

PAGES (4 with builder_json: headline+video loom placeholder+whop_checkout+order_bump+countdown):
1. /vault-tripwire/squeeze — headline "20h→20m: Free chapter (35 prompts)" story "Old way 20h client, new 1 prompt → Veo3. Epiphany Bridge." offer "Email → free chapter PDF+Loom1" published true
2. /vault-tripwire/checkout — headline "Client paid $0 → I charged $250. One prompt." story "Same phone, different prompt: anamorphic golden hour 35mm. Notion OS." offer "$27 Vault Lite (Whop ?ref=)" bump "Prompt Pack $9" oto "Vault $79"
3. /vault-tripwire/oto — headline "Vault Stack $497→$79 today" story "Vault $79+E-book $49+Notion $29+Looms $79+Presets $47" offer "One-click OTO $79"
4. /vault-tripwire/thankyou — headline "One prompt = one render. Not 50 tries." story "Daily prompt lab 1:1 prompt→render. Fail=prompting like chat not DP." offer "Join $19/mo Prompt Lab — 30 prompts/mo"

YOUTUBE CONTENT (6 Shorts from POST /api/content/seed-day1 — reuse for YouTube):
- p01_20h_to_20m @shadow.cinema.ai 09:00 hook "20 hours of AI video →20 minutes. Same $500 look." story "Old:20h per client (Premiere+Midjourney). New:1 prompt→Veo3→done." offer "DM VAULT — free chapter (35 prompts+Loom)→render today." caption "20h→20m. DM VAULT #aivideo"
- p02_client_250 @shadow.cinema.ai 19:00 hook "Client paid $0 → I charged $250. One prompt." story "Left: shaky phone. Right: cinematic render." offer "Full workflow in $27 Vault Lite. DM VAULT preview."
- p03_5_transitions @shadow.edits.ai 10:00 hook "5 AI transitions editors charge $200 for —60s." story "Whip/glitch/morph/speed-ramp/match-cut" offer "Want 5 presets? DM VAULT — free TikTok pack." (post to YouTube Shorts too)
- p04_9min_edit @shadow.edits.ai 20:00 hook "I edited 4 hrs per Reel. Now 9 minutes." story "Timeline 4hr→9min (AI auto-cut+caption)." offer "DM VAULT — free Loom teardown."
- p05_one_to_one @vault.prompt.lab 11:00 hook "One prompt = One render. Not 50 tries." story "Prompt lab Notion:1:1 prompt→render." offer "Daily prompt here. 35 inside DM PROMPT→$19/mo"
- p06_stack @vault.prompt.lab 18:00 hook "Vault Stack: $497 value→$27 today" story "Vault $79+E-book $49+Notion $29+5 Looms $79+Presets $47" offer "15 min preview — DM VAULT."
- Renders: outbound/renders/{page}/{prompt_id}.mp4 720x1280 gold/black placeholder — upload to YouTube Shorts now, replace with real Veo3 later (GEMINI_API_KEY AQ.Ab8***MASKED***MASKED*** on prod, Pillow fallback in sandbox free)

MANYCHAT — YOUTUBE ONLY:
- Flows: Keyword VAULT→Whop Checkout (platform youtube only), Welcome (youtube), Default Reply (AI support), Post-Purchase (whop_purchase→youtube comment $1.50 CPM clip) — verify token shadow_manychat_verify_2024, META_APP_ID 2104082527135617
- Platforms: ONLY youtube + whop in this workspace — ignore tiktok/x/whatsapp etc.
- Webhook: POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/youtube (verify GET ?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test_youtube → test_youtube) + POST https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/whop

DESIGN:
- Colors black #0a0a0a, gold #D4AF37, white #fff, charcoal rgba(255,255,255,0.1)
- Fonts Inter/black headlines, mono for BIO blocks
- YouTube Banner 2560x1440 safe 1546x423 center, gold top bar, black hero, Shorts thumbnails from banner_*.png, Profile 800x800 profile_*.png
- Pages: gold top bar+black hero+YouTube embedded Loom+Whop iframe+countdown 15m+stack table

API TO KEEP (YouTube only):
- Publisher: POST /api/content/seed-day1, POST /api/video/generate-day1, POST /api/publish/schedule-day1 (for tracking, not IG publish)
- Funnel: POST /api/funnels/seed-tripwire, GET /api/funnels, GET /api/pages
- ManyChat: GET /api/flows, GET /api/subscribers, POST /webhooks/youtube, POST /webhooks/whop
- Auth: POST /api/auth {email,handle}
- Questions: GET /api/questions auto-seed 5→7
- Health: GET /health, GET /docs, single DB sqlite → postgres, CORS *

Build now. Output: Whop store live URL, 4 pages live with ?ref, 6 Shorts linked to YouTube, YouTube webhook verified, curl checks for /health /api/funnels /api/pages /webhooks/youtube.
```

Where to paste: `https://whop.com/dashboard` → **Whop AI** → **Generate Store** → set `WHOP_API_KEY` + `WHOP_STORE_URL=https://whop.com/shadow-vault-niche2` → Deploy → then YouTube Studio upload 6 Shorts with Whop links in descriptions.

---

## 6) How to Connect Webhook & Accounts — YouTube Only (Free, No Card)

**Base URL this sandbox:**
```
https://8000-im0filypzl0c1k06umq6z.e2b.app
Local: http://localhost:8000 (run curls HERE, not Cloud Shell)
```

**Why Cloud Shell failed before:** `localhost:8000` is E2B sandbox only. In Cloud Shell use public URL with new ID. Fix: always run `curl http://localhost:8000/...` **inside E2B sandbox terminal** (where `uvicorn` runs). In Cloud Shell use `curl https://8000-<NEW_ID>.e2b.app/...`

### Connect YouTube — 2 ways (both free, no billing):

**Option 1 — Manual + PubSubHubbub webhook (free, recommended):**
1. Create YouTube channels: `https://youtube.com/handle` → claim `@shadow.cinema.ai` etc.
2. Get Channel ID: `https://www.youtube.com/account_advanced` → copy UC...
3. Subscribe each channel to your webhook (free):
```bash
# Inside E2B sandbox:
curl -X POST https://pubsubhubbub.appspot.com/subscribe \
  -d hub.callback=https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/youtube \
  -d hub.topic=https://www.youtube.com/xml/feeds/videos.xml?channel_id=UC_YOUR_ID \
  -d hub.mode=subscribe
# Verify locally:
curl "http://localhost:8000/webhooks/youtube?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test_youtube"
```

**Option 2 — Manual upload only (simplest, no webhook needed yet):**
- Upload `outbound/renders/*/*.mp4` directly to `https://studio.youtube.com` → Create → Upload video → Shorts → Title=hook, Description=story+offer+Whop link → Publish → No API key needed at all
- Your dashboard Publisher still tracks content; webhook auto-notifies later when you enable Option1

**Google Cloud Console Agent prompt — YouTube FREE ONLY (no billing):**
```
You are Cloud Console Agent — FREE TIER ONLY, NO BILLING, NO CARD. Do not enable billing APIs.
Context: Sandbox im0filypzl0c1k06umq6z Base https://8000-im0filypzl0c1k06umq6z.e2b.app Verify shadow_manychat_verify_2024
Tasks FREE ONLY:
1. Do NOT deploy Cloud Run or enable youtube.googleapis.com (requires billing). Verify sandbox live: curl https://8000-im0filypzl0c1k06umq6z.e2b.app/health
2. Connect YouTube FREE via PubSubHubbub: curl -X POST https://pubsubhubbub.appspot.com/subscribe -d hub.callback=https://8000-im0filypzl0c1k06umq6z.e2b.app/webhooks/youtube -d hub.topic=https://www.youtube.com/xml/feeds/videos.xml?channel_id=UC_ID -d hub.mode=subscribe
3. Verify: curl "http://localhost:8000/webhooks/youtube?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test"
4. Output: health 200, webhook 200, instructions to upload mp4s manually to studio.youtube.com (free).
```

---

## 7) Why Sandbox Expired — How to Fix Now

Your error `sandbox was not found` + `localhost:8000 Connection Refused` in Cloud Shell = **normal**.

- **502 = sandbox expired** (E2B ephemeral). Your current `im0filypzl0c1k06umq6z` gateway shows `SSL_ERROR_SYSCALL` externally but `localhost:8000` still ok inside. It will fully expire soon.
- **Connection Refused = wrong terminal.** Run `curl http://localhost:8000/...` **only inside E2B sandbox** (where `uvicorn` PID 1869 runs). In Cloud Shell or new recreated sandbox use public URL `https://8000-<NEW_ID>.e2b.app/...`

**Next sandbox recreate:**
```bash
# In Arena: click Restart Sandbox → new ID → then:
cd Shadow-Operation && pip install -r app/backend/requirements.txt -q && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir app/backend --reload
# New URL = https://8000-<NEW_ID>.e2b.app → update webhooks + Whop prompt Base URL
```
No card needed — E2B free tier handles it, or use `cloudflared tunnel --url http://localhost:8000` for free persistent URL instead of recreating.

---

**Files ready:** `profile_*.png` + `banner_*.png` + `docs/DASHBOARD_GUIDE_MASTER_PROMPT.md` → upload to YouTube Branding now.
