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
4. Create the tables from a terminal, not the SQL editor:

   ```bash
   cd jarvis-app
   DATABASE_URL="postgresql://…-pooler…?sslmode=require" npm run migrate
   ```

   The runner refuses a connection string without `-pooler` (serverless plus the direct endpoint
   exhausts Neon's slots) and without `sslmode=require`. It then re-counts
   `information_schema.tables` and exits non-zero unless **34** tables exist and
   `agent_members`, `agent_runs` and `agent_schedule` are among them. A migration that half-applied
   and exited 0 is how a "finished" setup breaks on the first run three days later.

5. Expected last line: `tables=34 columns=… required_missing=[]` then `schema is in place`.

   The file creates **34** tables. Three of them — `creators`, `publisher_queue38`, `post_analytics` —
   were added on 2026-10-31 because the n8n workflows wrote to them and nothing created them. If your
   count is short, you ran an older copy of the file.

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

## Step 6 — Publish (five surfaces)

Buffer's REST API is retired. The adapter speaks GraphQL at `api.buffer.com`; nothing else in this
repo calls Buffer.

1. https://publish.buffer.com → avatar → **Settings → API access → Generate personal access token**
   → `BUFFER_API_KEY`.
2. **Connect the five channels once**, in Buffer: YouTube ×2 (longform and Shorts), TikTok,
   Instagram, Facebook. **X is deliberately not connected** — it was removed on 2026-10-31 and
   `/api/publish` rejects it.
3. **Name the two YouTube channels differently in Buffer** — one must have "Shorts" in its name, or
   the automatic mapping refuses to guess which is which.
4. Discover the ids:

   ```
   POST /api/publish?discover=1      (Authorization: Bearer $N8N_BRAIN_TOKEN)
   ```

   It returns your channels plus a `proposed` mapping and, if anything is ambiguous, says so. Copy
   the ids you recognise into `BUFFER_CHANNEL_YOUTUBE_LONGFORM`, `_YOUTUBE_SHORTS`, `_TIKTOK`,
   `_INSTAGRAM`, `_FACEBOOK`.
5. **Dry run before the first real post:**

   ```
   POST /api/publish?dry=1   { "surface": "instagram", "text": "...", "videoUrl": "https://..." }
   ```

   It validates and shows the exact GraphQL body without sending anything.

**Two things worth knowing about this API:**

- A **failed** mutation returns **HTTP 200** with a `MutationError` union member. `lib/publish.ts`
  treats a missing `post` as failure (`P01`). A caller that checks only the status code records
  every failure as a successful publish.
- Rate limits are **100 per 15 minutes, 250–500 a day**. At full scale this operation sends 75/day
  (5 surfaces × 5 pages × 3 posts) — inside the budget, but it is close enough to watch.

## Step 6b — The scheduler (how a post actually happens)

The agent books the slot. Buffer keeps it. Nobody posts by hand.

```
asset → gate → slots → agent_schedule → /api/cron/publish-due → Buffer → published
```

| Piece | Where | What it decides |
|---|---|---|
| slots | `lib/schedule.ts` | which day and time per surface |
| gate | `lib/stickman-agent.ts` | may it publish at all, and does a human look first |
| claim | one `UPDATE … RETURNING` | who owns a row — so two runs cannot post it twice |
| publish | `lib/publish.ts` | one surface per call, and HTTP 200 is not success |
| cron | `vercel.json` + n8n WF5 | every 15 minutes |

**Times** (local, Africa/Nairobi, no DST): longform **09:00 Mon/Wed/Fri**; YouTube Shorts **12:00**,
TikTok **17:00**, Instagram **19:00**, Facebook **20:00**, every day. Staggered on purpose — five
surfaces at one minute is a template.

**Who publishes on their own:**

| Tier | Path | Wait |
|---|---|---|
| free | manual download | — the file is the product |
| Circle $44 | scheduled through our publisher | none: machine gate only |
| Pro $53 / Team $62 | scheduled, direct to their own channel | **2 hours** for the first three |

A Pro member's first three rows sit at `g4_review`. Approve them with:

```
PATCH /api/schedule   { "id": 12, "action": "approve" }
```

**If a publish fails**, the row retries after 5, then 30, then 120 minutes, and after three attempts
it is `blocked` with the reason in `last_error`. It never silently disappears.

**Verify it is running:** `GET /api/cron/publish-due` with the cron Bearer returns
`{ claimed, published, failed, results }`. `claimed: 0` means nothing was due — that is a healthy
answer, not a fault.

**Direct publish is a Pro and Team privilege.** A Circle member receives the finished asset to post
themselves; `/api/publish` returns 403 for any tier below Pro, read from `lib/tiers.ts`.

## Step 6c — Chatfuel (the DM leg)

The post is only half the surface. Someone comments on it, and a DM answers — that leg was listed
as a WF5 node in the 2026-10-31 assessment and then vanished when WF5 was rebuilt. Facebook sits
where X sat, and Chatfuel's schema carries Facebook, Instagram and TikTok messages; YouTube has no
DM channel there at all.

```
comment → Chatfuel automation → WF6 webhook → /api/chatfuel/dm → Chatfuel GraphQL → DM sent
```

1. https://panel.chatfuel.com → sign in → pick the bot for the Facebook page.
2. **Settings → API access** (or https://panel.chatfuel.com/integration/auth/token) → copy the token.
3. The bot id is in the panel URL: `panel.chatfuel.com/bots/<BOT_ID>/…`.
4. Set both in Vercel (and locally) — **`CHATFUEL_TOKEN`**, **`CHATFUEL_BOT_ID`**. The token is
   server-side only; it never reaches a browser, a workflow, or a log line (`CF08`).
5. In the panel: **Automations → comment automation** on the Facebook page, action = *webhook*,
   URL = `https://<n8n-host>/webhook/chatfuel-dm` for the n8n instance, body:

   ```json
   { "surface": "facebook", "conversation_id": "{{conversation.id}}",
     "comment_id": "{{comment.id}}", "inbound_at": "{{comment.created_time}}",
     "tier": "circle", "page_ref": "psychology" }
   ```

   **No `text`.** The message and its link are built by the app, not typed into an automation.

6. Import `n8n/wf6_chatfuel.json` (it is also in `n8n_workflows_self_3man.json`). It needs
   `JARVIS_BRAIN_URL`, `CRON_SECRET`, `TELEGRAM_CHAT_ID` as n8n Variables.
7. **Verify:** `POST /api/chatfuel/dm` with the cron Bearer and a real conversation id.
   `{ ok: true, id, status }` is a send. Anything else names its state — `not_configured`, `auth`,
   `graphql`, `message_failed`, `rate_limited`, `transport`.

**The trap, and it is Buffer's trap one level down.** Chatfuel answers **HTTP 200** for a DM it did
not deliver. The message object carries `id`, a `status` that can read `Failed`, and an `errors`
array. A route that checks the status code, or even the GraphQL envelope, records a dropped DM as
delivered. `lib/chatfuel.ts` refuses all three (`CF03`–`CF05`), and `Sending` counts as accepted
because retrying a queued DM sends it twice (`CF13`).

**There is no broadcast mode.** A DM goes into one conversation. An endpoint that can message an
arbitrary audience is the fastest way to have a Meta app restricted.

### The join link (comment → DM → whop.com)

The DM exists to move a commenter into the community, so the link is built from environment ids by
`lib/whop-links.ts` and never typed by a person:

| Tier | Destination | Env |
|---|---|---|
| free | the community page | `WHOP_COMMUNITY_URL` |
| Circle $44 | `https://whop.com/checkout/<plan>` | `WHOP_PLAN_CIRCLE_ID` |
| Pro $53 | same, its own plan | `WHOP_PLAN_PRO_ID` |
| Team $62 | same, its own plan | `WHOP_PLAN_TEAM_ID` |

**A plan id is not a product id.** `WHOP_PRODUCT_*_ID` holds `prod_…`; `/checkout/prod_…` is a 404.
The plan id is in **Checkout Links → ⋯ → Details**, and the app refuses anything that does not start
with `plan_` (`WH03`) — because a private reply cannot be sent twice, and a dead link spends the
only message that commenter will ever get.

Every link carries `utm_source=chatfuel`, `utm_medium=dm`, `utm_campaign=<page_ref>`,
`utm_content=<surface>`, and `?a=<WHOP_AFFILIATE_CODE>` when it is set. Those are the parameters
Whop records as the sale's campaign, which is how a join is traced back to the DM that caused it.
Until a sale has been traced end-to-end, treat the attribution as unproven, not as zero.

**The message rules, enforced before anything is sent:**

| Rule | Consequence |
|---|---|
| one private reply per **comment**, within **7 days** of it | `dm_handoffs.comment_id` is UNIQUE; a second attempt is `409 already_replied` |
| replies to a DM within **24 hours** of it | `WH07`: `window_closed` |
| no URL other than whop.com in a DM | `WH05`: `link_not_allowed` — a compromised workflow cannot DM a phishing link |
| the window needs the comment's own timestamp | no `inbound_at` means no proof, and no send |

The claim is written **before** the send and released if the send fails, so a timeout can be retried
inside the window but a success cannot be repeated. `GET /api/chatfuel/dm` lists recent handoffs, so
"did the leg run" is answerable without opening Chatfuel.

## Step 6d — The Chatfuel panel (`chatfuel-app/`)

The panel is a second deployment in this repository, not a page of the main app: a Vite app whose
proxy holds the Chatfuel token so a browser never can. It is what makes the DM leg operable —
inbox, contacts, automations, broadcasts.

1. ```bash
   cd chatfuel-app
   npm install
   npm run deploy          # node scripts/deploy-vercel.mjs
   ```

   It checks the Vercel CLI and login, links the project, pushes the environment, deploys, then asks
   the deployment whether it came up configured. Re-running is safe: the project is never re-created
   and `vercel env add --force` overwrites.
2. Variables: `CHATFUEL_TOKEN` (runtime only, no `VITE_` prefix, so Vite cannot bake it into the
   bundle) and `VITE_CHATFUEL_WORKSPACE_ID` (the workspace it opens on — read at build time *and*
   at runtime, so it goes up as a project variable, not as a build flag).
3. **Do not set `CHATFUEL_OPEN_PROXY=1` in production.** Open mode on a public host means the master
   token answers whoever finds the URL. The proxy refuses to serve rather than start that way, and
   `503 ProxyRefusedToServe` is the correct answer, not a bug. Either install the `auth` module
   (`npx @chatfuel/wizard --embed`) or bind loopback; `ALLOWED_ORIGINS` must name your origins —
   `*` with no gate still refuses.
4. **Verify:** `GET https://<panel-host>/chatfuel/healthz` → `{"ok":true}`. The startup log states the
   auth mode and nothing else — it never prints the token.

**What the panel is not:** it is not a place the agent publishes from. Publishing is Buffer, in the
main app, every 15 minutes (`Step 6b`). The panel is where a human reads the DMs the agent's posts
started.

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
