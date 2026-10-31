# THE STANDARD — price to performance, long term, at speed, with the value held

**Written:** 2026-10-31 · **Applies to:** every tool, page, workflow, hire and price change.
**Implemented in:** `jarvis-app/lib/standard.ts` · **Verdict rule:** a single failed ratio means it does not ship.
Not "ships with a warning". The warning is what everyone reads and nobody acts on.

---

## The six ratios

| # | Ratio | Ceiling | Why it is the ceiling |
|---|---|---|---|
| 1 | **Cost per asset** | ≤ $3.00 | The render is meant to be cheaper than the edit. Past $3 the tool is the product. |
| 2 | **Payback** | ≤ 12 members | The stack is paid back by members, not by hope. |
| 3 | **LTV / CAC** | ≥ 3.0x | Under 3x you are buying churn and calling it growth. |
| 4 | **Gated speed** | ≥ 2.0 shipped/hour | Blocked and retried assets score **zero**. Speed that fails the gate is cost. |
| 5 | **Leverage** | ≥ 3 assets per idea | One script becomes a longform, a batch of shorts, and three social cuts. Below 3 you pay for ideas and waste them. |
| 6 | **Stack share of revenue** | ≤ 30% | Past 30% the tools own the upside, not you. |

Plus one value rule that is not a ratio: **the member must get ≥ 3x the price in usable output per month.**
At $44 that is $132 of usable output. Below that, $44 is not a price — it is a resentment with a renewal date.

---

## The worked example (the operating point we are aiming at)

| Input | Value |
|---|---|
| Stack | $189/mo |
| Fixed cost | $875/mo |
| Net per member at $44 | $41.19 |
| Churn | 2.0%/mo |
| Assets shipped / produced | 900 / 960 |
| Human hours | 160 |
| Ideas | 150 |
| Revenue | 26 members = $1,144 |

| Ratio | Result | Ceiling | Verdict |
|---|---|---|---|
| Cost per asset | **$0.21** | ≤ $3.00 | pass |
| Payback | **4.59 members** | ≤ 12 | pass |
| LTV / CAC | **$2,059 / $40.92 = 50.3x** | ≥ 3x | pass |
| Gated speed | **5.63 shipped/hr** (60 blocked counted as zero) | ≥ 2.0 | pass |
| Leverage | **6 assets per idea** | ≥ 3 | pass |
| Stack share | **16.5%** of revenue | ≤ 30% | pass |

That is what "price to performance" means here: **$189 buys 900 usable assets and 26 members**, and every one of
those six numbers can be re-measured at the end of the month instead of argued about.

---

## Long term is churn, not revenue

| Churn | Member life | What one $44 member is worth |
|---|---|---|
| **2.0%** (our target) | 50 months | **$2,059** |
| 3.5% | 29 months | $1,195 |
| 5.8% (community average) | 17 months | $700 |
| 10.0% ($27–97 band) | 10 months | $412 |

A $44 member who leaves in ten months is worth **half** a $44 member who stays fifty. That is why the price went
to $44 and why churn — not reach — is the metric the operation is optimised for.

## Speed is only speed after the gate

The temptation is to count every render as output. We do not.

```
gated speed = assets that PASSED the gate / human hours
```

960 produced, 60 blocked → the 60 are a cost, not a speed. This is the single number that keeps the 98%
reliability target honest: a fast pipeline that ships unchecked work is not 98% anything.

## The portfolio is judged worst-first

Never by average. An average is how one dead page hides behind four alive ones, and we already publish
per-page revenue instead of aggregating it. `worstFirst()` returns the weakest page, the negative pages, and
the total — in that order.

---

## How this prevents the mess we just fixed

Six pages on one niche passed every "we have pages!" check because nobody asked a **ratio** question.
Under this standard it fails on two counts before it ever ships:

- **Leverage:** six pages on one niche is not six markets, it is one market with six costs. Leverage falls.
- **Payback:** the stack is paid back by *members*, and six pages do not produce six buyer pools — they produce
  one, divided.

That is the difference between a standard and a slogan: this one can be computed, and it can say no.
