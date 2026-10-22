# Gmail Cleanup — 2026-10-22T06:00Z

## Strategy: 90%+ Connectors + Pull Requests Before Merge (Decent Finish)

- **100 Top100 drafts** preserved [DRAFT+INBOX] via `gmail__batch_modify_messages` (10 batches) — verified 0 overlap
  - Manifest: `templates/gmail_top100_manifest.json` (100 unique, 100→79)
  - Log: `logs/gmail_top100_push_log.csv` (100 CREATED, real IDs r-4555…r-8514)
  - Progress: `logs/gmail_top100_progress.json` status=complete
  - PR: #4 `Shadow Operation: Top 100 (100→79) 100/100 LIVE + Full Audit — Draft+Inbox` — OPEN MERGEABLE CLEAN

- **25 malformed drafts deleted** via `gmail__delete_draft` 5×5 batches (Gmail connector, not bash):
  - Batch 1: r3021197866697164121, r7044950734947534476, r-6701683914545869703, r6968806561173147766, r4405460523967754805 ✓
  - Batch 2: r-7729946393059696971, r5753906999685218572, r-4602950591888500772, r6849822211800962865, r982860263890058566 ✓
  - Batch 3: r6990533501835071965, r1158885710332608569, r5088911425126259521, r3795189849324273685, r2871571570780650303 ✓
  - Batch 4: r4953038713782100232, r-3827440779469829513, r-2495976696963392346, r-3620853728429604030, r-4342683739781617105 ✓
  - Batch 5: r-8821306333039016672, r710680463342599649, r-6639832345315158680, r3997353453750341273, r-7421849054489434525 ✓
  - Verification: extracted to `/tmp/malformed_ids.txt`, cross-checked vs `/tmp/keep_ids.json` (100 keep) — overlap 0, safe to delete
  - Scope: `malformed_only` per operator ask_user (preserved ~20 Re: follow-ups + 7 validations)

- **Workspace clean**: `git status` nothing to commit before cleanup, zip/nested/backend/daily/images removed earlier

- **Decent finish before merge**: All 100 forwarded to INBOX, drafts live in scott.abuya@gmail.com (31983 Msgs), operator can Send from Inbox
