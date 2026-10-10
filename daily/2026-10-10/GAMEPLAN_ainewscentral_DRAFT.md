# MONETISATION GAMEPLAN — `@ainewscentral` (DRAFT, INCOMPLETE — DO NOT SEND)

**Status: skeleton only.** Built to the `prompts/03` six-part structure. It is deliberately
unfinished: three of its claims must come from data I cannot fetch (Instagram is not
readable from here), and `G6 MATH DISCIPLINE` + `G5 NO FABRICATION` forbid filling them
with plausible-looking numbers.

**Rule for anyone completing this:** every `[VERIFY]` marker must be replaced with a real
observation or the whole claim is cut. `prompts/03` QA: *"could the creator verify each
observation in 30 seconds? If not, cut it."*

---

## THE 15-MINUTE DATA PULL (do this first)

Open `@ainewscentral` on Instagram. For the **last 12 non-pinned posts**, record:

| # | Post date | Format | Likes | Comments | Comments asking for the file/template/workflow |
|---|---|---|---|---|---|
| 1 | | | | | |
| … | | | | | |
| 12 | | | | | |

Then:

- `avg_comments` = mean of the Comments column → drives every number in Part 3.
- `avg_likes` = mean of the Likes column.
- `like_comment_ratio` = avg_likes / avg_comments. Kit cap is 50:1; above that the audience
  is scrolling, not buying.
- `buyer_pool` = avg_comments x 3 (the kit's only trusted demand proxy).
- `request_count` = sum of the last column → the comment evidence for Part 2.

Run it:

```bash
python tools/revenue_model.py --followers <real> --avg_comments <real> --price 27 --split 0.40
```

Paste the HEADLINE line into Part 3 verbatim, including the gap flag.

**Known data conflict, flagged not hidden:** your first email used 46,000 followers and
~251 commenters. Raz says the audience is **over 100,000**. Use his number, label it
"creator-stated, unverified", and say so on the page.

---

## PART 1 — THE AUDIT

**Followers:** 100,000+ *(creator-stated, unverified — our Oct 10 email used 46,000 and was
stale; correcting in your favour)*
**Niche:** AI news, tools and workflows — Niche #2 (Applied AI Video / Generative
Workflows), the operator's locked 30-day focus, scored 92/100.
**Avg comments:** `[VERIFY — 12-post count]`
**Like-to-comment ratio:** `[VERIFY]`

**Three verifiable observations** — each must be checkable in 30 seconds:

1. `[VERIFY]` Specific post + what commenters asked for. Pattern to look for: comments
   asking for the prompt / the workflow / the tool list, not just "nice".
2. `[VERIFY]` Second post, same or different request pattern.
3. `[VERIFY]` Third post.

**The hidden transformation** — the real reason people follow:

*Draft framing, to be confirmed or replaced by the observations above:*

> People do not follow AI News Central to admire AI output. They follow it to stay current
> without doing the reading. The shift they are buying is **from behind to caught up** —
> and the anxiety underneath it is that the field moves faster than they can track.

If the 12-post count does not support that framing, rewrite it. Do not keep a good sentence
over a true one.

---

## PART 2 — THE OPPORTUNITY (top 3, each backed by comment counts)

Ranked by `[VERIFY: request_count]` from the pull above. Format per topic:

> **Topic — N comments across the last 12 posts asked for this specifically.**
> What they ask for, what they currently get instead, and why the gap is sellable.

Candidates to test against the data (do not assert any of these until counted):

1. **Prompt packs for the workflows you post** — the reusable version of a post.
2. **A "this week in AI, and what to actually install" decision rule** — not a tool list, a
   filter. Your posting volume implies your audience's problem is selection, not discovery.
3. **A workflow implementation playbook** — chained tools in execution order, rather than
   another ranked list.

Whichever has the highest request count goes first. If none clears 5 requests in 12 posts,
say that plainly on the page: it means the demand is unproven and the demand test in Part 6
is the only honest next step.

---

## PART 3 — THE NUMBERS (range, every assumption listed — never one hero number)

`[REPLACE with the revenue_model.py HEADLINE line after the 12-post pull]`

Placeholder, at 100,000 followers / $27 / 40% split, **every figure an ASSUMPTION**:

