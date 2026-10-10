# CAMPAIGN AUDIT — "Raw-to-Whop 48h digital asset build" (found 2026-10-10)

**This campaign was not in `templates/creator_tracker.csv`. I found it by searching Gmail.**
It is the only thing in this operation that has produced a reply.

## Scale

| Metric | Value | Source |
|---|---|---|
| Emails sent | **~102** | Gmail `in:sent "48h digital asset build"`, scope complete |
| Send window | Oct 9 – Oct 10 (≈2 days) | message dates |
| Sending address | `scott.abuya@gmail.com` (primary operating inbox) | sent messages |
| Responses | **3** (2 positive, 1 auto-responder) | `"Re: Quick question re:" -in:sent` |
| True positive rate | **2 / ~102 ≈ 2%** | — |
| Hard bounces, last 4 days | 5 (Oct 7–8, **before** this campaign) | mailer-daemon |

The tracker said "29 contacted, 0 replies". The real number is **~102 contacted, 2 positive**.
Every funnel number, kill criterion and leak calculation run before today was wrong because
this campaign was invisible.

## The operator's own kill criterion is triggered

`VERDICT.md`, pre-registered: *"After 100 compliant outreach touches: <5 positive replies ->
targeting/offer is broken, stop and fix before sending more."*

**2 positive replies at ~102 touches. That is below the threshold.** By the operator's own
rule, sending stops and the targeting/hook gets fixed before any more volume.

Two honest caveats, and they cut in opposite directions:
- These touches were **not compliant** (below), so the criterion does not strictly apply.
- The compliant, tracked batch of 29 got **0 replies in 48h**. The aggressive copy is what
  produced both replies. Fixing compliance will probably *lower* the reply rate unless the
  hook is fixed too.

So the uncomfortable read: **the copy that works is the copy that isn't allowed, and nobody
has yet written allowed copy that works.** That is the actual problem to solve, and it is a
targeting/hook problem, not a volume problem.

## Gate breaches in the first-touch template

Quoted verbatim from the sent email to `@ainewscentral` (Oct 10):

| # | Breach | Evidence | Gate |
|---|---|---|---|
| 1 | **Split in the subject line** | `"Quick question re: @ainewscentral + a 48h digital asset build (60/40 split)"` | prompts/02: first touch has *no split*; prompts/03: no split in the audit |
| 2 | **Third-party income claim** | *"our 5-Framework model projects $594–$2,349 in first-launch gross revenue ($356–$1,409 net directly to you at 60%)"* — no assumptions, no `ASSUMPTION` label, no lower-bound headline, no >10x gap flag | G6 MATH DISCIPLINE; also an earnings claim made to a third party |
| 3 | **Build promised pre-commitment** | *"My team packages, designs, and builds the entire product … in 48–72 hours"* | G1 COMMITMENT-FIRST |
| 4 | **Implied organisation** | *"I run a backend Shadow Operator studio"*, *"My team"* | G5 NO FABRICATION (if this is one person) |
| 5 | **Unverified data stated as fact** | *"your engagement (4.65% ER and 24.3:1 like-to-comment ratio across 46,000 followers)"* — the lead has already said it is stale | prompts/01: *"bad data gets flagged, not validated"* |
| 6 | **Volume + wrong channel** | ~102 sends in 2 days from the **primary** Gmail | prompts/02: separate warmed domain, 20–30/day/inbox; `operator_context.md`: cap 6–10/day |
| 7 | **No opt-out, no postal address** | body ends `Best, Scott / Shadow Operator` | prompts/02: address line + one-line opt-out; CAN-SPAM |
| 8 | **Subject over length** | 11 words | prompts/02: subject <6 words |
| 9 | **Untracked** | none of the ~100 recipients are in the tracker | G8 DATA HYGIENE — kill criteria unmeasurable, DECLINED not enforceable |

## Deliverability: the bill has not arrived yet

Five hard bounces landed Oct 7–8 (`dailyuiux@gmail.com`, `postmaster@…vidiq.com`,
`postmaster@…buffermail.com`, `postmaster@…figma.com`, `noreply@github.com`). Those predate
this campaign. **Bounces from the ~102-send batch take 24–72h to report**, and the
auto-responder that was firing at marketing addresses on Oct 3–7 is still a live risk
(`@rathikaramasamy` auto-replied on Oct 9).

`prompts/02` hard rule: **stop at >3% bounces or any spam complaint.** Watch the bounce rate
on this batch before sending anything else from this inbox.

## What the two replies actually cost

- **`@ainewscentral`** (Raz) — positive, wants the gameplan, asked five structural questions
  before sharing any files or account access. Those questions are good ones and they expose
  that the terms were never written down. He also manages three further pages
  (`@todayfilmmakers`, `@thephotoshopguide`, `@aurafilmmakers`).
- **`@premiereprotutos`** (Omar) — positive, but states he holds **no asset library**. The
  Raw-to-Whop premise is that the creator supplies raw files; with none, the operator would
  create 100% of the IP for 40%. That is the `@war_forum` loss pattern the kit already
  documents.

## Decisions needed from the operator

1. **Stop sending** from `scott.abuya@gmail.com` until the bounce rate on this batch is known.
2. **Add the ~100 recipients to the tracker** as `CONTACTED` so the funnel is honest and
   Gate G8 is enforceable. Only the 2 that replied are in there now.
3. **Rewrite the template** before any further first touches: no split in subject or body,
   no projections, no build promise, opt-out + address, <6-word subject, ≤90 words.
4. **Answer Raz's five questions in writing** — they are terms decisions only the operator
   can make (draft prepared in `REPLY_ainewscentral.md`).
5. **Do not pitch the three sister pages** until `@ainewscentral` is signed and paid.
