# PRICING — THE 8-ALIGNED LADDER

**Decision date:** 2026-10-31 · **Profile:** `numerology_8` · **Enforced by:** `scripts/check_numerology.py`

---

## 1. The rule in one line

> **The first shot is $28. Every price after it reduces to 8.**

$28 is the only non-8 in the system, and that is deliberate: 2+8=10 → 1+0=**1**, the Leader — the opening move, the first strike. Everything the buyer meets *after* that point carries the Life Path 8: money, authority, abundance.

**The arithmetic shortcut:** a number's digital root is its remainder mod 9. So "reduces to 8" is exactly

```
n % 9 == 8
```

That is why this is a *rule* and not a vibe — it can be checked by a script, by a test, or by hand in two seconds.

---

## 2. The ladder

| Rung | Price | Reduces | Old price | Change |
|---|---|---|---|---|
| **First Shot** | **$28** one-time | 2+8=10 → **1** ★ | — *(new)* | the entry |
| **Lite** | **$17**/mo | 1+7=**8** | $9 | +$8 |
| **GOOD** | **$35** | 3+5=**8** | $27 | +$8 |
| **BETTER** | **$89** | 8+9=17 → 1+7=**8** | $79 | +$10 |
| **Pro** | **$53**/mo | 5+3=**8** | $29 | +$24 (moved off 44) |
| **Circle** | **$44**/mo | 4+4=**8** | $19 → $26 → **$44** | churn lever |
| **Team** (3 seats) | **$62** | 6+2=**8** | $59 | +$3 |
| *Save pause* | **$8**/mo | **8** | $5 | +$3 |
| *Save discount* | **35% off → $16.90, quoted $17**/3 mo | 3+5=8 → 1+7=**8** | 50% off | reframed |
| *Hidden A/B tier* | **$9**/mo | 9 | $9 | never advertised |

**Revenue effect per buyer:** +$8 on Lite, +$8 on GOOD, +$10 on BETTER, +$15 on Pro, +$7 on Circle. The ladder is **same-money-or-better at every rung** — nothing was cheapened to fit the pattern.

---

## 3. The First Shot — $28, one-time

**What it buys:** 14 days, all-access. All 5 domains, 6 posts/day, character lock, sequence slides, the vault.

**Why a one-time instead of a subscription:**
- A 1 (the Leader) is an *initiating* number, not a recurring one. A subscription would be pure 8 energy.
- Nothing auto-charges at day 14, so there is no dark-pattern and no "card on file" objection at the door.
- It is the cleanest test of real buying intent we have: someone who pays $28 once has crossed a line that a free trial never crosses. That's the demand signal the whole pipeline hangs on.

**After 14 days:** upgrade to Circle $26/mo (a 2+6=8 membership) or any one-time build. The upgrade path is a *choice*, not a trapdoor.

---

## 4. Why 35% and not 44%

You asked for the 44% save. The arithmetic forced a decision:

| Rate | Lands on | Is the landing price an 8? |
|---|---|---|
| 44% off $26 | **$14.56** | 1+4+5+6=16 → **7** ✗ |
| **35% off $26** | **$16.90 → quoted $17** | 1+7=**8** ✓ |

44% is itself an 8 (4+4), but it lands on a price that isn't — so only one of the two numbers stays clean. 35% is *also* an 8 (3+5) and lands on **$16.90**, which we quote as **$17** — so the rate and the price both read as 8. The $0.10 is absorbed on purpose; a member seeing $17.00 feels different from one seeing $16.90.

Say the word and I'll switch to 44% — it's one env var (`TIER_SAVE_DISCOUNT_PCT=44`).

---

## 5. The floor

**Nothing is advertised below $17.** The cheapest thing a new buyer can purchase is $17.

The only sub-$17 number is the **$8 save pause**, and it applies only to somebody already paying — it is a retention instrument, not an acquisition price. Below that sits one **hidden $9 A/B tier** that is never advertised and never enters the ladder: it exists so you can prove, with data, that the $17 floor isn't leaving money on the table.

---

## 6. Prizes and break-even

Both were recalculated, not re-labelled.

**Prizes: $750 → $710** (7+1+0=8). *$746 is technically the nearest 8, but an unreadable prize number costs more than 4 dollars of alignment. $800 also works if you prefer a bigger headline.*

**Break-even — recomputed from the new prices:**

```
net per member = 26 − (26 × 5.7% + $0.30) = $24.22   ← fees are real

break-even = (tools + prizes) ÷ net
           = (165 + 710) ÷ 24.22
           = 36.13 → 37 members
snap UP to the next 8 → 44 members
```

At 44 members: net `$1,065.59 − $165 − $710 = $190.59` spare. **The old 35 was $27 short of its own prize pool** — gross math, real fees.

**Recommended — everything covered, including the annual bill:**

```
(tools + prizes + annual fund) × 1.10 ÷ net
= (165 + 710 + 133) × 1.10 ÷ 24.22
= 45.78 → 46 members
snap UP → 53 members
```

At 53 members: net `$1,283.55 − $165 − $710 − $133 = $275.55` reserve.

| | Old | New |
|---|---|---|
| Circle | $19 | **$26** |
| Prize cap | $750 | **$710** |
| Break-even | 48 | **44** |
| Recommended | 51 | **53** |

**Members needed dropped 4** against the original 48 (and rose 9 against the fee-blind 35), not because we got cheaper — because every rung got more expensive. That is the whole point of Life Path 8 pricing: fewer, better buyers carrying the same operation.

---

## 7. What stays out of the pattern

Your scope answer was **products + prizes + break-even only**, so these are untouched and stay off-pattern on purpose:

- **Tool costs** — $165/mo, Buffer $60, TubeGen $29, R2 $5, n8n $20, OpusClip $15, Wispr/Higgsfield $0.08/clip. *You don't get to negotiate a vendor's invoice into a numerology pattern.*
- **Annual fund** — $133/mo (7 → not 8). It is derived from real annual bills ($1,596), not chosen.
- **Thresholds** — ER 5%, ratio 50, pool 3,000, demand test 50/25. These are gates, not prices.

---

## 8. How it's enforced

| Where | What |
|---|---|
| `jarvis-app/lib/numerology.ts` | `DIGITAL_ROOT_8()`, `digitalRoot()`, `nextEight()`, `LADDER`, `LADDER_EXPLAINED` |
| `jarvis-app/lib/funding.ts` | break-even and recommended snap **up** to the next 8 — never down, so a floor stays a floor |
| `scripts/check_numerology.py` | validates both configs, the env example and the n8n graph; fails the build on drift |
| `config/adaptable.json → paywalls` | the ladder, the saves, the floor, the hidden tier |
| `.env.example` | `TIER_*` and `FUNDING_*` — change any price without touching code |

```bash
python3 scripts/check_numerology.py     # → ALL PRICES ALIGNED
```

---

## 9. Changing a price later

Everything is env-overridable. Change `TIER_CIRCLE_PRICE`, redeploy, done. But re-run the check — if the new number isn't an 8, the script fails and tells you the nearest one:

```
26 → 2+6=8   ✓
27 → 2+7=9   ✗  nearest 8: 26 or 35
```

**Jarvis never reprices on its own.** It presents live market data and waits for the owner — the same rule that already governs the Whop ladder.

---

*Answers applied from the 2026-10-31 pricing round: 28 kept as the Leader opening, ladder = same-money 8s ($17/$35/$89/$44/$26), scope = products + prizes + break-even, saves converted ($8 pause / 35%→$17), floor $17 with a hidden $9 A/B control.*
