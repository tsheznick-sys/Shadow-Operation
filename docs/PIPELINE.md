# THE PIPELINE — one operation, eight stages, and where each one runs

**Status:** 2026-10-31. Every stage below names a file that exists in this repository, and tests
`PL01`–`PL06` fail if this document and the code stop agreeing.

> Read this with `docs/WHOP_COMMUNITY.md` (what we sell and to whom) and
> `docs/LIVE_SETUP_RUNBOOK.md` (the order to switch it on). This document is the middle: **what runs,
> in what order, and what happens when a stage fails.**

---

## 1. The pipeline in one line

```
research → write → gate → render → book → publish → DM → community → money
  WF1      WF2     lib/    /api/   /api/    cron/    /api/   whop.com   /money
                   split   agent/  schedule publish- chatfuel
                           run             due      /dm
```

Eight stages. Six of them are already code that runs on a schedule; two are code waiting on a key
(`render` on Higgsfield, `money` on Whop). Nothing is a mock.

---

## 2. Stage by stage

### Stage 1 — Research (WF1, Mon 08:00)

Ranks the GREEN buyer pool and writes `solo_domains`. Calls `/api/brain` — one model door, no
provider hard-coded anywhere else.

**Fails how:** the model returns prose instead of JSON → the workflow stops on the schema, and
Telegram says so. It does not invent a domain.

### Stage 2 — Write (WF2, 02:00 daily)

Six scripts a day: three 8s hooks, two 32s, one 60s, written into `publisher_queue38` as
`pending_G4`. **A script is not a video** — nothing is rendered at this stage, by design: rendering a
blocked script is money spent on an asset that cannot publish.

### Stage 3 — Gate (`lib/split.ts` → `lib/verify-rules.ts`)

One script becomes two cuts: a **raw** cut for the community and an **edited** cut for public
surfaces, with the AI disclosure appended and advice phrasing stripped. If a rule fails, the public
cut is **blocked, not softened** — a softened violation is still a violation.

The verdict is computed here, server-side. It is never read from a request body: `RN12`, `RN19`.

### Stage 4 — Run (`POST /api/agent/run`)

The only route that spends money, and it spends it in this order:

```
reserve → gate → render → settle
```

- **reserve** claims the quota with a conditional `UPDATE … RETURNING` *before* the renderer is
  paid, so two simultaneous clicks cannot spend one run (`RN16`).
- **gate** re-checks the script shape: a 200-character floor and a character lock for longform.
- **render** calls Higgsfield (`lib/render-paid.ts`), 720p + `STICKMAN` watermark on free, 1080p
  clean on paid.
- **settle** records the cost; a failure on our side is refunded by decrement, never by writing an
  old absolute back (`RN17`).

**Fails how:** every path returns a named state (`quota_exhausted`, `gate_blocked`,
`render_not_configured`, `render_failed`) and the run is refunded. A renderer that throws is caught
(`RN18`).

### Stage 5 — Book (`POST /api/schedule`)

The finished asset is planned into real slots, in Africa/Nairobi, no DST:

| Surface | Time (EAT) | Days |
|---|---|---|
| YouTube longform | 09:00 | Mon / Wed / Fri |
| YouTube Shorts | 12:00 | daily |
| TikTok | 17:00 | daily |
| Instagram | 19:00 | daily |
| Facebook | 20:00 | daily |

One post per surface per day, enforced by a real count (`SC20`). A Circle row goes straight to
`pass`; **Pro and Team's first three publishes sit at `g4_review` with a two-hour SLA**.

**X is not one of them.** It was removed from the pipeline on 2026-10-31; `lib/publish.ts` rejects any
surface outside the five, and a test fails if it comes back.

**Fails how:** an unreadable calendar returns 503, not "the day is free" (`RN20`). An asset with no
public `video_url` is refused with 422.

### Stage 6 — Publish (`GET|POST /api/cron/publish-due`, every 15 min via WF5)

One conditional `UPDATE … RETURNING … FOR UPDATE SKIP LOCKED` claims each due row. Then: resolve the
channel, publish through Buffer, mark `published` **only when Buffer returned a post id**.

Buffer answers **HTTP 200 for a failed mutation**. The adapter reads the union, not the status code
(`P01`). Retries are 5 → 30 → 120 minutes, then the row is `blocked` with the reason in
`last_error`.

**Fails how:** it never silently disappears. A row is only `published` with an id.

### Stage 7 — DM (`POST /api/chatfuel/dm`, on Chatfuel's webhook via WF6)

