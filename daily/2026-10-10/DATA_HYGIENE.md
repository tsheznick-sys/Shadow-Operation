# DATA HYGIENE REPORT — 2026-10-10

Five issues found while running today's operating loop. None were "fixed" silently, because
four of them need an operator decision, not an agent guess.

---

## 1. FIXED — `tools/algorithm_engine.py` was destroying the tracker

`export_tracker()` rewrote `templates/creator_tracker.csv` from scratch with a hardcoded
32-column schema. Running it (which the README implies is a normal step) silently:

- dropped the **3 Apify-verified leads** (`@gfx_ma`, `@josephbadiger`, `@galinie_codes`) —
  they are not in the engine's `CREATORS` list, so they vanished entirely;
- dropped the **7 columns** added during the Oct 8 outreach sync (`engagement_rate`,
  `monetization_verdict`, `headline_launch_range`, `comment_anchored_range`,
  `naive_workbook_ceiling`, `drive_f3_substack_mrr`, `comment_gate_status`);
- reset live statuses back to `OUTREACH_SENT` / `DRAFT_STAGED`, losing the follow-up dates;
- overwrote the curated prices with older, lower ones.

44 rows became 41 and every cell changed. This is a Gate G8 (data hygiene) breach and it
would also have broken Gate G6 (the numbers in the audit would no longer match the numbers
that were sent).

**Fix:** `export_tracker()` is now a fill-only upsert. It adds new leads and fills blank
cells; it never overwrites a cell the operator has filled. Rows and columns the engine has
never seen are preserved untouched. `--force` lets the engine win on derived columns only,
`--dry-run` shows the diff, and a timestamped backup is written to
`templates/backups/` before every overwrite. Regression tests cover both the original bug
and the subtler one introduced while fixing it.

Verified: a no-op merge now produces a **byte-identical** file.

## 2. NEEDS A DECISION — the engine snapshot is staler than the tracker (26 rows)

The engine disagrees with the tracker on **26 of 44 rows**. Per-row fields in conflict:

| Field | Rows | What it means |
|---|---|---|
| `price` | 26 | Engine says $24–$37; the tracker (and the emails already sent) say $57–$97 |
| `product` | 26 | Different product names and price ladders |
| `conversion_score` / `product_fit_score` | 26 / 19 | Re-scored 5–10 points lower |
| `gate_result` | 26 | Engine re-litigates size gates the tracker already settled |
| `avg_likes` / `avg_comments` / `like_comment_ratio` | 26 | Engine has `None` for these and invents `(EST)` pools from follower counts |
| `buyer_pool_x3` | 26 | Derived from those estimates |
| `gross` / `operator_share` | 26 | Different formats for the same projection |
| `status` / `notes` / `first_touch_date` / `last_touch_date` | 26 / 26 / 14 / 14 | Live pipeline state the engine must not touch |

**Why this matters:** the prices in the tracker match the offers described in the emails
already sent on Oct 8. If anyone runs the engine with `--force`, the tracker will stop
matching what was actually pitched, and Gate G1 (commitment-first) loses its paper trail.

**Recommendation:** treat `templates/creator_tracker.csv` as the single source of truth and
either (a) re-derive `CREATORS` from the tracker, or (b) stop treating the engine as a
writer and use it only for scoring new leads. Do not run `--force` until that is decided.

## 3. NEEDS A DECISION — 14 rows claim "DRAFT STAGED" but were sent Oct 8

`outreach_email_pack_P1.md` Part 2 states all 17 Tier-P2/Apify emails were **sent live** on
2026-10-08 and lists their Gmail message IDs. But 14 tracker rows still read
`GMAIL DRAFT STAGED Oct 8 ... Send in Batch 2 (Oct 9)` / `Batch 3 (Oct 10)`, and their
`status` says `OUTREACH_SENT_V2`.

If the drafts were never actually sent, the funnel count of 29 contacted leads is wrong and
the kill criteria (<5 positive replies per 100 touches) are being measured against a
denominator that never happened. **Confirm which it is** — the message IDs in the tracker
can be checked in Gmail Sent in about a minute.

## 4. NEEDS A DECISION — two different follow-up cadences in the same rows

For the 12 P1 leads the tracker's `status` column says `Follow-up 2026-10-10` while the same
row's `notes` says `Follow-up Touch 2 due Oct 12`. `prompts/02` specifies **day 4** (Oct 12
for an Oct 8 send).

Today's queue follows the recorded date (Oct 10) because the tracker wins, but the two
columns should agree before the next batch. Pick one cadence and encode it in the status
format.

## 5. NEEDS A DECISION — two sender identities in one thread

The Oct 8 P1 batch was signed *"Tanariel Sheznick / Nairobi, Kenya"*. The Part 3 follow-up
copy in `outreach_email_pack_P1.md` is signed *"Scott / Shadow Operator"*. Today's Touch-2
drafts use the latter, per that instruction.

A lead who receives one name on day 1 and a different name on day 2 in the same thread has
a reasonable reason to distrust the message. Pick one identity (and one postal-address line
for CAN-SPAM) before the next batch.

---

## What was added today

- `tools/leak_finder.py` — `leaks` / `queue` / `brief`. `prompts/07` described all three but
  none existed in code.
- `tests/` — 40 tests. CI ran `pytest` with no tests collected, which fails the build.
- `.gitignore` — `__pycache__`, `.pytest_cache`, `templates/backups/`.
- `tools/run_monetization_verdicts.py` — import path fixed so it runs from any directory
  (it previously only worked with `cwd=tools/`).
