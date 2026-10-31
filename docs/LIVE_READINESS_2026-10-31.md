# LIVE READINESS — what stands between the repo and a running market

**Written:** 2026-10-31 · **Trigger:** the quality gate was re-run cold and found a new defect class.
**Test result before this audit:** 47/47 (after the fix below).
**Verdict: it is not close to live. Nine blockers, three of them security.**

---

## 0. What the test run itself found

The gate was re-run from a clean state and immediately dropped to **41/45 (91%)**.

Cause: `docs/QUALITY_GATE.md` — the defect register I had just written — quotes the retired values it
records, so the doc scanner flagged the register for containing exactly what it exists to record.

This is the same class as the harness bug found last round: **the checker cannot tell "recording a
defect" from "committing one."** Fixed with an exclusion that is itself tested:

| Test | What it prevents |
|---|---|
| `BUG-001` | the meta-doc exclusion list growing beyond one entry — nobody can test their way out of a failure |
| `BUG-002` | the excluded file drifting out of being a register — if it stops recording defects, the exclusion is void |

**47/47 after the fix.** Two consecutive rounds have now found a real defect in the *checker* rather than
the thing checked. That is the argument for running it cold, not for trusting it.

---

## 1. The three security blockers

### S1 — The session secret has a working default

`lib/auth.ts:59` and `lib/session.ts:69` and `middleware.ts:39` all fall back to
`"dev-only-shadow-secret-change-me"` when `AUTH_SECRET` is not set.

That string is in **this repository**. Anyone who can read the repo can forge a `shadow_session` cookie
for `role: "owner"` and take over `/money`, `/admin` and `/control`. The fallback exists so local dev
works; in production it is a master key with the code printed on it.

**Fix:** a hard failure on boot in production, not a default. `if (NODE_ENV === "production" && !AUTH_SECRET) throw`.

### S2 — `/api/whop/upgrade` is unauthenticated and holds our Whop key

The route takes `whopUserId` from the request body and calls Whop's `change_plan` with **our** API key.
There is no session check (`auth_refs=0` on the whole file). Anyone who can reach the endpoint can move
any member between plans — upgrade themselves, downgrade someone else, or burn our key's rate limit.

It also points at `https://api.whop.com/api/v2/...` while current Whop docs use `api/v1`, and its own
comments still say *"Lite $9 → Pro $29"* and *"$189"*.

**Fix:** session check inside the route, server-derived `whopUserId` (never from the body), v1 endpoint,
and the prices read from config rather than written into a comment.

### S3 — `/api/*` is outside the middleware entirely

`middleware.ts` `config.matcher` covers eleven page paths and **no** `/api/*` path. Protection is
therefore per-handler and inconsistent:

| Route | Protected by handler? |
|---|---|
| `/api/control` (global pause) | yes — `canControl()` |
| `/api/funding` (payment authority) | yes — role check |
| `/api/whop/upgrade` | **no** |
| `/api/cron/*` (two of them) | **no** — no `CRON_SECRET` check |
| `/api/challenge`, `/api/jarvis`, `/api/pods`, `/api/retention`, `/api/ledger`, `/api/drafts`, `/api/entitlement`, `/api/omar/scan`, `/api/onboarding` | **no** |

The new pages (`/stickman`, `/board`, `/reliability`, `/scale`) are also not in the matcher, so any
member can read the board, the reliability numbers and the scale-out plan.

**Fix:** add `/api/:path*` to the matcher with an explicit public allowlist, guard the crons with
`CRON_SECRET`, and add the four new pages to `PROTECTED`.

---

## 2. The commercial blocker

### C1 — There is no Whop webhook, so nobody's purchase unlocks anything

`find app/api -ipath "*webhook*"` returns nothing. `/api/whop/upgrade` is the only Whop integration and
it is an outbound call, not an inbound event.

That means: a member pays $44 in Whop and **nothing happens in our system**. No tier, no vault, no agent
runs, no pod. `agent_members` has no row. The whole product is downstream of an event we never receive.

**Fix:** `/api/whop/webhook` verifying Whop's signature, handling `membership_created`,
`membership_cancelled`, `payment_succeeded` and `payment_failed`, writing `agent_members` and revoking
OAuth grants on cancellation — the one-hour revoke law in `lib/oauth.ts` has no caller today.

---

## 3. The product blocker

### P1 — The agent cannot produce a video

Four panel screens exist and are static. There is **no API route for the agent at all** — no
`/api/agent/create`, no `/api/agent/schedule`, nothing under `app/api` mentions a render.

`ENGINE_PROVIDER` and `STICKMAN_REPO_URL` are declared in `.env.example`, and `lib/jarvis.ts` does not
reference either. There is **no storage code** (`grep S3|R2` → nothing), so there is nowhere for a
rendered asset to land.

So the product the member pays $44 for is, today, a well-designed set of pages describing a product
that does not exist.

**Fix order:** render adapter → storage → `asset_cuts` write → gate → schedule. Each one is a route and
a test; none is hard, but all four are absent.

---

## 4. The configuration blocker

### G1 — 126 environment variables, effectively none set

`.env.example` declares 126. The ones that must be real before a single member can transact:

| Group | Vars | Status |
|---|---|---|
| Auth | `AUTH_SECRET`, `TFA_ENABLED` | missing — S1 is why this is first |
| Database | `DATABASE_URL` | missing; `getSql()` returns `null` and every route silently mock-mode's |
| Whop | `WHOP_API_KEY`, `WHOP_PRODUCT_*_ID` | missing; product SKUs do not exist yet |
| Model | `CLAUDE_API_KEY`, `GROK_API_KEY` | missing; the agent cannot script |
| Publish | `BUFFER_TOKEN` | missing; nothing can post |
| Render | `HIGGSFIELD_API_KEY`, `STICKMAN_*` | missing; nothing can render |
| Mail | `RESEND_API_KEY`, `GMAIL_*` | missing; no sequence, no briefs |

`getSql()` returning `null` is the quiet one: **every route degrades to a mock and returns 200.** In a
live market that is a store that accepts money and records nothing.

---

## 5. What is genuinely ready

Fair to state, because most of this repo is not vapour:

- **47 tests green** across real modules, with the exclusion list itself guarded.
- **Schema complete:** 30 tables including the page law, the agent, the board and OAuth custody.
- **Policy layer real:** `verify-rules.ts` and `split.ts` block rather than soften.
- **Pricing solved:** 44/53/62, net of fees, with ARPU nesting and the 84/26 funding math re-derived.
- **The decision layer works:** board quorum, distinctness, quota and the publish gate all behave
  correctly under injected faults.

The logic is in good shape. The **plumbing** is not started.

---

## 6. Sequence to live

| # | Step | Blocked by | Why here |
|---|---|---|---|
| 1 | Rotate the secret; fail boot without `AUTH_SECRET` | — | S1 is a takeover, not a bug |
| 2 | Authenticate `/api/whop/upgrade`; add `CRON_SECRET` | — | S2, S3 |
| 3 | Real Neon database; run 30-table migration | `DATABASE_URL` | nothing persists without it |
| 4 | Whop webhook + membership → `agent_members` | SKUs created | C1 is the revenue path |
| 5 | Render adapter + storage + `asset_cuts` | engine key | P1 is the product |
| 6 | First real longform through the gate | 1–5 | the first honest signal |
| 7 | Free wave 1 (25 challenge finishers) | 6 | measured, not launched |

**Nothing on this list needs a new idea.** It needs env vars, four routes and one webhook.