A comment arrives, and the person gets **one private reply** — Meta allows exactly one per comment,
within 7 days — carrying a link to whop.com:

```
free → WHOP_COMMUNITY_URL
paid → https://whop.com/checkout/<plan_…>          (plan, never a prod_ id)
```

The link is built from environment ids (`lib/whop-links.ts`); any other URL in the message is
refused (`WH05`). The comment is claimed in `dm_handoffs` **before** the send, so two webhooks cannot
answer it twice, and the claim is released only if the send fails.

**Fails how:** every Chatfuel state has a name — `not_configured`, `auth`, `graphql`,
`message_failed`, `rate_limited`, `transport`, `window_closed`, `link_not_allowed`,
`already_replied`.

### Stage 8 — Community → money (whop.com, `/money`, `/api/funding`)

A join creates a member row; the tier decides runs, watermark and publish path. `/money` counts
`agent_members WHERE tier <> 'free'` and reports `exact: true` — it never substitutes a different
population when the query fails.

**Fails how:** `exact: false`, and the number is absent rather than wrong.

---

## 3. Where each piece runs — and what is installed on a device

**Nothing is installed on any device.** There is no desktop app, no phone app, no Electron, no
React Native, no APK — `PL02` asserts this and fails the build if one appears. The operation is five
hosted services and a browser.

| Piece | Where it runs | Installed on a device? |
|---|---|---|
| Dashboard / agent panel (`jarvis-app`) | Vercel — Next.js app | **No.** A browser tab. It has a web-app manifest, so it can be *added to a home screen*, but that is a bookmark with an icon, not an install |
| Chatfuel panel (`chatfuel-app`) | Vercel — second deployment (Vite + proxy) | **No.** A second browser tab. It holds the Chatfuel token server-side so a phone never does |
| The six workflows (WF1–WF6) | n8n Cloud | **No.** They run at the vendor |
| The database | Neon (Postgres) | **No** |
| Publishing | Buffer (GraphQL) | **No** |
| DMs | Chatfuel (`panel.chatfuel.com`) | **No** |
| Video renders | Higgsfield, plus the stickman engine behind `STICKMAN_REPO_URL` | **No** — an HTTP endpoint |
| Whop (products + community) | whop.com | **No.** Members use it in a browser; Whop's own app is theirs, not ours |

So: **two deployments, both web.** The operator needs a browser and a phone that can receive
Telegram. That is the whole client surface.

> One honest caveat: the manifest is present but there is **no service worker**, so "installed" to a
> home screen it is still an online page. It is not an offline app and should not be described as one.

---

## 4. The five ways this pipeline was lying, and what now catches it

Every one of these was a real defect found in this build, not a hypothetical.

| The lie | What it looked like | Caught by |
|---|---|---|
| A failure read as success | Buffer returns HTTP 200 for a failed post | `P01`, `SC09` |
| A missing column read as "nothing due" | `video_url FROM agent_runs` inside a `catch` | `D01`–`D04`, `RN20` |
| The caller asserting its own compliance | `rules_ok` taken from the request body | `RN12`, `RN19` |
| A quota spent twice | read-then-write of an absolute counter | `RN16`, `RN17` |
| A feature no route could reach | 178 green tests, four modules imported only by tests | `RN09` |

---

## 5. What is not built (say it out loud)

- **Nothing writes into the Whop community.** The DM leg brings people in; the scheduler publishes
  out. A daily drop *inside* the community is still a human.
- **Pods are not auto-assigned.** The tables exist; the matcher does not.
- **The 14-day challenge clock does not run.** `/api/challenge` reads a cohort; nothing advances it.
- **The render engine's submit contract is not wired.** `pickEngine` can report a configured engine,
  but `lib/render.ts` refuses to guess the endpoint — and the current `STICKMAN_REPO_URL` is a
  *GitHub repository*, which cannot render. `POST /api/agent/run` therefore returns
  `render_not_configured` until a real HTTP endpoint exists. That is the honest state.

---

## 6. Switch-on order

1. **Neon** — `npm run migrate` → 35 tables. (`/money` and the DM claim depend on it.)
2. **Whop** — three products, three plan ids, `WHOP_COMMUNITY_URL`.
3. **Chatfuel** — token, bot id, comment automation → WF6.
4. **Buffer** — key and five channel ids (`?discover=1`).
5. **Higgsfield** — the key pair, so stage 4 leaves `render_not_configured`.
6. **n8n** — import the six workflows, set the variables.
7. **One page, one video, one buyer.** Until that happens, this pipeline is a map of a road, not a
   road.
