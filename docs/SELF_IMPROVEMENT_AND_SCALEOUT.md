# SELF-IMPROVEMENT → OPERATION → MONEY → DUPLICATION

**The ask:** train Jarvis to improve itself, then the operation, then let it scale to real money — then duplicate the proven operation across pages and niches in parallel.

**The order is the strategy.** Three stages, each locked behind the previous one, and duplication gated behind all three. Skip a stage and you scale a mistake.

```
SELF  ──3 consecutive wins──▶  OPERATION  ──cost falling + clean G4──▶  MONEY
                                                                          │
                                            ┌─────────────────────────────┘
                                            ▼
                              GRADUATION (8 gates)  ──▶  TEMPLATE  ──▶  PARALLEL CLONES
```

---

## Part 0 — The pricing bug that was fixed first

Before any of this could be trusted, the funding arithmetic had to be true.

**The bug:** break-even and recommended member counts were solved on **gross** Circle revenue. Whop takes **3%**, Stripe takes **2.7% + $0.30** — the same config documented those fees while the math ignored them.

| | Gross model (wrong) | Reality |
|---|---|---|
| Net per $26 member | $26.00 | **$24.22** (fees $1.78) |
| At 35 members | "covers prizes" | net $847.63 − $165 tools = **$682.63** → **$27 short of the $710 prize pool** |

**The fix — solved on net, snapped up to the next 8:**

```
break-even  : (165 + 710) ÷ 24.22 = 36.13 → 37 → snap up → 44
recommended : (165 + 710 + 133) × 1.10 ÷ 24.22 = 45.78 → 46 → snap up → 53
```

| | Was | Now |
|---|---|---|
| Break-even | 35 | **44** |
| Recommended | 44 | **53** |
| Error | — | **understated by 9 members** |

At **44**: net $1,065.59 − $165 − $710 = **$190.59** spare.
At **53**: net $1,283.55 − $165 − $710 = **$408.55** → annual fund $133 covered, **$275 reserve**.

**53 is also the challenge cohort size.** The room that produces the next 53 members is the room that funds them.

**A guard now prevents the regression:** `scripts/check_numerology.py` asserts solvency on net revenue, and it fails loudly on the old numbers:

```
✗ break-even 35 is INSOLVENT — net after tools $682.63 < prizes $710.
  Needs 36.1 members minimum.
```

---

## Part 1 — SELF: Jarvis grades Jarvis

**Always on.** This is the baseline, not a phase.

| What it grades | Against what |
|---|---|
| Hooks | retention at 3s and 10s |
| Scripts | ER, comment quality, objection rate |
| Clips | watch-through, virality score vs outcome |
| Answers | how often the same question comes back |

**The independence rule:** Jarvis proposes a change, but **WF15 recomputes the score itself.** A system that grades its own homework learns to flatter itself.

**Gate to the next stage:** 3 consecutive cycles where the promoted change beat the incumbent on the same metric.

---

## Part 2 — OPERATION: the machine gets cheaper and cleaner

**What it measures:** render pass rate, G4 rejection rate, publish cadence, **cost per shipped clip**, duplicate-question rate.

This is the stage that makes the operation *copyable*. A page that costs $0.40/clip cannot be cloned profitably; one at $0.08 can.

**Gate to money:** cost per clip falls for 2 cycles **and** G4 rejection drops below 10%.

---

## Part 3 — MONEY: the only stage where prices move

Pricing, offers, the 14-day sequence, the save menu.

**Gate to this stage:** a full month above the member floor (**53**) with churn at or under **2.0%**.

**Hard limit:** promoting a tactic into the playbook is automatic at 95% autonomy. **Changing a price is never automatic** — Jarvis proposes it with the data attached and waits.

---

## Part 4 — How a test is actually read

| Rule | Value |
|---|---|
| Minimum sample | **30** |
| Minimum duration | **7 days** |
| Holdout | **20%** keep the incumbent |
| Win margin | **+10%** |
| Variables per test | **1** |

**The decision (`lib/learn.decide`):**

| Result | Outcome |
|---|---|
| Beats incumbent by >10% | **promoted** |
| Behind the incumbent | **killed** (archived) |
| Inside the 10% margin | **inconclusive — not a win, never shipped** |
| Wins the secondary but **loses the primary** | **killed** |

That last row is the one that saves you. A change that lifts views while destroying comments wins the metric you can see and loses the one you trust.

**Verified behaviour:**

```
sample 12        → running      (too thin)
3 days           → running      (too early)
+35%             → promoted
+6%              → inconclusive (do not ship)
−12%             → killed
lost primary     → killed
```

