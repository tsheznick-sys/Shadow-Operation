# GMAIL → TRACKER RECONCILIATION — 2026-10-10

Closing the gap found in `CAMPAIGN_AUDIT_RAW_TO_WHOP.md`: the tracker said **29 contacted /
0 replies** while Gmail held **101 recipients / 2 positive**. Every funnel rate and the
operator's own pre-registered kill criterion were measuring a denominator that never
existed.

---

## What was actually sent

| | Count | Source |
|---|---|---|
| Messages matching `in:sent "48h digital asset build"` | **102** | Gmail, paginated to completion |
| Distinct first-touch recipients | **101** | `gmail_export_raw_to_whop.csv` |
| Replies sent inside that campaign | 1 (to `@premiereprotutos`, Oct 10 01:24) | thread `1a1218c9defc5121` |
| Send window | Oct 9 22:36 → Oct 10 07:57 (≈9.5 hours) | message dates |
| Already in the tracker | 2 (`@ainewscentral`, `@premiereprotutos`) | matched on email |
| **Missing from the tracker** | **99** | imported today |

The export is committed at `gmail_export_raw_to_whop.csv` (101 rows, handle / email /
sent_date / gmail_msg_id / campaign) so this is reproducible rather than a claim.

---

## What I changed

**Tooling**

- `tools/reconcile_gmail.py` — new. Merges a Gmail sent-mail export into the tracker.
  Matches on email (then handle), **adds** unmatched recipients, **fills only blank cells**
  on matched rows, stamps a `campaign` column, writes a `templates/backups/` timestamped
  backup first, and has `--dry-run`.
- `tools/leak_finder.py`
  - new terminal state **`quarantined`**;
  - new `touched()` / `positives()` / `kill_criteria()`;
  - `leaks` and `brief` now print the **outreach-touch denominator** and evaluate the
    VERDICT.md kill criterion instead of leaving it to someone's memory;
  - the brief's hardcoded "biggest risk" line (which literally said "29-send batch") is
    gone; it now reports the live numbers.

**Data**

```
python tools/reconcile_gmail.py \
  --export daily/2026-10-10/gmail_export_raw_to_whop.csv \
  --campaign raw-to-whop-48h
```

Result: tracker 46 → **145 rows**. 99 imported as `QUARANTINED (raw-to-whop-48h) - untracked
send found in Gmail`, 2 existing rows got a `campaign` fill, **zero cells overwritten**.

**Why QUARANTINED and not CONTACTED:** these leads must count — the operator really did
email them, so the kill-criterion denominator and Gate G8 need them — but they must never
be worked. They were never vetted, most are off the locked niche, and the campaign that
reached them breached nine gates. Quarantined means *counted, not followed up*: they are
excluded from `send_queue()` by construction, and there is a test asserting that.

---

## The corrected numbers

```
OUTREACH TOUCHES (every lead ever emailed, incl. terminal/quarantined)
  touched               130
  positive                2   (1.5%)
  kill criterion     <5 positive per 100 touches -> TRIGGERED - STOP ADDING VOLUME
```

| | Before | After |
|---|---|---|
| Touches | 29 | **130** |
| Positive | 0 | 2 |
| Positive rate | 0.0% | **1.5%** |
| Kill criterion | not evaluable (looked fine) | **TRIGGERED** |

All 130 touches fall in Oct 8–10, so this is the current push, not a lifetime average
mixing in the archived creators — those rows carry no `first_touch_date` and are correctly
excluded.

**The comparison that matters:**

| Cohort | Touches | Positives | Rate |
|---|---|---|---|
| Tracked Oct 8 batch (on-niche, P1/P2, compliant-ish) | 29 | 0 | **0.0%** |
| Raw-to-Whop spray (off-niche, 9 gate breaches) | 101 | 2 | **2.0%** |
| **Total** | **130** | **2** | **1.5%** |

Both are far below the 5-per-100 threshold, which is the point: this is not "the aggressive
copy works and compliance is the problem". **Neither version works.** 130 touches bought
two conversations, and the on-niche, better-behaved batch bought none. The fix is the offer
and the hook, not the compliance level and not the volume.

`leak_finder` still names `contacted → replied` as the biggest leak. It is right, and it is
now measured against 130 touches instead of 29.

---

## What this does NOT fix

1. **Bounce rate is still unknown.** The audit flagged that bounces from a ~100-send batch
   take 24–72h. Nothing here checks that. `prompts/02`: stop at >3% bounces or any spam
   complaint.
2. **Compliance is not tracked per row.** The kill criterion says *compliant* touches;
   compliance is not a column, so the tool prints a caveat rather than pretending.
3. **The 99 are still unvetted.** Quarantined is a holding state, not a verdict. If you
   want any of them, they go through `prompts/01` scouting like anyone else.
4. **Nothing here answers the five terms questions** Raz asked. See `THREAD_STATE.md`.

---

## Reproducing / reverting

```bash
# what would change, writing nothing
python tools/reconcile_gmail.py --export <export.csv> --campaign <label> --dry-run

# the corrected funnel
python tools/leak_finder.py leaks
python tools/leak_finder.py brief
```

The write is reversible: every run leaves a timestamped copy in `templates/backups/`
(git-ignored). The 99 imported rows are identifiable by
`campaign = raw-to-whop-48h` and a `QUARANTINED` status, so they can be dropped as a block.
