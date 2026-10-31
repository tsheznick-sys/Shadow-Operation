# CLOSING SYSTEM — Shadow Operation
## The Closer: From Reply → Demand Test → Whop → Cash
**Branch:** `arena/6c47af3d-shadow-operation` | **Status:** `pr_open` | **PR #6** | **Date:** 2026-10-28
**Mode:** Butler (Alfred) — "Sir, closing protocol active"

> **Memory:** Built on `8 Hard Rules` + `Growth_Operator_Module` + `execution_tracker.json` Phase 1-4 + 1,462 GREEN apparatus + your `SHA-15/14/13` Linear history.

---

### 0) CLOSING PHILOSOPHY — Hard Rules Are the System

JARVIS never begs. You are the operator, not the agency.

- **Rule 1:** 3-email cap → FINAL TERMS (Hard NO on tweaks). Copy from `SHADOW_OPERATION_RULES.md`.
- **Rule 2:** No free audit before YES → `build_audit_now` only after `validate_first` (Anu exception is closed — now strict).
- **Rule 3:** Hard close on tweak after FINAL TERMS → thread closed permanently (Omar 1a159d811ecf5c8e precedent).
- **Rule 5:** Demand test is the ONLY gate → ≥1% story views + ≥25 replies = PASS → build. Else KILL, zero cost.
- **Rule 6:** Two offers → 60/40 rev-share (default) | Flat-fee (only if they ask)

**Butler Voice:** "Sir, they asked for research purposes. Per your directive, thread closed. No reply."

---

### 1) INBOX TRIAGE — JARVIS Sorts Every Reply in 15 min

**Trigger:** `gmail__list_messages` every 15 min → `scott.abuya@gmail.com` (32,337 msgs) → `Shadow Hot` label (Rule 7).

**JARVIS classifies instantly:**

| Type | Signal | JARVIS Action | Template |
|---|---|---|---|
| **YES** | "I'm in" / "YES to demand test" / "send audit" | → Create Linear SHA issue → Send 3-story scripts → Whop invite | `CLOSE_YES.md` |
| **MAYBE** | "How does it work?" / "Case studies?" | → Niche framing: "Proof = your demand test" + 5-step map | `CLOSE_MAYBE.md` |
| **TWEAK** | "Can we do 70/30?" / "Flat fee?" after FINAL TERMS | → **CLOSE thread** → Log LOST → No reply | `CLOSE_FINAL_TERMS.md` |
| **NO** | "Not now" / "Build myself" (Lanna pattern) | → Gracious + 5 validation Qs → Door open → QUARANTINE | `CLOSE_NO.md` |
| **GHOST** | No reply to 2 emails + Oct 28 bump | → X/TikTok DM where they live (427K TikTok primary) — Rule 8 `try_dm` | `CLOSE_GHOST.md` |

**Tool:** `tools/reconcile_gmail.py` → fills `first_touch_date` / `last_touch_date` / `replies` → `QUARANTINED` if untracked send found (audit 102-send lesson).

---

### 2) SCRIPTS — Copy-Paste, No Lawyers Here

**You have 4 scripts total. Nothing else.**

#### A) YES → DEMAND TEST (3 Stories)
```
Subject: Re: Quick idea for @handle

Locked in.

3 Stories, your voice, my build:

1. Story 1: "1 prompt I stole" (poll: Want it? YES/NO)
2. Story 2: "Behind the vault" (link sticker: WHOP)
3. Story 3: "25 replies = I build" (gate)

Post them Tue-Thu, tag me. I watch replies.

If PASS (≥1% views + 25 replies) → I build Vault + Whop next-day payout ($2.50 ACH, Kenya tested).
If FAIL → we kill, 0 cost. Your audience keeps trust.

Scripts + audit attached. Reply "GO" and I schedule.

— Scott
```
**Attachment:** 1-page audit (6-part: Hook, Retention, Monetization, Gaps, 3 Fixes, Gate G6 projection). Built ONLY after YES (Rule 2).

