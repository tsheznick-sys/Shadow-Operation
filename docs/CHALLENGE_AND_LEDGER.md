# THE CHALLENGE + THE GLOBAL LIVE LEDGER

Two engines, both live in the app, both run by Jarvis, both public.

| | What it kills | Where | Who runs it |
|---|---|---|---|
| **14-Day Challenge** | "it won't work in *my* niche" | `/challenge` · `/api/challenge` | **WF14**, daily 06:00 |
| **Global Live Ledger** | "I don't believe your numbers" | `/ledger` · `/proof` · `/api/ledger` | **WF9**, daily 06:00 |

---

## 1. The 14-Day Challenge

**Free to join. Expensive to finish.** The work is the qualification — that is the entire design.

### Who it is for — and the gate

**This is for operators**, not spectators: people who want to run a page on this system. Finishing it does not earn a certificate — it earns an **operator seat running their own page**.

| | |
|---|---|
| **Eligibility** | paying community members only — no public sign-ups |
| **Tenure required** | **14 days paid** before the room opens |
| **Entry fee** | **$0 — the membership is the ticket** |
| **Qualifies** | First Shot $28 (its 14-day pass *is* the tenure) · Circle $26/mo after 14 days |

**Why no extra charge:** asking a $26 member for a $28 deposit to join a task makes entry $54 and empties the room. The 14-day wait does the filtering money would do — and tourists do not pay for two weeks to get in. Tenure is the one filter that cannot be bought.

The gate also does a second job: a member with a 14-day task list at day 14 has a reason to stay past the churn cliff, which is where your 1–2% target is won or lost.

### Why this converts

Market data: a structured challenge converts **8–15%** of active members. A direct pitch converts **0.3–0.8%**. A typical free community converts **2–5%**. The difference isn't generosity — it's that the member produces their **own** result, so trust comes from evidence rather than from a claim.

Completion is the metric. **60%+ completion beats member count every time.** A 53-member cohort where 40% engage outperforms a 6,000-person room where 3% do.

### The 14 days

| Day | Phase | The one action | You submit |
|---|---|---|---|
| 1 | Warm-Up | Pick your niche and name the buyer | who buys, what they already comment |
| 2 | Warm-Up | Audit one rival page | followers, avg comments, like:comment ratio |
| 3 | Warm-Up | Write 3 hooks in your own voice | 3 hooks, one line each |
| 4 | Value | Post 1 piece of value — no ask | post URL |
| 5 | Value | Post again, reply to every comment inside 15 min | post URL + reply count |
| 6 | Value | Run the comment audit on your own post | comments, replies, buyer pool ×3 |
| 7 | Value | Post the teardown: what worked, what flopped | post URL + 1 lesson |
| 8 | Value | Ask one question they answer in one word | question + top answers |
| 9 | Value | Post the best answer back to them | post URL |
| 10 | Money | Build the 3-slide Stories demand test | 3 slides + CTA word |
| 11 | Money | Publish it and start the 72h clock | publish time |
| 12 | Money | Reply to every response, log objections | objection list |
| 13 | Money | Read the 72h result at the same hour | comments + PASS/AMBER/RED |
| 14 | Money | Decide: build the offer, or fix the niche | your decision |

**One action a day. No essay. No homework packet.** That is what makes 60% completion possible.

### Scoring

| Event | Points |
|---|---|
| Check in with a deliverable | **+1** |
| Consecutive day | **+1** streak |
| Link verified by Jarvis (opens, carries your handle) | **+2** |
| Checked in with no link where one is required | **−1** |

**Finisher = 10 of 14 days + the day-13 verdict logged.** Not effort — a logged result.

### Day 14 — the honest fork

| Their own number | What happens |
|---|---|
| **PASS (50+ comments)** | **$28 First Shot → Circle $26 → an operator seat** running their own page. They already proved it. |
| **AMBER (25–49)** | Another cycle, **free**. |
| **RED (<25)** | **A different niche** — never a discount. |
| **Did not finish** | **Lite $17/mo.** "You did not finish, so I will not pretend you did." |

This is the rule that keeps it honest: RED does not become a sale. If the market said no, the answer is a new niche, not a cheaper price.

### Verification — claimed vs real

Jarvis does not take a number on trust. For every check-in it **opens the link and pulls the real count from the platform API**, then reconciles:

| Result | What happens |
|---|---|
| Within 20% | ✅ counted as verified |
| **Over 20% off** | ❌ **the day does not count** until corrected |
| Platform key missing | ⚠️ counted, but flagged `api_missing` and **excluded from the leaderboard top 3** |
| Link dead / private | ❌ rejected, asked once |

