# Email Verification Report — 1000 Green Apparatus — 2026-10-28

**Branch:** arena/6c47af3d-shadow-operation `pr_open` — DO NOT MERGE — verify before send (Hard Rule 7, G4)

**Source:** data/creator_apparatus_1000.csv (1000 GREEN, apparatus right metrics, not vanity followers)

**Apparatus gate used:** 10K-100K sweet spot, buyer_pool_x3=comments*3, ratio<50:1 EST_PASS, ER 3%+ (5%+ ideal), conv/fit scores, Gate G6 Tri-Model

## Summary
- **Total rows with AMBER pattern:** 1001 (1000 GREEN outreach + 1 AMBER anchor @quietwolff 514K)
- **GREEN outreach pool:** 1000
- **With email (valid format):** 764 (76.4%) — ready to send after bio/email double-check
- **Pending / DM-only:** 236 (23.6%) — no email, keep for IG DM companion only
- **Domains:** gmail.com 211 / outlook.com 206 / protonmail.com 181 / icloud.com 166 (synthetic seeding — needs real hunter.io / bio scrape to replace)
- **Bad format:** 0 — all 764 pass RFC format, but SMTP/existence NOT verified yet

## What 'verified' means here
- **Format-valid ≠ inbox exists.** Apparatus generated emails are *synthetic* seeded from handle templates (e.g., propaganda_files450@protonmail.com). They demonstrate the structure and allow batch drafting.
- **Real verification requires:** Hunter.io / Apollo / Instagram bio scrape + manual 'email in bio' check + Gmail hard-bounce filter (550 = drop, per Hard Rule 7).
- **Next step before any send:** Replace synthetic with real bio emails via `tools/hunter_verify.py` or manual scout — currently 764 placeholders are NOT real inboxes.

## Recommendation (Playbook)
- **DO NOT blast 764.** Apparatus cap = 6-10/day primary Gmail (operator_context). Blasting 764 = instant spam kill.
- **Path:** 1) Scout real emails for TOP 20 GREEN (highest pool 633→400) → 2) Stage 10 Gmail drafts → 3) Human-send G4 → 4) Daily poll `label:"Shadow Hot"` → 5) Demand test → 6) Next 10.
- **DM-only 236:** Use IG DM companion only (per your request) — native <280 chars, no link, no automation.

## Files
- Full vault: `data/creator_apparatus_1000.csv` (1001 rows, 1000 GREEN)
- Emails+IG DMs: `outreach_BATCH_1000_GREEN_EMAILS_IGDMs_2026-10-28.md` (8007 lines)
- Verification table: `data/verify/creator_1000_green_email_verification.csv` (1000 GREEN, ready_to_send flag)
- This report: `data/verify/VERIFICATION_REPORT_2026-10-28.md`

**Warning:** Synthetic emails are DRAFT-only. Sending to them will hard-bounce (550) and hurt sender reputation. Real hunt required.
