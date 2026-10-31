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
5. Verify: `SELECT count(*) FROM information_schema.tables WHERE table_schema='public';` → **33 or more**. If 0, the editor ran against the wrong database.

   The file creates 33 tables. Three of them — `creators`, `publisher_queue38`, `post_analytics` — were added on 2026-10-31 because the n8n workflows wrote to them and nothing created them. If your count is short by exactly those three, you pasted an older copy of the file.

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
3. Copy each `prod_…` id → `WHOP_PRODUCT_CIRCLE_ID` ($44), `WHOP_PRODUCT_PRO_ID` ($53), `WHOP_PRODUCT_TEAM_ID` ($62). These three are the only ids the agent tiers resolve from — a member whose product matches none of them is recorded as FREE.
4. Settings → Developer → API keys → Create (shown once) → `WHOP_API_KEY`.
5. Developer → Webhooks → Add endpoint: `https://YOUR-DOMAIN/api/whop/webhook`, events `membership_created`, `membership_cancelled`, `membership_deactivated`, `payment_succeeded`, `payment_failed`.
6. Copy the signing secret → `WHOP_WEBHOOK_SECRET`.
7. Send a test event. Expected `{"ok":true,…}`. `signature` = wrong secret; `not configured` = the variable did not save.

> **The three tiers are Circle $44 / Pro $53 / Team $62 — one Whop product each.** A member whose product matches none of the three is recorded as **FREE**, deliberately: an unknown product must never be guessed into paid access. The one-time ladder (First Shot $28, Lite $17, GOOD $35, BETTER $89) is a separate set of products and grants **no recurring agent access**.

> This is the step that matters most. Before the webhook existed a member could pay $44 and nothing happened — no tier, no vault, no access.

## Step 4 — Model keys (the brain)

- https://console.anthropic.com → API Keys → `ANTHROPIC_API_KEY` (the code also accepts `CLAUDE_API_KEY`)
- https://console.x.ai → API Keys → `GROK_API_KEY` (second brain, used only if Claude fails)

**The models, as of 2026-10-31** (see `docs/MODELS_2026-10-31.md` for the reasoning):

| Lane | Model | Price / MTok |
|---|---|---|
| quality — script, rank, reframe, chat | `claude-sonnet-5-5` | $2 / $10 |
| cheap — classify, extract, route | `claude-haiku-5-5` | $0.10 / $0.50 |
| deep — strategy, opt-in | `claude-opus-5-5` | $4 / $20 |
| fallback | `grok-4.7` | $2 / $6 |

**Do not set `ANTHROPIC_MODEL` to a retired id.** `claude-3-5-sonnet-20241022` was retired on
2025-10-28 and sat in this codebase for a year: every request 404'd, the catch swallowed it, and a
canned paragraph was returned with HTTP 200. `lib/brain.ts` now refuses a retired id in favour of the
lane default, and `B01` tests it. Leave the variables unset unless you are deliberately pinning.

**After any provider announcement, run this before trusting an env pin:**

```
GET /api/brain/models      (Authorization: Bearer $N8N_BRAIN_TOKEN)
```

It asks both providers what the account can actually call and reports whether the ids above are
still there. Model ids rot; that endpoint is how you find out before a member does.

**No `ALLOW_MOCK_BRAIN=true`.** In production, no key means `/api/jarvis` returns **503** and the
chat shows "brain offline". A member must never be handed a sample paragraph as an answer.

Without these keys the agent opens but says so instead of writing a script.

## Step 4b — n8n (the automation) → the brain

n8n has no session cookie, so it cannot call `/api/jarvis`. `POST /api/brain` is the machine door.

1. `openssl rand -hex 32` → set as `N8N_BRAIN_TOKEN` in **both** Vercel and n8n → Settings → Variables.
2. n8n Variables: `JARVIS_BRAIN_URL` (your Vercel URL, no trailing slash), `CRON_SECRET` (same value
   as Vercel), `TELEGRAM_CHAT_ID`. Full list in `config/n8n_workflow_variables.json`.
3. Import `n8n/wf1_research.json` … `n8n/wf5_publish.json`, or the bundle
   `n8n/n8n_workflows_self_3man.json`. Fill the two credential placeholders (Neon Postgres, Telegram bot).
4. **Run WF4 first** — it writes nothing. Then WF1.

A **503** from `/api/brain` means no model answered. Every brain node is followed by an `ok?` gate
whose false branch announces *STOPPED — nothing was written*. Do not remove that gate.

`WF6–WF14` are referenced by older documents and do not exist. Five workflows cover the money loop.

## Step 5 — Render (paid route, documented contract)

- https://console.higgsfield.ai → API credentials → key ID + key secret.
- `HIGGSFIELD_KEY_ID`, `HIGGSFIELD_KEY_SECRET`, `HIGGSFIELD_COST_PER_RENDER`.
- Auth is `Authorization: Key ID:SECRET` — **not** Bearer. Endpoint `POST https://api.higgsfield.ai/wan/v2.7/image-to-video`, response `{ video: { url } }`.
- Engine order: **paid Higgsfield is the render path** (`lib/render-paid.ts`). The stickman repo is the animation style, not a free renderer; Wan is the fallback when Higgsfield is unavailable. The earlier "free first, pay only when the cheap path fails" line was reversed on 2026-10-31.

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
| `WHOP_PRODUCT_CIRCLE_ID` ($44) / `_PRO_ID` ($53) / `_TEAM_ID` ($62) | Whop → Products | `prod_…` — the only three the agent tiers resolve from |
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
