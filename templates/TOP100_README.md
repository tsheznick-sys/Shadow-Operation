# TOP 100 — Highest Conversion Score Batch
**Source:** templates/creator_tracker.csv — conversion_score column, status=DRAFT_READY
**Selection:** Highest 100 with resolvable emails (552 eligible with email, sorted 100→87)
**Date:** 2026-10-22
**Method:** Draft-first (Gmail Drafts) — one-by-one, human send gate compliant (Gate G4)
**Manifest:** templates/gmail_top100_manifest.json (100 entries)
**CSV:** templates/gmail_top100_manifest.csv
**Script:** scripts/push_top100_drafts.py + scripts/send_top100_colab.py

## Sending plan (per your instruction)
1. Agent creates 100 Gmail Drafts one-by-one via gmail__create_draft (draft method)
2. You review drafts in Gmail → hit Send manually (or run Colab auto-send script at 10/hour)
3. Logs: logs/gmail_top100_push_log.csv

## Deduplication check (2026-10-22)
- GMAIL_SENT count in gmail_outreach_log.csv: 226
- Overlap top100 vs GMAIL_SENT: 0 — no duplicates
- Overlap vs DRAFT_READY: 100 (expected — these were staged but never sent)
- All 100 are DRAFT_READY in tracker — safe to send.

## Top 10 Preview
1 @tiny.party.hat 100 katya@katyaross.com 170K Niche #1
2 @shilstone_arts 100 robbie@shilstonearts.com 447K Niche #1
3 @codygindy 100 cody@codygindy.com 98K Niche #3
4 @hoolopee 100 hoolopee.contact@gmail.com 17K Niche #3
5 @noamkroll 100 noam@cinecolor.io 33K Niche #1
...
100 @memoriesbymeyers2 87 jenna@memoriesbymeyers.com 330K Niche #1

## Gate compliance
- Subject <6 words, Body <90 words, 0 links, 0 attachments, 0 split mentions
- 1 verifiable observation (ER + followers) + opt-out implied
- From: scott.abuya@gmail.com