#### B) MAYBE → NICHE FRAMING
```
This is niche-based & influencer-based. What works for @quietwolfzz (514K) won't for you. Proof isn't my case study — it's YOUR demand test.

Process:
1. You say YES → I send audit + 3 stories
2. You post (3 days)
3. We read your replies (real buyers, not followers)
4. PASS → build | FAIL → stop

Want the 1-page audit to decide?
```

#### C) TWEAK AFTER FINAL → CLOSE
```
Final terms were sent [date]. Any tweak after that = thread closed per operator.

If you can do better elsewhere, go do it elsewhere. Research purposes declined.

No reply.
```

#### D) NO → VALIDATION ASK
```
Got it — you'll build on your terms, respect.

As a favor, 5 Qs (no pitch):
1. What product would your audience actually buy?
2. What stopped you from launching?
3. What proof would you need?
4. Flat-fee or rev-share you prefer?
5. Want me to leave door open?

Thanks for the honesty.
```

#### E) GHOST → DM BUMP (Oct 28 Playbook)
```
Hey — 2 emails in Gmail (scott.abuya@gmail.com) + Oct 28 bump, no reply, so trying DM where you live.

You built a system where one story teaches one lever — rare at [followers] to hold [ratio] depth.

I sketched a 1-page note on how I'd run that as 6/day Publisher + auto-DM + Whop Vault behind — zero build, 60/40 only if YES to demand test.

Want the 3-bullet summary here?
— Scott
```
**DM Backup if ghosts (Rule 8):** quietwolfzz pattern → 427K TikTok primary → try X/TikTok DM.

---

### 3) LINEAR DATABASE — Closing Pipeline

**Project:** `Shadow Operation — Q4 2026` (79092591) | **Team:** `SHA` (98004e03)

**Flow:**
1.  Reply detected → `linear__create_issue` → Title: `@handle: Reply YES/MAYBE/TWEAK` → Priority 1 → Label `warm-outreach` + `high-value` + `revenue`
2.  Link to parent `SHA-16` (Wave 2: 101-200) → `create_issue_relation` blocks/related
3.  Move `SHA-15/14/13` style → `In Progress` → `Done` on demand test PASS → `Canceled` on TWEAK
4.  Project update every 50 replies → health `onTrack` / `atRisk` (Hard Rule 5 gate)

**Current:** SHA-15 Omar FINAL TERMS, SHA-14 Anu survey, SHA-13 Lanna declined → templates for new replies.

---

### 4) DEMAND TEST — 3 Stories, 3 Days, 1 Decision

**Gate:** PASS = ≥1% story viewers reply + ≥25 raw replies → BUILD. Else KILL.

**Whop Fees:** 13% effective + $2.50 ACH next-day. Kenya payout NOT confirmed — run $1 test withdrawal before first launch (Hard Rule benchmark).

**Clipping Lever:** Whop $1.50-2.00 CPM → cheap distribution for products you own (inbox email).

**If PASS:** Build product per `execution_tracker.json` Phase 2 (35+ prompts, 5 automations, Notion, 5 videos) → `scripts/whop_cli.py` → launch Phase 3 (12 GREEN → 1,020) → `SHA-9` affiliate.

**If FAIL:** Log `what_failed` → `reference/learnings.md` → QUARANTINE → never re-pitch.

---

### 5) KILL CRITERIA & GATES

- **G1:** 5+ survey responses (SHA-11) — we have 10 Niche #2 SENT, awaiting by Oct 27
- **G4:** Operator SEND approval — DRAFT+INBOX, never auto-send (your 200/200 LIVE are DRAFT only)
- **G5:** Demand test PASS
- **G6:** Tri-Model revenue (Headline vs Comment-Anchored vs Naive gap 229x) — lower-bound headline only
- **G8:** Funnel denominator honest — `reconcile_gmail.py` QUARANTINE ensures kill criterion uses real touches (102-send audit lesson)

**Done = Cash + Learnings logged.** No lawyer language — FINAL TERMS one-pager only, plain English, 10 points verbatim, non-negotiable, sign only after PASS.
