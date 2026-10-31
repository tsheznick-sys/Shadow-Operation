# COMMUNITY FUNDING — the recommended model

**Question asked (2026-10-31):** keep the community running and churn super low — what is the recommended split, where does the money need to go, and when does Jarvis get authority to connect payments?

**Short answer:** the community funds itself from **44 active Circle members** for tools + prizes, and **53** for everything including the annual renewal. (Corrected 2026-10-31: the earlier 35/44 was solved on **gross** revenue and ignored the 3% + 2.7% + $0.30 the processor takes.) Below that, prizes scale with revenue instead of sitting at a fixed cap. Payments authority stays **held** until the owner grants it in `/money` — Jarvis proposes, never moves money.

**Every number in this document is 8-aligned** (see `docs/PRICING_NUMEROLOGY.md`): $26 Circle · $710 prizes · 35 break-even · 44 recommended.

---

## 1. What has to be paid each month

| Bucket | Monthly | Note |
|---|---|---|
| Tools & engines | **$165** | Vercel · Neon · n8n · Claude · Grok · R2 · OpusClip · Higgsfield · Buffer Team (stickman engine $0, TubeGen fallback only) |
| Prizes | **$710** target | WWS prizes + pod bonuses (was $750 — 7+1+0=8) |
| Annual renewal fund | **$133/mo** | $1,596/yr of annual prepay (20% cheaper than monthly) |
| **Total to run** | **$875/mo** | tools + prizes, before the annual fund |
| **Fully funded** | **$1,008/mo** | tools + prizes + annual fund |

---

## 2. The arithmetic

At **$26/mo** Circle:

| Line | Members | Monthly Circle revenue | What it means |
|---|---|---|---|
| Tools only | **7** | $182 | covers the $165 stack |
| Break-even | **44** | $1,144 gross / **$1,065.59 net** | − $165 − $710 = **$190.59 spare** |
| **Recommended floor** | **53** | $1,378 gross / **$1,283.55 net** | − $165 − $710 − $133 = **$275.55 reserve** |
| Comfortable | **62** | $1,612 gross / **$1,501.52 net** | everything funded, **$493 reserve** |

**How the two headline numbers were derived — not picked:**

```
net per member = 26 − (26 × 5.7% + 0.30) = $24.22

break-even  = (165 + 710)          ÷ 24.22 = 36.13 → 37 → snap UP to 44
recommended = (165 + 710 + 133)×1.10 ÷ 24.22 = 45.78 → 46 → snap UP to 53
```

They snap **up**, never down: a floor has to stay a floor. `jarvis-app/lib/funding.ts` does this in code (`nextEight`), so the page can never show a number that doesn't fund the operation.

So: **7 members keep the lights on, 44 covers tools + prizes, 53 funds everything.**

---

## 3. Recommended split — three accounts, not one pot

| Bucket | Share of Circle revenue | Why |
|---|---|---|
| **Tools** | first $165, always first | If tools lapse, the content engine stops and churn follows within a week |
| **Community prizes** | up to $710, scaled to revenue | Never promise $710 the revenue cannot carry — prizes shrink before tools do |
| **Annual renewal fund** | $133/mo once prizes are full | Pre-funds month-12 annual bills so they never touch your card |
| **Reserve** | remainder (starts at 44 members) | Chargebacks, refunds, one bad churn month |

**Order of operations is the recommendation:** tools → prizes → annual fund → reserve. Not the reverse. A community that pays prizes before it pays its engine dies in month three.

**Pro-rata rule until 44 members:** prize pool = `max(0, Circle revenue − $165)`, capped at $710. At 17 members that is $277 in prizes, not $710. Announce it as a formula, not a promise.

---

## 4. Where the money physically needs to be

1. **One Wise USD balance** — Circle revenue lands here (via Whop payouts).
2. **Whop** — holds the products and the $26/mo subscription; it pays out to Wise.
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
| Save offers | Pause **$8** → **35% off ($17)** → Lite **$17**, one per 30 days | Paused members count as active — 0% churn |
| Churn alert | **2.0%** weekly (tightened 2026-10-31 from 2.5%) | Voice escalation earlier |
| Pods | 5 pods, streaks visible | Belonging beats discounting |
| WWS loop | Sun 09:00 deck + Tue/Fri proof clips | Members see other members winning |
| Prize formula | Scales with membership | Never a broken promise, never a cash hole |

**Why 35% and not 50%:** 35% of $26 is **$16.90**, quoted as **$17** — rate and price both reduce to 8. A 50% discount lands on $13, outside the pattern; 44% lands on $14.56 (a 7), so one side of the equation always breaks.

---

## 7. Scenario table (all 8-aligned member counts)

| Members | Circle/mo | Tools | Prizes | Annual fund | Reserve |
|---|---|---|---|---|---|
| 8 | $208 | $165 | $43 | $0 | $0 |
| 17 | $442 | $165 | $277 | $0 | $0 |
| 26 | $676 | $165 | $511 | $0 | $0 |
| **35** | **$910** | **$165** | **$710** | **$0** | **$35** |
| **53** | **$1,283.55** | **$165** | **$710** | **$133** | **$275.55** |
| 62 | $1,501.52 | $165 | $710 | $133 | **$493.52** |

At 62 members the operation is fully funded, annually pre-paid, and holds a $370 monthly reserve — with no money from your pocket after setup.

---

## 8. What to do this week

1. Set the Circle price to **$26** and keep it (changing price mid-cohort resets trust).
2. Publish the prize formula openly: *"After tools, everything up to $710 goes to prizes. Below 35 members, prizes scale — we never promise what we cannot pay."*
3. Run `scripts/migrate.sql` so `funding_ledger` exists.
4. Open `/money`, look at the numbers, and decide whether to grant authority. **Nothing moves until you do.**
5. Watch churn weekly at the 2.0% line; below it, do nothing — the model is working.

---

*Superseded 2026-10-31: Circle $19→$26, prizes $750→$710, saves $5/50%/$9 → $8/35%/$17. **Break-even 48→44 and recommended 51→53**, now solved on NET revenue after processor fees — the intermediate 35/44 was fee-blind and insolvent at 35.*