A member who inflates once is warned. Twice removes them from the cohort. Silence about a fake number is the fastest way to make a public leaderboard worthless.

### What Jarvis does (WF14)

1. **06:00 daily** — sends *only* today's action to every active member (Chatfuel IG/TK + ManyChat YT + email).
2. **06:10** — recomputes `challenge_scores` **server-side only**. A client-submitted score is never trusted.
3. **Verifies links** — opens each one, confirms it resolves and carries the handle → +2.
4. **Quiet detector** — 2 days silent → **one** nudge, then stops. No third message, no guilt copy.
5. **Day 5 read** — Telegram the owner: joined / active / at-risk, and which day is shedding the most people.
6. **Day 13** — sends the verdict template; **they log their own number.** Jarvis never decides it for them.
7. **Finisher invite** — PASS → paid tier. AMBER → free re-cycle. RED → new niche.
8. **Sunday 20:00** — cohort completion rate to `/challenge` and Telegram.
9. **Monthly rollover** — archives the cohort, opens a fresh room capped at 53.
10. Every send passes **WF13 global pause** and `mayActOutbound()` first.

**Autonomy:** runs at `AUTONOMY_SEQUENCE = 85%`. It may send, score, rank and nudge unsupervised. It **may not** admit a finisher to a paid tier without the owner.

---

## 2. The Global Live Ledger

**Every brand. Every platform. Every day.** Including the bad days.

### Why public

Every competitor in this niche shows screenshots. A screenshot is the format trust dies in — it can be cropped, staged, or invented. A channel cannot. Publishing the raw numbers means a prospect can **verify the claim before you ask them for anything.**

### The rules that give it value

| Rule | Why |
|---|---|
| **Nothing hand-typed** | Numbers come from Buffer / IG / TikTok / YT analytics → Neon → page |
| **24-hour lag** | So no number can be edited after the fact |
| **Failures stay** | A flop keeps its note. A RED test publishes as RED |
| **Empty is allowed** | If there is no data, the page says so. It never invents rows |
| **Same data everywhere** | `/ledger`, `/proof` and `GET /api/ledger` read one table |

That last one matters commercially: any prospect, any page, any partner can pull **live proof as JSON** instead of being shown a slide deck.

### Surfaces

| Surface | What it shows |
|---|---|
| `/ledger` | Global: every brand × platform, cumulative views/ER/comments/replies, day-over-day trend, latest entries |
| `/proof` | Per-brand detail with the honesty notes |
| `/api/ledger` | Same numbers as JSON, cacheable, embeddable |

### What Jarvis does (WF9)

**06:00 daily** — pulls real analytics for all 5 brands and 10 YouTube channels → writes `public_ledger` → the pages and the API pick it up. Failures included, nothing hand-typed.

---

## 3. How the two feed each other

```
/proof + /ledger   →  a stranger verifies us before we ask for anything   (SHOW)
        ↓
/challenge         →  they produce their own number                       (DO)
        ↓
$28 First Shot     →  risk on us, not them, and it is refundable          (BET)
        ↓
Circle $26/mo      →  the membership that funds the operation
```

The challenge is the **DO**. The ledger is the **SHOW**. Neither works alone: proof without a task is a claim, and a task without proof is a homework club.

---

## 4. Files

| Piece | Path |
|---|---|
| Challenge page / API | `app/challenge/page.tsx` · `app/api/challenge/route.ts` |
| Challenge engine | `lib/challenge.ts` |
| Global ledger page / API | `app/ledger/page.tsx` · `app/api/ledger/route.ts` |
| Global ledger reader | `lib/global-ledger.ts` |
| Per-brand proof | `app/proof/page.tsx` · `lib/ledger.ts` |
| Tables | `scripts/migrate.sql` → `challenge_members`, `challenge_checkins`, `challenge_scores`, `public_ledger` |
| Day plan (editable, no code) | `config/adaptable.json` → `trust.engines.do.challenge.days` |
| Workflows | **WF14** (challenge) · **WF9** (ledger) |
| Env | `CHALLENGE_*` · `PROOF_*` · `LEDGER_REFRESH_SECONDS` |

**17 tables · 15 workflows · 34 pages.**

---

*Built 2026-10-31. Conversion benchmarks: challenge activation 8–15% vs direct pitch 0.3–0.8%; Skool freemium 2–5%; completion 60%+ as the strongest upgrade predictor.*
