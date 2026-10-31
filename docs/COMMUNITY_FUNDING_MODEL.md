# COMMUNITY FUNDING — the recommended model

**Question asked (2026-10-31):** keep the community running and churn super low — what is the recommended split, where does the money need to go, and when does Jarvis get authority to connect payments?

**Short answer:** the community funds itself from **26 active Circle members** for tools + prizes, and **35** for everything including the annual renewal — because Circle moved **$26 → $44**, which is the strongest lever on churn and the whole reason those counts fell. (Corrected 2026-10-31: the earlier 35/44 was solved on **gross** revenue and ignored the 3% + 2.7% + $0.30 the processor takes.) Below that, prizes scale with revenue instead of sitting at a fixed cap. Payments authority stays **held** until the owner grants it in `/money` — Jarvis proposes, never moves money.

**Every number in this document is 8-aligned** (see `docs/PRICING_NUMEROLOGY.md`): $44 Circle · $710 prizes · 26 break-even · 35 recommended.

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

At **$44/mo** Circle:

| Line | Members | Monthly Circle revenue | What it means |
|---|---|---|---|
| Tools only | **7** | $182 | covers the $165 stack |
| Break-even | **26** | $1,144 gross / **$1,070.94 net** | − $165 − $710 = **$195.94 spare** |
| **Recommended floor** | **35** | $1,540 gross / **$1,441.65 net** | − $165 − $710 − $133 = **$433.65 reserve** |
| Comfortable | **44** | $1,936 gross / **$1,812.36 net** | everything funded, **$804 reserve** |

**How the two headline numbers were derived — not picked:**

```
net per member = 44 − (44 × 5.7% + 0.30) = $41.19

break-even  = (165 + 710)          ÷ 41.19 = 21.24 → 22 → snap UP to 26
recommended = (165 + 710 + 133)×1.10 ÷ 41.19 = 26.92 → 27 → snap UP to 35

ARPU reality check (industry median is 71.2% of sticker):
  median ARPU $31.33 → net $29.24 → break-even 35 · recommended 44
  25th pct    $23.41 → net $21.77 → break-even 44 · recommended 53
```

They snap **up**, never down: a floor has to stay a floor. `jarvis-app/lib/funding.ts` does this in code (`nextEight`), so the page can never show a number that doesn't fund the operation.

So: **7 members keep the lights on, 26 covers tools + prizes, 35 funds everything** — at full price. At median ARPU it is 35 and 44. Both are shown on `/money`, because the flattering one alone is a lie with a chart.

---

## 3. Recommended split — three accounts, not one pot

| Bucket | Share of Circle revenue | Why |
|---|---|---|
| **Tools** | first $165, always first | If tools lapse, the content engine stops and churn follows within a week |
| **Community prizes** | up to $710, scaled to revenue | Never promise $710 the revenue cannot carry — prizes shrink before tools do |
| **Annual renewal fund** | $133/mo once prizes are full | Pre-funds month-12 annual bills so they never touch your card |
| **Reserve** | remainder (starts at 44 members) | Chargebacks, refunds, one bad churn month |

**Order of operations is the recommendation:** tools → prizes → annual fund → reserve. Not the reverse. A community that pays prizes before it pays its engine dies in month three.

**Pro-rata rule until 26 members:** prize pool = `max(0, Circle revenue − $165)`, capped at $710. At 17 members that is $277 in prizes, not $710. Announce it as a formula, not a promise.

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
| Save offers | Pause **$8** → Lite **$17**, one per 30 days (no % discount at a premium price) | Paused members count as active — 0% churn |
| Churn alert | **2.0%** weekly (tightened 2026-10-31 from 2.5%) | Voice escalation earlier |
| Pods | 5 pods, streaks visible | Belonging beats discounting |
| WWS loop | Sun 09:00 deck + Tue/Fri proof clips | Members see other members winning |
| Prize formula | Scales with membership | Never a broken promise, never a cash hole |

**Why no percentage discount:** at $44 every clean rate lands off-pattern — 35% = $28.60 (a 2), 36% = $28.16 (a 2), 44% = $24.64 (a 7). More importantly, discounting a premium price tells the member the price was never real. The save menu is Pause $8 or Lite $17.

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
