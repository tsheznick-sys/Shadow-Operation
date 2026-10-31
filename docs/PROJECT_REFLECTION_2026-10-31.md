# REFLECTION — the Jarvis Agent project, read cold

**Written:** 2026-10-31 · **Trigger:** the owner asked for an honest look at the whole thing before
starting the setup stages one by one.
**Method:** the repository was read, not remembered. Every claim below is a command you can re-run.
**Gate at time of writing:** 103/103, `tsc` 0, `next build` ✓.

---

## 1. What this actually is

38 commits over eight days. 8,586 lines of application code: 28 pages, 19 API routes, 35 library
modules. 55 design documents. Every price, gate, quota, refusal and lock is written down, and most
of them are tested.

That is not nothing. Most projects at eight days have a landing page and an idea. This one has a
**complete, internally consistent specification of a business**, expressed as running TypeScript
rather than as a deck — `lib/tiers.ts` alone knows what a $44 member may and may not do, and refuses
to guess when a product ID is unset.

The mistake would be to read that as "the product is built." It isn't. Here is the honest map.

---

## 2. The one thing that matters: decision layer vs. action layer

The code divides cleanly in two, and only one half is finished.

**The decision layer is real.** Who may run, how many times, with what watermark, which publish
path, what happens on churn, what a run costs, whether the worst case is solvent. This half is
tested against deliberately broken inputs and it holds. The tier round just made it materially
better: one registry, no guessed prices, a $44 buyer is now recorded as $44.

**The action layer is not connected.** From a cold read:

| Evidence | Command |
|---|---|
| `lib/render-paid.ts` — the paid Higgsfield engine, 117 lines — has **zero importers** | `grep -rn "render-paid" app lib` → nothing |
| `lib/render.ts`, `lib/split.ts`, `lib/standard.ts`, `lib/voice.ts` are also orphans | import scan over `lib/` |
| There is **no `/api/stickman/*` route at all** | `find app/api -name route.ts` |
| Every call to `quotaCheck`, `gateBeforePublish`, `publishPath`, `watermarkFor`, `tierCost`, `worstCase` in the app sits in **`app/stickman/page.tsx` with hardcoded `demo*` literals** | `grep -rn "quotaCheck(" app` |
| 4 of 28 pages read the database. 23 are static descriptions of the plan | per-page import scan |

Sit with the fourth row. The product's decision engine is being used to **print a demonstration on
the landing page**, not to gate a run. `quotaCheck("free", {…demo…})` produces a nice card. No
member has ever been stopped by it, because no member has ever tried to run anything — there is
nothing to call.

**So the true state is this: a member can now pay, and the system will correctly record that they
paid, and grant them the right tier. It will not make them a video.**

That is a large step from where this was 24 hours ago — before, they paid and were recorded as
*free*. But it is not a product yet.

---

## 3. Why 103 passing tests did not catch it

Not one of the 103 asks *"does a video come out the other end."* They ask whether the machine
decides correctly, and it does.

Coverage measured **what was built**, not **what was promised**. The tests were excellent at the job
they were given and structurally blind to the gap between the two.

This is the same failure as the tier bug, one level up: the code was consistent with itself and
inconsistent with the world. A green gate is evidence about the questions you asked.

---

## 4. The bug pattern — four sightings, one shape

| # | Left hand said | Right hand said | Cost |
|---|---|---|---|
| 1 | `webhook.ts` reads `WHOP_PRODUCT_CIRCLE_ID` | `.env.example` declares LITE/PRO/TEAM | $44 buyer → free |
| 2 | `entitlement.ts`: `none \| lite \| pro \| team` | product catalogue has a Circle tier | $44 buyer → $17 product |
| 3 | upgrade route builds `WHOP_PRODUCT_${X}_ID` at runtime | those env names never existed | sent `undefined` to Whop, reported success |
| 4 | `lib/tiers.ts`: four tiers | `migrate.sql` CHECK: `('free','circle','pro')` **no team** | **Team $62 buyer → 500, money taken, no access** |

Sighting 4 was found *during this reflection*. It is fixed, and it was the same class as the other
three: two artifacts, each self-consistent, nobody comparing them.

