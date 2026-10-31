# Step-By-Step: Set Up Jarvis Agent BEFORE Claude Code (Full Walkthrough)

**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` | **ZIP:** `jarvis_self_3man_bundle.zip` 3.0M `1iw-8UvVc0L_AHPe_Z3sgQfst-1J6aRAX` | **Drive:** `17KpzZCmxxz13vJfkKv96EZZ5e7KTft8G` | **Date:** 2026-10-31 EAT

> Do these 7 steps *before* you open Claude Code — then Claude will be born inside `jarvis-app/` and take over. Total: ~25 min if you have keys ready.

---

## 0) What you need in hand (before you start)

- **GitHub account** with access to `https://github.com/tsheznick-sys/Shadow-Operation`
- **Admin email** `scott.abuya@gmail.com` (Vercel / Neon / n8n / Whop / Wise owner)
- **Social email** `info.wolf@gmail.com` (Buffer + YT/TikTok/IG logins)
- **Keys** (create tabs now, keep open): [Anthropic console](https://console.anthropic.com/) `CLAUDE_API_KEY sk-ant-...` + [xAI console](https://console.x.ai/) `GROK_API_KEY xai-...` + [Neon](https://neon.tech) + [Vercel](https://vercel.com/new) + [n8n Cloud](https://n8n.io/) + [Whop](https://whop.com/dashboard) + [Buffer](https://buffer.com) + [TubeGen](https://tubegen.ai/) or fallback `WAN_T4_URL` free + [Higgsfield](https://higgsfield.ai/) + [OpusClip](https://opusclip.com/) + [Vapi](https://vapi.ai/) + [ElevenLabs](https://elevenlabs.io/)
- **Laptop with** Node 18+, Git, and a browser — terminal ready

---

## 1) Clone the repo (get the code)

```bash
# 1a — clone the exact branch that has the fully adaptable Jarvis
git clone -b arena/6c47af3d-shadow-operation https://github.com/tsheznick-sys/Shadow-Operation.git
cd Shadow-Operation

# 1b — confirm you're on the right branch (must say pr_open)
git branch --show-current
# → arena/6c47af3d-shadow-operation
git log --oneline -1
# → 880200e Finalize A-Z Broz summary + Master Prompt born + adaptable bundle 3M

# 1c — verify ZIP exists (main artifact, 119 files, 3.0M)
ls -lh jarvis_self_3man_bundle.zip
# → 3.0M (if 0.01M you grabbed wrong branch — fetch again)
unzip -l jarvis_self_3man_bundle.zip | grep -E "BROZ_A_TO_Z_SUMMARY|CLAUDE_MASTER_PROMPT|adaptable.json"
```

**Alternative (no git):** Drive `https://drive.google.com/drive/folders/17KpzZCmxxz13vJfkKv96EZZ5e7KTft8G` → download `jarvis_self_3man_bundle.zip` `1iw-8UvVc0L_AHPe...` (trashed old 2 copies, only this 3.0M is current) → unzip locally.

---

## 2) Open `jarvis-app/` (this is the PWA, not the root)

```bash
cd jarvis-app
ls app/page.tsx lib/config.ts lib/jarvis.ts vercel.json
# All must exist — if missing, you are in wrong folder

# Check adaptable config (no hardcode)
cat config/adaptable.json | head -20
cat ../config/adaptable.json | head -20
# → niches 8 pool, thresholds GREEN <50+5%+ AMBER 50-70+3-5%, PAGES_COUNT 5, engine tubegen

# Do NOT run npm yet — set env first
```

---

## 3) Tell Claude who Jarvis is — MASTER PROMPT (before Claude Code opens)

This is the “born” step. You will paste ONE block into Claude:

**3a — Copy the Master Prompt:**
Open `../JARVIS_SOLO_MASTER_PROMPT.md` (root, 1 file, 3.5K — shortest Born version) **OR** `docs/CLAUDE_MASTER_PROMPT_JARVIS.md` (full 7.2K with skills table).

```bash
cat ../JARVIS_SOLO_MASTER_PROMPT.md
cat docs/CLAUDE_MASTER_PROMPT_JARVIS.md
```

**3b — Where to paste it (pick ONE you use):**
- **Claude Code CLI** → create `CLAUDE.md` in `jarvis-app/` and paste:
  ```bash
  cp ../JARVIS_SOLO_MASTER_PROMPT.md CLAUDE.md
  # Verify:
  head -5 CLAUDE.md
  ```
- **Cursor / Antigravity** → Settings → Project Instructions / Rules → paste whole block
- **claude.ai Project** → Project → Instructions → paste whole block

> The prompt already says: split accounts `scott.abuya@gmail.com` admin vs `info.wolf@gmail.com` social, Hard Rules 1-11, thresholds env-overridable via `lib/config.ts`, Engine provider `ENGINE_PROVIDER=tubegen|pictory|fliki|...` fallback `WAN_T4_URL`, 10 WFs WF1 Grok → WF5 GREEN fast-close vs WF5A AMBER 14-day, retention WF8/WF9, costs MVP $61 → SCALE $189, pages 1 Page=1 YT brand any N via `PAGES_COUNT`.

**Do this before opening Claude Code** — when Claude Code launches it reads `CLAUDE.md` instantly and says `Sir, Claude live.`

---

## 4) Create your env (the adaptable secrets)

```bash
# 4a — create .env.local from the fully adaptable template
cp .env.example .env.local

# 4b — run the prompt-on-first-run script (your lock: never commit keys)
bash scripts/setup_claude_key.sh
```

**What the script asks (type, leave empty to keep default):**
```
ANTHROPIC_API_KEY (sk-ant-...)          → paste from console.anthropic.com
GROK_API_KEY / XAI_API_KEY (xai-...)   → paste from console.x.ai (XAI_BASE_URL https://api.x.ai/v1 GROK_MODEL grok-2-latest)
NICHES_POOL CSV                          → default: Psychology,Dark Psychology,Marketing History,Mindset,Wolf Mindset,Consumerism,Self-Improvement,Finance Behavior
PAGES_COUNT                              → default 5 (1 Page = 1 YT brand its TT+IG+Shorts)
THRESHOLD_RATIO_GREEN                     → default 50
THRESHOLD_ER_GREEN                       → default 5
SOCIAL_MASTER_EMAIL                      → default info.wolf@gmail.com
ADMIN_EMAIL                              → default scott.abuya@gmail.com
```

The script writes `jarvis-app/.env.local` and offers `vercel env add CLAUDE_API_KEY production` — same keys you’ll add manually below.

**4c — Fill the rest of `.env.local` by hand (open in editor):**
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxx
GMAIL_REFRESH_TOKEN=xxx
BUFFER_TOKEN=buffer_xxx
TUBEGEN_API_KEY=tubegen_xxx        # OR PICTORY_API_KEY / FLIKI_API_KEY + ENGINE_PROVIDER=tubegen|pictory|fliki|...
HIGGSFIELD_API_KEY=higgsfield_xxx   # $0.08/clip finish only
OPUSCLIP_API_KEY=opus_xxx
WHOP_API_KEY=whop_xxx
WHOP_PRODUCT_LITE_ID=prod_lite_xxx
WHOP_PRODUCT_PRO_ID=prod_pro_xxx
WHOP_PRODUCT_TEAM_ID=prod_team_xxx
WISE_API_KEY=wise_xxx
TELEGRAM_BOT_TOKEN=xxx
JIVE_JARVIS_NUMBER=+25418XXXX710   # Vesper Vapi Africa $0.06 → Twilio $0.22
# Adaptable (no code change):
ENGINE_PROVIDER=tubegen
PLATFORMS=X,IG,TikTok,YT
BUFFER_SERIOUS_DAILY=6
BUFFER_X_DAILY=2
PAGES_COUNT=5
WHOP_LADDER_PRICES=$27+$9+$79+$19/mo
```

**Why before Claude Code:** `lib/jarvis.ts` builds `JARVIS_SYSTEM` from `CONFIG` (lib/config.ts reads these envs). If env empty, Claude still answers with mock `Sir, CLAUDE_API_KEY missing...` and you know to set it.

---

## 5) Create the cloud bases (Neon + Vercel + n8n) — still before Claude dev

**5a — Neon Postgres (2 min):**
1. Go `neon.tech` → New Project `jarvis-shadow` → copy `DATABASE_URL`
2. Paste into `jarvis-app/.env.local` `DATABASE_URL=...`
3. Open Neon SQL Editor → paste **entire** `jarvis-app/scripts/migrate.sql` → Run
   - Creates `solo_domains` (adaptable niches + `brand_voice` per page), `app_config` (pool/pages/thresholds), `user_vault`/`pods`/`pod_members`/`retention_events`/`wins`/`revenue_log` + seed 6 pods Red..Teal
4. Verify: `SELECT * FROM pods;` → 6 rows, `SELECT * FROM app_config;` → 5 rows (pool 8, pages 5, ratio 50, ER 5, ladder 27+9+79+19)

**5b — Vercel (3 min):**
1. `vercel.com/new` → Import Git Repository → pick `tsheznick-sys/Shadow-Operation` → **Import `jarvis-app` folder only** (Root Directory = `jarvis-app`)
2. Framework: Next.js, Build Command `npm run build`
3. Add **all** env vars from `jarvis-app/.env.example` (paste each key/value from `.env.local`) — do not miss `CLAUDE_API_KEY` `GROK_API_KEY` `DATABASE_URL`
4. Deploy → after green, open `https://your-vercel-app.vercel.app` → should show `Sir, Shadow is primed. Churn 1.4% • 5 pages YT brands`
5. Keep the URL — add to `.env.local` `NEXTAUTH_URL=https://your-vercel-app.vercel.app`

**5c — n8n Cloud (5 min):**
1. `n8n.cloud` → New workflow → Import from File → pick `n8n/n8n_workflows_self_3man.json` (10 WFs 16062 bytes)
2. Settings → Variables → Import `config/n8n_workflow_variables.json` (14 vars: `THRESHOLD_RATIO_GREEN=50` etc `PAGES_COUNT=5` `ENGINE_PROVIDER=tubegen` — this makes WFs adaptable without JSON edit)
3. Credentials → add `DATABASE_URL` (Postgres), `CLAUDE_API_KEY`, `GROK_API_KEY` + `XAI_BASE_URL https://api.x.ai/v1`, `TUBEGEN_API_KEY` + `WAN_T4_URL` fallback, `OPUSCLIP_API_KEY`, `HIGGSFIELD_API_KEY`, `BUFFER_TOKEN`, `WHOP_API_KEY`, `WISE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `GMAIL_OAUTH2`
4. Activate all 10 WFs → check WF1 `0 8 * * 1` WF2 `0 2 * * *` WF5 `0 9 * * *` WF6 `45 5 * * *` show green

---

## 6) NOW open Claude Code (Jarvis is born)

```bash
# In jarvis-app/ (you are still there, .env.local ready, CLAUDE.md pasted)
npm install          # ~13s, installs next 14.2.10 + @anthropic-ai/sdk + openai (for Grok) + postgres
npm run dev          # Starts 0.0.0.0:3000 PWA

# Watch terminal — Claude Code reads CLAUDE.md on boot:
# → [JARVIS] reading config/adaptable.json pool 8 niches...
# → [JARVIS] Vercel env check — CLAUDE_API_KEY ok, GROK_API_KEY ok
# → Sir, Shadow is primed. Vesper standby. (if keys missing: Sir, CLAUDE_API_KEY missing in Vercel env — mock...)
```

**Test born in 30s:**
- Browser: `http://localhost:3000` → dashboard Churn 1.4% 5 pages
- Browser: `http://localhost:3000/jarvis` → type `Sir top5 niches?` → Claude hits `lib/jarvis.ts` → Grok ranks 1000 niches `data/creator_db_faceless_1000_FINAL.csv` → returns top5 from `config/adaptable.json` pool
- API: `curl -X POST http://localhost:3000/api/jarvis -H "Content-Type: application/json" -d '{"prompt":"test GREEN gate?","history":[]}'` → `{provider:"claude"|"grok", mock:false}` (mock:true means keys not set)

**If you see `Module not found: Can't resolve '@/lib/config'`:** run `rm -rf .next && npm run build` — tsconfig fixed `13:59` baseUrl `@/*` mapping included in 880200e.

---

## 7) What Jarvis does after birth (while you sleep, before you SEND)

| Time EAT | Who does it | You do |
|---|---|---|
| **02:00** | WF2 Claude writes 6 scripts/domain → TubeGen/Wan 30m `p01_32s_9x16.mp4` → queue38 | Sleep |
| **WF2→WF3** | OpusClip 5-8 shorts + Higgsfield LUT per-clip → `pending_G4` | Sleep |
| **09:00** | WF5 checks IG/TikTok/YT analytics, GREEN `<50+5%+` → Chatfuel IG&TK + ManyChat YT auto-DM `VAULT` + Gmail triage, AMBER → 14-day drip | Wake to `/content` G4 swipe + `/social` give Jarvis autopublish → Buffer 6/day live, X 1-2 discovery filler no gate |
| **05:45** | WF6 daily brief `Sir 6 videos live 2.1K views 18 replies` + leak finder biggest leak | Read on Vercel `/` |
| **Thu→Sun** | Demand test `1%+25` on last 3 posts (X ignored) → PASS → Whop vault $27+$9+$79+$19 auto-create | You pressed SEND 3-cap → sign FINAL TERMS 10pts |
| **Sun 09:00 + 05:45 daily** | WF9 WWS + leaderboard Pod Red 28 vs Blue 22, WF8 save Pause $5/50% off/Downgrade $9 | `/retention` / `/pods` |

**Total daily human:** 2 min — `/drafts` swipe SEND + `/content` approve + `/social` approve. Everything else is Agent.

---

### Troubleshooting before you call

- **`CLAUDE_API_KEY missing` mock:** `cat .env.local | grep CLAUDE` empty → rerun `bash scripts/setup_claude_key.sh`
- **`DATABASE_URL` null mock:** Neon step 5a not done → `lib/db.ts` returns null (mock mode)
- **`next: not found`:** `npm install` not run in `jarvis-app/`
- **n8n variables not showing `{{$env.THRESHOLD...}}`:** import `config/n8n_workflow_variables.json` in n8n Settings → Variables (not env)
- **Drive wants new ZIP:** latest is `1iw-8UvVc0L_AHPe...` 3.0M in `17KpzZCm...` (old 2 trashed) — main stays repo `jarvis_self_3man_bundle.zip`

**Branch check:** `git log --oneline -1` must be `880200e` or later `pr_open` — if you see `9c99f0e` you’re on `main` (no Jarvis).

---

*After this, open Broz one-pager `docs/BROZ_A_TO_Z_SUMMARY.md` to teach them A-Z in 5 min, and `docs/TUBEGEN_ALTERNATIVES_NICHES.md` if you want to swap engine via `ENGINE_PROVIDER` env.*
