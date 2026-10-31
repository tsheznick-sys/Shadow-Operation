# LIVE SETUP RUNBOOK — mirror of the Google Doc

**Canonical:** [SHADOW OPERATION — Live Environment Setup Runbook](https://docs.google.com/document/d/1KnTpcg4k-B-oPDqlhBsI6WljQXC62gVQ8GKAp2cudrE)
**Rule:** no secret value ever appears in this file, in the Doc, in chat or in a commit. Keys go into Vercel and nowhere else.

Six services, about 90 minutes, in dependency order. Each step needs something from the one before.

---

## Step 1 — Neon (the database)

Why first: in production the app refuses to boot without it, by design.

1. https://console.neon.tech → New Project → `shadow-operation` → nearest region.
2. **Connect** → copy the connection string (use the **pooled** one, it contains `-pooler`).
3. Keep it on the clipboard for Step 2. Do not paste it into any document.
4. Create the tables: open the Neon SQL Editor, paste all of `jarvis-app/scripts/migrate.sql`, run it. It is idempotent.
5. Verify: `SELECT count(*) FROM information_schema.tables WHERE table_schema='public';` → **30+**. If 0, the editor ran against the wrong database.

## Step 2 — Vercel (hosting)

1. https://vercel.com/new → import `tsheznick-sys/Shadow-Operation`, branch `arena/6c47af3d-shadow-operation`.
2. **Root Directory: `jarvis-app`** ← the app lives in a subfolder; this is the step people miss.
3. Framework Next.js (auto). Build `npm run build`.
4. Before deploying, add the four that must exist to boot:
   `AUTH_SECRET` (`openssl rand -hex 32`), `DATABASE_URL`, `CRON_SECRET` (any 32+ chars), `AUTH_REQUIRED=true`.
5. Deploy. ~3 minutes.
6. **If the build stops with "Refusing to run in production", that is the security layer working** — the message names the exact missing variable.

## Step 3 — Whop (products, API key, webhook)

1. https://whop.com/dashboard → Communities → New (if it does not exist).
2. Products → New, three times: **Circle $44/mo**, **Pro $53/mo**, **Team $62/mo · 3 seats**. Exact prices; the code validates the tier against config.
3. Copy each `prod_…` id → `WHOP_PRODUCT_CIRCLE_ID`, `WHOP_PRODUCT_PRO_ID`, `WHOP_PRODUCT_TEAM_ID`.
4. Settings → Developer → API keys → Create (shown once) → `WHOP_API_KEY`.
5. Developer → Webhooks → Add endpoint: `https://YOUR-DOMAIN/api/whop/webhook`, events `membership_created`, `membership_cancelled`, `membership_deactivated`, `payment_succeeded`, `payment_failed`.
6. Copy the signing secret → `WHOP_WEBHOOK_SECRET`.
7. Send a test event. Expected `{"ok":true,…}`. `signature` = wrong secret; `not configured` = the variable did not save.

> This is the step that matters most. Before the webhook existed a member could pay $44 and nothing happened — no tier, no vault, no access.

## Step 4 — Model keys

- https://console.anthropic.com → API Keys → `CLAUDE_API_KEY`
- https://console.x.ai → API Keys → `GROK_API_KEY`

Without these the agent opens but cannot write a script.

## Step 5 — Render (paid route, documented contract)

- https://console.higgsfield.ai → API credentials → key ID + key secret.
- `HIGGSFIELD_KEY_ID`, `HIGGSFIELD_KEY_SECRET`, `HIGGSFIELD_COST_PER_RENDER`.
- Auth is `Authorization: Key ID:SECRET` — **not** Bearer. Endpoint `POST https://api.higgsfield.ai/wan/v2.7/image-to-video`, response `{ video: { url } }`.
- Engine order is unchanged: free stickman first, Wan second — money is only spent when the cheap path cannot run.

## Step 6 — Publish

- https://buffer.com → Settings → Apps and Extras → Access Token → `BUFFER_TOKEN`.
- Connect five surfaces once: YouTube longform, YouTube shorts, TikTok, Instagram, Facebook. **X is deliberately not connected.**

## Step 7 — Email

- https://resend.com → API Keys → `RESEND_API_KEY`. Verify the domain (or use their test domain for the first send).

## Step 8 — Verify it is actually live

| Check | Expected |
|---|---|
| `GET /api/whop/webhook` | `ok:true` + the event list |
| `/login` | loads; owner logs in |
| `/board` in a private window | **redirects to login** — if it loads, the matcher did not deploy |
| `curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/daily-brief` | 200; without the header **401** |
| Buy Circle with a real card | within a minute a row appears in `agent_members` with `tier = circle` |
| Cancel that membership | tier drops to `free`, OAuth grants revoked |

**If 8.5 and 8.6 pass, the commercial loop is closed for the first time.**

---

## Appendix A — the eighteen that matter

| Name | Source | Note |
|---|---|---|
| `AUTH_SECRET` | `openssl rand -hex 32` | 32+. No default exists. |
| `DATABASE_URL` | Neon → Connect | pooled, `sslmode=require` |
| `CRON_SECRET` | you invent it | Vercel Cron sends it as a Bearer |
| `WHOP_API_KEY` | Whop → Developer | shown once |
| `WHOP_WEBHOOK_SECRET` | Whop → Webhooks | verifies every event |
| `WHOP_PRODUCT_CIRCLE_ID` / `_PRO_` / `_TEAM_` | Whop → Products | `prod_…` |
| `CLAUDE_API_KEY` | console.anthropic.com | scripts |
| `GROK_API_KEY` | console.x.ai | daily scan |
| `HIGGSFIELD_KEY_ID` / `_KEY_SECRET` | console.higgsfield.ai | render |
| `BUFFER_TOKEN` | buffer.com developers | publish |
| `RESEND_API_KEY` | resend.com | email |
| `TEAM_OWNER_EMAIL` / `_PASSWORD` | you | 10+ chars, or the seat is disabled |
| `TEAM_CONTENT_PASSWORD` / `TEAM_SOCIAL_PASSWORD` | you | same |

## Appendix B — why the app refuses to start

Each of these was an open hole on 2026-10-31, now closed:

| Condition | What it used to mean |
|---|---|
| Missing `AUTH_SECRET` | anybody could forge an owner cookie — the default was in the repo |
| Missing `DATABASE_URL` | every route returned 200 with mock data while taking real money |
| `AUTH_REQUIRED=false` | every request treated as the owner |
| A default seat password | the owner seat was guessable from the repository |

## Appendix C — order of work after go-live

1. First real longform through the gate (page 1, Stickman).
2. Free wave 1: **25 challenge finishers only**. Measure the blocked-asset rate before wave 2.
3. Circle opens at $44. Watch churn weekly against the 2.0% line.
4. Only after page 1 posts a **GREEN week** does a second page get argued for — by a 3-of-3 board vote.
