# LIVE LINKS — Step-by-Step to Make Jarvis Agent Function Live (Anthropic Key Itself)

**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` | **Social master:** `info.wolf@gmail.com` (5 YT brands TT/IG/X), **Jarvis admin:** `scott.abuya@gmail.com` (Vercel/Neon/n8n/Claude/Whop/Wise) — split per your Sure | **Date:** 2026-10-30

Claude runs `scripts/setup_claude_key.sh` on first boot to set its own key (prompt_on_first_run). No key in repo.

---

### 1) Claude API Key — Let It Set Itself (secure)

1. Anthropic Console: **https://console.anthropic.com/settings/keys** → `Create Key` → copy `sk-ant-...` ($5 free → $20 Pro needed for `claude-3-5-sonnet-20241022`)
2. In your terminal after `git clone -b arena/6c47af3d-shadow-operation https://github.com/tsheznick-sys/Shadow-Operation.git` + `cd Shadow-Operation` → `bash scripts/setup_claude_key.sh` → paste `sk-ant-...` when prompted → script writes `jarvis-app/.env.local` + offers `vercel env add CLAUDE_API_KEY production` — test live via `https://console.anthropic.com/workbench` chat `claude-3-5-sonnet-20241022` 5 tokens.
3. Grok fallback: **https://console.x.ai** → `Create API Key` `xai-...` → set `GROK_API_KEY` same way → `XAI_BASE_URL=https://api.x.ai/v1` `GROK_MODEL=grok-2-latest`

> No OPENAI_API_KEY — deleted 2026-10-30 per Sure.

### 2) GitHub Repo + Vercel (Jarvis lives here)

1. GitHub: **https://github.com/tsheznick-sys/Shadow-Operation** branch `arena/6c47af3d-shadow-operation` `pr_open` — already pushed `fd2840f` → `main in repo` per your Drive custom (ZIP main copy stays in repo root)
2. Vercel: **https://vercel.com/new** → Import GitHub repo → Framework **Next.js** → Root Directory `jarvis-app` → Build `npm run build` → Deploy
3. Vercel Env: **https://vercel.com/dashboard** → Project → Settings → Environment Variables → Add: `DATABASE_URL`, `CLAUDE_API_KEY`, `GROK_API_KEY`/`XAI_API_KEY`, `XAI_BASE_URL`, `GROK_MODEL`, `NEXTAUTH_URL` (your vercel.app URL), `NEXTAUTH_SECRET` (32 chars `openssl rand -base64 32`), `GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN`, `LINEAR_API_KEY`, `WHOP_API_KEY`, `WHOP_PRODUCT_LITE_ID/PRO_ID/TEAM_ID`, `WHOP_WEBHOOK_SECRET`, `BUFFER_TOKEN`, `HIGGSFIELD_API_KEY`, `OPUSCLIP_API_KEY`, `TUBEGEN_API_KEY`, `WAN_T4_URL`, `TELEGRAM_BOT_TOKEN`, `SIGNAL_API`, `WISE_API_KEY`, `JIVE_JARVIS_NUMBER=+25418XXXX710` (env only), `ELEVENLABS_API_KEY` (voice-00), `VAPI_API_KEY` — `vercel.json` crons `/api/cron/check-replies` `*/15` + `/api/cron/daily-brief` `45 5 * * *` stay_hobby_0 $0 via WF6 n8n or Vercel Pro $20
4. Test live: `https://your-vercel-app.vercel.app/api/entitlement?whop_user_id=test` → mock lite if WHOP missing → live after Whop step

### 3) Whop (Pay + Entitlement + Retention)

1. Whop Dashboard: **https://whop.com/dashboard** → Login `scott.abuya@gmail.com` admin (info.wolf@gmail.com for social publish connected as team member)
2. Create Products: **https://whop.com/dashboard/apps** → New Product `GOOD $27` + `BETTER $79` + `BEST $79+$29/mo` + `Vault Circle $19/mo` → copy Product IDs → set `WHOP_PRODUCT_LITE_ID` (BETTER) / `PRO_ID` (BEST) / `TEAM_ID` in Vercel
3. API Key: **https://whop.com/dashboard/api** → `Create API Key` → `WHOP_API_KEY`
4. Webhooks: **https://whop.com/dashboard/webhooks** → `Add Webhook` → URL `https://your-n8n.app/webhook/retention` (n8n Cloud $20) Events: `membership_created` (pod assign), `membership_cancelled` + `membership_payment_failed` (WF8 save Pause $5/50% off/Downgrade $9), `membership_changed` (upgrade Lite→Pro)

### 4) Neon + n8n + Migrate

