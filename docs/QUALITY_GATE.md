# QUALITY GATE — 45 tests, and what they do not prove

**Run:** `cd jarvis-app && npm run test:agent` · **Last result:** 45/45, 100%
**First run of this rig:** 38/43 (88%). Six real defects were found and fixed — listed below.

---

## What is tested, and by whom

Every assertion runs against the **real modules**, not a copy: `lib/pages.ts`, `lib/stickman-agent.ts`,
`lib/board.ts`, `lib/standard.ts`, `lib/scaleout.ts`, plus a scan of every file in `docs/`.

| Dimension | Tests | Question it answers |
|---|---|---|
| **Reliability** | 17 | Faults injected on purpose. Does every gate actually catch its own failure? |
| **Memory** | 18 | Do the code constants still match every lock, including the ones that reversed? |
| **Judgment** | 7 | Has any retired number, banned niche or superseded rule survived in the docs? |
| **Execution** | 3 | Does one real asset go script → 5 surfaces, and does the cost model hold? |

---

## The six defects the rig found

| # | Found | Was | Now |
|---|---|---|---|
| 1 | `CHALLENGE_AND_LEDGER.md` | Circle **$26** in three places; "17 tables" | $44; 30 tables |
| 2 | `CLAUDE_MASTER_PROMPT_JARVIS.md` | "STICKMAN **FINANCE**" | STICKMAN |
| 3 | `N8N_WORKFLOW_DIAGRAM_FULL.md` | "Stickman Finance" x4, `$26/mo` ladder, `TIER_CIRCLE_PRICE=26` | Stickman; $44 |
| 4 | `SIGNALS_CONTROLS_RETENTION.md` | "**All 5 pages at once**", "First-week: all 5 pages live" | one page at a time |
| 5 | `FULLY_ADAPTABLE_GUIDE.md`, `GOOD_BETTER_BEST_PODS.md` | retired ladder `$89+$44+$26`, `TIER_PRO_PRICE=44` | `$89+$53+$44`, 53 |
| 6 | **The test harness itself** | matched against a 70-character excerpt, so a history marker late in a long line was invisible — producing a false positive | matches the full line, shortens only for display |

Defect 6 is the important one. A test harness with a silent bug is exactly the failure mode the whole
operation is built to avoid: **a green light that lies.** It was caught because the "defect" it reported
was one I could read with my own eyes in the file.

---

## What 45/45 does NOT prove

Stated plainly, because a green scorecard is the easiest thing in this repository to fake:

1. **The tests are written by the same hand that wrote the code.** They prove the code matches the rules
   *I* encoded. They cannot prove those rules are the right ones. A test suite is a consistency check,
   not a wisdom check.
2. **No test has run against live traffic.** Every number here is from fixtures. The first real signal
   arrives on page 1's first publish.
3. **Judgment tests are grep, not thought.** They catch a retired price in a document. They cannot catch a
   *reasonable-sounding* decision that is wrong — the $44/Pro collision, the six-pages-one-niche mess and
   the Max-above-Team error were all found by arithmetic and argument, not by a test.
4. **No test covers TikTok, Instagram or Facebook behaviour**, because none of them have been connected.
5. **The 98% target is not this.** These 45 tests are a *gate*, and a gate that passes is not a measured
   accuracy rate. `lib/reliability.ts` measures the 98% figure from production runs; until then, 98% is a
   design target and this file is the thing that keeps it honest.

---

## Rules for adding a test

1. A test must be able to fail. If you cannot name the defect it catches, it is a brochure.
2. Test the real module, never a reimplementation.
3. Faults are named in the test, so the failure message explains the rule, not just the line.
4. Never widen an exclusion to make a test pass. Fix the thing, or record it as a known defect.
5. Every reversal gets a memory test on the same day it is reversed, or the old value survives somewhere
   nobody reads.