**Playbook entry:** 2 independent wins on **2 different pages**. Exit: 2 consecutive losses, archived not deleted — so a dead idea isn't retried in six months under a new name. **Everything re-tested every 60 days**, because what worked in October isn't guaranteed in January.

---

## Part 5 — DUPLICATION: a page earns the right to be copied

**The law:** cloning before proof multiplies losses at exactly the speed it multiplies wins.

### The eight graduation gates — all of them, or it stays a page

| Gate | Threshold | Why |
|---|---|---|
| Demand test | 50+ comments at 72h | the market must have said yes |
| Time live | 30 days | a page that survived a month has been tested |
| Engagement | ER ≥ 5% (7d) | the only trusted metric |
| Buyer pool | comments × 3 ≥ 3,000 | too small a pool cannot fund it |
| Real buyers | 3 paying | views don't pay a bill |
| Churn | ≤ 2.0% | a leaking page is not a template |
| Cost per clip | ≤ $0.25 | an expensive page can't be copied profitably |
| Hook bank | 5 proven hooks | a clone needs somewhere to start |

**Verified:** a strong page scores 8/8 → `GRADUATED`. A weak one scores 3/8 and is blocked on days, buyers, churn, clip cost and hooks.

### The parallel cap lifts on proof, never on ambition

| Graduated pages | Cap |
|---|---|
| 0 | **0 clones — hard stop** |
| 1 | 3 live |
| 2 | 6 live |
| 3+ | 10 live (the supervision ceiling at 80% autonomy) |

### What copies and what can't

| Copies | Never copies |
|---|---|
| Master prompt · character lock · hook bank · cadence · playbook slice · template version | The audience · the comments · the credibility |

Every clone publishes the honesty line: *"This page is new. It starts at zero and we will publish that too."* — which is exactly what the Live Ledger is for.

### Isolation, kill rule, distance

- **Isolation:** one credential set, one R2 prefix, one Buffer group, one budget per page. A bad page cannot poison the others — the only reason parallel is safe at all.
- **Kill rule:** a clone failing its 72h demand test **twice** is archived, not nursed. Sunk cost bounded by design, not sentiment.
- **Niche distance:** a new page must sit **2+ niches away** until the playbook holds 5 proven hooks per niche — otherwise clones compete for the same audience and the same comments.

### Money model

- **Revenue per page, never an aggregate.** An average hides a dead page.
- **Reinvest from graduated pages**, never the owner's pocket.
- **The ceiling is 10 pages** — 10 pages × 10 channels is the most one owner can supervise at 80% autonomy.

---

## Part 6 — What was built

| Piece | Path |
|---|---|
| Learning engine | `lib/learn.ts` — `decide`, `readable`, `promotable`, `stageUnlocked`, `stale` |
| Scale-out engine | `lib/scaleout.ts` — `graduate`, `parallelAllowance`, `cloneBrief`, `portfolio` |
| Self-improvement board | `app/improve/page.tsx` |
| Scale-out board | `app/scale/page.tsx` |
| Funding fix | `lib/funding.ts` — `netPerMember`, `feeDrag`, fee-aware solve |
| Regression guard | `scripts/check_numerology.py` — `check_solvency` |
| Tables | `experiments` · `playbook` · `page_portfolio` |
| Workflows | **WF15** self-improvement · **WF16** duplicator |
| Config | `learning` · `scaleout` (+ fixed `community_funding`) |

**21 tables · 17 workflows · 36 pages.**

---

## Part 7 — The honest ranking of what matters most

1. **The pricing fix.** Everything else is built on money that actually arrives. This was wrong by 9 members.
2. **The kill rule.** Being willing to archive a page is worth more than any growth tactic — it bounds the downside of every experiment.
3. **Inconclusive ≠ win.** Most improvement systems die by shipping noise. This one names it.
4. **The independence rule.** Jarvis recomputes its own score, so it cannot flatter itself into a bad decision.
5. **The 8 gates.** Proof before duplication is the difference between a portfolio and a pile.

The thing that will feel wrong: **graduation is slow.** 30 days, 3 buyers, ER ≥5% before anything is copied. It will feel like the system is refusing to scale. It is — that's the feature. Ten cloned pages built on an unproven template is not scale, it's ten times one mistake.

---

*Applied 2026-10-31. Pricing fixed to net-of-fees (break-even 44, recommended 53). Self-improvement and scale-out engines built, wired to WF15/WF16, and gated so no stage can be skipped.*