1. Neon: **https://console.neon.tech** → New Project `shadow-jarvis` → copy `DATABASE_URL` `postgresql://...neon.tech/neondb?sslmode=require` → SQL Editor → paste `jarvis-app/scripts/migrate.sql` (seeds 6 pods Red-Teal + user_vault + pods + retention_events + wins + revenue_log) → Run
2. n8n Cloud: **https://n8n.cloud** → New Instance $20 → Import `n8n/n8n_workflows_self_3man.json` **9 WFs** (WF1 Grok 08:00 top5 buyer_pool_x3 ratio<50 ER3%+ → WF2 02:00 6 scripts/domain Claude → WF3 OpusClip+Higgsfield per-clip → WF4 G4 queue38→Buffer 6/day serious IG/TikTok/YT + X 1-2 discovery → WF5 09:00 demand 1%+25 IG/TikTok/YT only X ignored → Whop vault → ChatFuel IG&TK only 8ch → WF6 05:45 brief + leak_finder → WF7 Jive Vesper → WF8/WF9 retention/proof pods) → Add same 15 creds → Test `WF1` → `your-vercel-app.vercel.app/n8n` embedded
3. Drive HQ: **https://drive.google.com/drive/folders/17KpzZCmxxz13vJfkKv96EZZ5e7KTft8G** — `NUMINOUS_WHOP_DEPLOY/17KpzZCm` holds `p01_32s_9x16.mp4` Katana queue70 proofs

### 5) Social Publishing Master `info.wolf@gmail.com` + Buffer

1. Google Account: **https://accounts.google.com** → Create/Use `info.wolf@gmail.com` → Recovery `scott.abuya@gmail.com` — this inbox owns 5 YT brands (its TT/IG/X)
2. Buffer Team: **https://buffer.com/pricing** → Team $12/ch ×5 pages 15 endpoints = $60 (or Free 3ch MVP) → **https://buffer.com/app** → Connect 5× YouTube + 5× TikTok + 5× IG → copy `BUFFER_TOKEN` Team
3. ChatFuel: **https://chatfuel.com** → Connect **IG & TikTok only** (delete X/YT) → `CHATFUEL_TOKEN` — YT comments handled via Gmail triage `GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN` (Google Cloud **https://console.cloud.google.com/apis/credentials** → OAuth consent + Gmail API **https://console.cloud.google.com/apis/library/gmail.googleapis.com** → `gmail.modify` + **https://myaccount.google.com/permissions** for refresh)
4. X Discovery: **https://developer.x.com** (optional) → Grok X trending free via `GROK_API_KEY` — Buffer posts 1-2/day filler to X, no gate, no ChatFuel
5. Gmail OAuth: **https://console.cloud.google.com** → Same project → Create OAuth 2.0 Client → `https://developers.google.com/oauthplayground` → `https://mail.google.com/` scope → get `REFRESH_TOKEN`

### 6) Voice Agent — Vesper Vapi Bundle (in ZIP)

1. Bundled in ZIP: `jarvis-app/lib/voice.ts` + `docs/JARVIS_JIVE_VOICE_SPEC.md` + `JARVIS_VESPER_VOICE_WIRED.md` + `VESPER_ADAPTIVE_SENSOR_TONALITY.md` + `audio/vesper_voice_*.mp3` (20yo playful witty adaptive) + `audio/jarvis_voice_*.mp3`
2. Voice setup: **https://elevenlabs.io** → Voice `voice-00` Vesper 20yo + `ELEVENLABS_API_KEY` → **https://vapi.ai** → Create Assistant `Vesper` SIP Jive `+25418XXXX710` → Add Knowledge Base Neon `owner_all_social_account_content_content` + `soft_role_emergency_share` → Set 3 legs parallel not conference (Owner All/Social account/Content) + Big Red Button optional → **https://africastalking.com** → SIP $0.06/min primary → Twilio $0.22 fallback `+1/+44`
3. Test: `/admin` → Hey Jarvis → `/parallel` → Jive broadcast → Whisper transcribe → Neon/Drive 17KpzZCm/calls + Linear SHA → Vesper feedback call Owner only Big Red Button optional

### 7) Drive Copy Push (main in repo)

Repo ZIP main lives at root `jarvis_self_3man_bundle.zip` 4.1M → **https://drive.google.com/drive/folders/17KpzZCmxxz13vJfkKv96EZZ5e7KTft8G** → manual drag-drop or `rclone copy jarvis_self_3man_bundle.zip NUMINOUS_WHOP_DEPLOY: --drive-root-folder-id 17KpzZCmxxz13vJfkKv96EZZ5e7KTft8G` (sandbox outbound allowlist blocks `drive.google.com` direct push — use local `rclone copy --drive-root-folder-id 17KpzZCm...` as in `docs/FULL_BREAKDOWN_GROK_CLAUDE_JARVIS_AGENT_ZIP.md` or manual)

### 8) Cost gate check before scale

**https://neon.tech/pricing** Free 3GB → Pro $19, **https://vercel.com/pricing** Hobby $0→Pro $20, **https://console.anthropic.com** `claude-3-5-sonnet-20241022` $20, **https://console.x.ai** $16, **https://tubegen.com** $29, **https://opusclip.com** Free→$15, **https://higgsfield.ai** $29→$0.08/clip — **$56 MVP → $189 5 pages pocket Year 1 $2,268 + ~$60 PSTN = $2,328** until Net $1K/mo 3 bros then 30/20/50 → 100K gross

→ All live links active. Start: `git clone -b arena/6c47af3d-shadow-operation https://github.com/tsheznick-sys/Shadow-Operation.git && cd Shadow-Operation && bash scripts/setup_claude_key.sh` → `cd jarvis-app && npm install && npm run dev -- -H 0.0.0.0 -p 3000` → `https://{port}-{sandboxId}.e2b.app` preview.