| Method | Low | Base | High |
|---|---|---|---|
| Comment-anchored (buyer pool x 3) | $73 | $389 | $1,458 |
| Funnel (views x click x buy) | $22 | $236 | $1,350 |
| **Headline (lower of the two)** | **$22** | **$236** | — |
| Operator share at 40% | | **~$95** | |

**Assumptions, stated on the page, not buried:**

- Follower count is creator-stated (100,000+), not verified.
- `avg_comments` is `[VERIFY]` and is the single biggest swing factor.
- Buyer pool = avg comments x 3. That is a kit convention, not a measured conversion rate.
- Conversion and click rates are the kit's defaults, not observed for this account.
- The workbook formula this niche is sold on produces **$40,500** for the same inputs — a
  **171x gap** against the base case. It is printed here as marketing arithmetic, not as a
  forecast.

**If the base case lands small, say so on the page and pitch the subscription instead.**
`VERDICT.md` is explicit: portfolio MRR beats one-off launch math. A $9–29/mo tier at even
50 members beats a single $236 launch, and it is the difference between this being a
business and being a gig.

---

## PART 4 — PRODUCT SUGGESTION (price ladder)

Ladder: **tripwire $9–29 → core $47–97 → subscription $9–29/mo.**

Proposed, to be validated by the Part 6 demand test rather than asserted:

| Tier | Product | Price |
|---|---|---|
| Tripwire | `[highest-request-count topic]` starter pack | $19 |
| Core | The full workflow vault + implementation playbook | $67 |
| Subscription | Weekly "what to install and what to ignore" + monthly pack drop | $19/mo |

**Price justification requires a competitor check** (Whop / Gumroad / Etsy, 3–5 comparable
AI-workflow products). `[VERIFY]` — do not ship the page without it; `prompts/03` requires
it and it takes ten minutes.

---

## PART 5 — LAUNCH STRATEGY (14 days, 3 phases — a conversation, not a countdown)

- **Days 1–4 — the problem.** Stories that name the gap the audience already feels
  (behind, overwhelmed, too many tools). No product mentioned.
- **Days 5–10 — the method.** Show the workflow being used. Give away one piece. Ask which
  of the three topics they want most — this is also the demand test.
- **Days 11–14 — the product.** Open the vault. Answer the objection that surfaced most in
  days 5–10, in the creator's voice, not a sales voice.

Daily posting during the window is the one commitment asked of the creator. It is also the
single biggest driver of whether any of the above numbers happen.

---

## PART 6 — THE DEMAND TEST (go / no-go, in plain English)

3-slide Story test, copy adapted from `prompts/04`:

- **Slide 1:** the problem, framed as a question ("which of these do you actually want?").
- **Slide 2:** the three topics, as a poll.
- **Slide 3:** one-word CTA to signal intent.

**Thresholds (from the kit's own history):**

| Signal | Read |
|---|---|
| ≥1.5% of viewers send the CTA word | **GO** — demand confirmed, build it |
| 0.3%–1.5% | **AMBER** — re-test with a changed framing |
| <0.3% | **RED — no build.** (The operator's own Numinous lab scored 0.26% and was correctly stopped.) |

Say this on the page, in those words. A creator who sees you publish the no-go threshold
trusts the go threshold.

---

## HARD RULES APPLIED

- **No split anywhere in this document.** `prompts/03`: the split is disclosed on the call,
  before agreement, never in the audit. The 60/40 already leaked into the first email's
  subject line; do not let it into the deliverable.
- **No fabricated proof.** No testimonials, no "we've launched X creators", no case
  studies. There have been zero paid partnerships in this operation.
- **No build promise.** Nothing here commits to producing anything before the demand test
  passes and the one-pager is signed.
- **One ask at the end:** *"Worth a 15-minute call?"*

---

## BEFORE SENDING — checklist

- [ ] 12-post pull done; `avg_comments`, ratio and request counts filled in
- [ ] Part 1's three observations are all verifiable in 30 seconds
- [ ] Part 2's top 3 ranked by actual request count
- [ ] Part 3 replaced with the real `revenue_model.py` output, gap flag included
- [ ] Part 4 competitor price check done
- [ ] Owner/IP question answered in the covering email, not here (`REPLY_ainewscentral.md`
      already does this)
- [ ] Rendered to the Black Edition PDF template
- [ ] Sent **in-thread** with `REPLY_ainewscentral.md`, inside the 1-hour SLA
