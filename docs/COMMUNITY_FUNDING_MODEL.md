# COMMUNITY FUNDING — the recommended model

**Question asked (2026-10-31):** keep the community running and churn super low — what is the recommended split, where does the money need to go, and when does Jarvis get authority to connect payments?

**Short answer:** the community funds itself from **~40 active Circle members**. Below that, prizes scale with revenue instead of sitting at a fixed $500. Payments authority stays **held** until the owner grants it in `/money` — Jarvis proposes, never moves money.

---

## 1. What has to be paid each month

| Bucket | Monthly | Note |
|---|---|---|
| Tools & engines | **$165** | Vercel · Neon · n8n · Claude · Grok · R2 · OpusClip · Higgsfield · Buffer Team (stickman engine $0, TubeGen fallback only) |
| Prizes | **$500** target | WWS prizes + pod bonuses |
| Annual renewal fund | **$133/mo** | $1,596/yr of annual prepay (20% cheaper than monthly) |
| **Total to run** | **$798/mo** | before any reserve |

---

## 2. The arithmetic

At **$19/mo** Circle:

| Line | Members | What it means |
|---|---|---|
| Tools only | **9** | $171 covers the stack |
| Tools + prizes, no reserve | **35** | $665 — exact break-even, nothing left over |
| **Recommended floor** | **40** | $760 → tools $165 + prizes $500 + **$95 reserve (12.5%)** |
| Comfortable | **48** | tools + prizes + full annual fund + reserve |

So: **~9 members to keep the lights on, ~40 to be genuinely self-funding.**

That is the number to aim at, and it is small on purpose — a $19/mo Circle only needs 40 people to carry a $165 stack and a $500 prize pool.

---

## 3. Recommended split — three accounts, not one pot

| Bucket | Share of Circle revenue | Why |
|---|---|---|
| **Tools** | first $165, always first | If tools lapse, the content engine stops and churn follows within a week |
| **Community prizes** | up to $500, scaled to revenue | Never promise $500 the revenue cannot carry — prizes shrink before tools do |
| **Annual renewal fund** | $133/mo once prizes are full | Pre-funds month-12 annual bills so they never touch your card |
| **Reserve** | remainder (12.5% at 40 members) | Chargebacks, refunds, one bad churn month |

**Order of operations is the recommendation:** tools → prizes → annual fund → reserve. Not the reverse. A community that pays prizes before it pays its engine dies in month three.

**Pro-rata rule until 40 members:** prize pool = `max(0, Circle revenue − $165)`, capped at $500. At 20 members that is $215 in prizes, not $500. Announce it as a formula, not a promise.

---

## 4. Where the money physically needs to be

1. **One Wise USD balance** — Circle revenue lands here (via Whop payouts).
2. **Whop** — holds the products and the $19/mo subscription; it pays out to Wise.
3. **A ledger in Neon** (`funding_ledger`) — one row per month: revenue in, tools paid, prizes paid, annual fund moved, reserve left. This is what Jarvis reads to answer "can we afford X?".

Nothing else is needed. No second bank, no spreadsheet.

---

## 5. Payments authority — the switch you asked for

| State | Meaning | What Jarvis may do |
|---|---|---|
| `not_granted` (default) | You have not authorised payments | Reads data, builds proposals, sends them to you. **Never transfers.** |
| `granted` + `WISE_API_KEY` | You granted authority in `/money` | 1st-of-month batch may run: tools first, then prizes, then annual fund |
| `granted` without key | Half-connected | Still proposing only, and says so |

Granting writes an `audit_log` row and is reversible with one click (**Keep held**). Authority never applies retroactively — it starts from the next cycle.

**Annual resubscribe:** instead of you paying annually out of pocket, the **annual renewal fund** accumulates $133/mo and Jarvis converts the four subscriptions to annual once the fund covers $1,596. That is the "resubscribe annually" you described, funded by members rather than by you.

---

## 6. Churn protection that earns the 1–2% target

| Lever | Setting | Effect |
|---|---|---|
| Save offers | Pause $5 → 50% off → Lite $9, one per 30 days | Paused members count as active — 0% churn |
| Churn alert | **2.0%** weekly (tightened 2026-10-31 from 2.5%) | Voice escalation earlier |
| Pods | 5 pods, streaks visible | Belonging beats discounting |
| WWS loop | Sun 09:00 deck + Tue/Fri proof clips | Members see other members winning |
| Prize formula | Scales with membership | Never a broken promise, never a cash hole |

---

## 7. Scenario table

| Members | Circle/mo | Tools | Prizes | Annual fund | Reserve |
|---|---|---|---|---|---|
| 10 | $190 | $165 | $25 | $0 | $0 |
| 20 | $380 | $165 | $215 | $0 | $0 |
| 35 | $665 | $165 | $500 | $0 | $0 |
| **40** | **$760** | **$165** | **$500** | **$0** | **$95** |
| 48 | $912 | $165 | $500 | $133 | $114 |
| 60 | $1,140 | $165 | $500 | $133 | $342 |

At 60 members the operation is fully funded, annually pre-paid, and holds a $342 monthly reserve — with no money from your pocket after setup.

---

## 8. What to do this week

1. Set the Circle price to **$19** and keep it (changing price mid-cohort resets trust).
2. Publish the prize formula openly: *"After tools, everything up to $500 goes to prizes. Below 40 members, prizes scale — we never promise what we cannot pay."*
3. Run `scripts/migrate.sql` so `funding_ledger` exists.
4. Open `/money`, look at the numbers, and decide whether to grant authority. **Nothing moves until you do.**
5. Watch churn weekly at the 2.0% line; below it, do nothing — the model is working.