**The response is now a pattern too, and it is the most valuable thing the last two rounds produced:**
collapse to one source, then write a test that reads *both artifacts* and compares them.

- `T06` — every `WHOP_PRODUCT_*` literal in code must be declared in `.env.example`
- `T07/T08` — prices and caps equal across files
- `T15` — the Postgres `tier` CHECK must equal `free + Object.keys(TIER_SPECS)`

Ten lines later, sighting 4 is now impossible. Verified by reverting the SQL: `T15` fails,
99%, and names both sides.

---

## 5. Distance to real money

The commercial loop is **bought → row → tier → quota → (render, deliver)**. Everything up to the
last arrow now exists and is tested. The last arrow does not exist.

Closed so far: three security holes, the unauthenticated upgrade route, the `/api` blind spot, the
webhook, the tier registry, the schema.

Owed, and all of it outside the sandbox:

1. Neon project → `DATABASE_URL` → run `migrate.sql`, confirm **30+ tables**
2. Three Whop products at exactly **$44 / $53 / $62**
3. `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, `WHOP_PRODUCT_CIRCLE_ID` / `_PRO_ID` / `_TEAM_ID`
4. `AUTH_SECRET`, `CRON_SECRET`, Higgsfield key pair
5. Live test: buy Circle, watch `tier=circle`, cancel, watch it drop and OAuth revoke

Then the one piece of code still owed: a route that spends a run. Quota check → `higgsfieldRender`
→ write `agent_runs` → return the URL. On the order of 120 lines against modules that already exist
and are already tested in isolation.

---

## 6. Where I would push back

This repository contains a five-page content operation, a 14-day funnel, pods, challenges, a
community funding model, an autonomy matrix, a scale-out plan, a retention lock, a board with a
three-vote rule, and a 30-year graduation thesis.

It is a good plan. It is also **28 pages and 55 documents describing a business that currently
cannot produce one video.**

The owner's own stated biggest risk is content. The thing not wired is content production. Building
more of the plan is not the risk — the plan keeps growing *while* the single loop that earns one
dollar stays shapeless. Additional pages describing more of the operation would make this feel
further along than it is.

**Recommendation: one page, one video, one buyer — in that order.** Not five pages. Not the
challenge. Not the pods. The 23 static pages are not dishonest; they are simply downstream of a
loop that has to exist first.

---

## 7. What is genuinely strong

Recording only the gaps would be its own dishonesty.

- **The refusals work.** A blocked asset does not advance. An unconfigured product resolves to free,
  never to a guessed tier. An unverifiable webhook is refused outright. Failed entitlement check
  denies. These are the decisions that are expensive to retrofit and cheap to get wrong.
- **The money math is checked.** Worst case $441.60 against $1,485.36 of revenue — 29.73%, inside
  the 30% ceiling. Per-tier solvency verified.
- **The brain is real.** `/jarvis` calls Claude, falls back to Grok, and reports `mock: true` rather
  than pretending when neither key is set. It tells the truth about its own state — rarer than it
  should be.
- **The audit trail exists.** Money routes write `audit_log` because the rate limiter is honest
  about being per-instance. That honesty is recorded in the code itself.

---

## 8. The stages, in order

Each one ends with a check-in. A stage that fails sends us back rather than forward.

| Stage | What | Pass condition | Blocked on |
|---|---|---|---|
| **1** | Neon live | `migrate.sql` reports **30+** tables in `public` | owner's Neon account |
| **2** | Three SKUs | $44 Circle, $53 Pro, $62 Team, ids copied | owner's Whop account |
| **3** | Secrets | six values in Vercel; boot fails loudly without them | owner |
| **4** | Live purchase proof | buy → `tier=circle` → cancel → `free` + OAuth revoked | owner's card |
| **5** | **The missing route** | a real member run returns a real video URL, at the right quota, with the right watermark | code — no dependency |
| **6** | One page, one video, one buyer | revenue in the ledger from a stranger | stages 1–5 |

Stages 1–4 are configuration. Stage 5 is the last code owed. Stage 6 is the only one that is
actually a business.

**Today's honest sentence:** every error the audit found is fixed, the database now agrees with the
code, and the next thing that has to happen is not in this repository.
