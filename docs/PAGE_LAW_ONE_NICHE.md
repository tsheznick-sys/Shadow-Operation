# PAGE LAW — one page, one niche

**Written:** 2026-10-31 · **Reason:** six pages were pointed at the same niche and nothing in the system objected.

## What was wrong

| Claim in the repo | Reality |
|---|---|
| "5 pages" (38 places) | the operational count |
| "6 pages" (1 place) | the one that actually described what was being built |
| "10 channels" (2 places) | true only under the old 2-channels-per-page model |
| "30 channels" (1 place) | true under the 6-channels-per-page model |
| `solo_domains.niche` | **no uniqueness constraint, no check, nothing** |

The code did not know the difference between *a page*, *a channel* and *a niche*. `cloneBrief()` handed back the
template's niche untouched, so cloning six times produced six pages selling the same thing to the same reader.
That is not a hosting mistake. It is three failures stacked:

1. **Policy.** YouTube, 16 July 2026: *"multiple channels running the same template is exactly the
   mass-produced-templates bucket, just distributed."* Six pages on one niche is that sentence with extra steps.
2. **Our own lock.** *Zero graduation = zero clones.* A clone may copy the **system**; it may never copy the
   **market** the system already occupies.
3. **Money.** Six pages bidding for one audience raise cost and split demand. Cost multiplies; demand does not.

## The rule

> **A page = one niche + one audience + one angle + one visual world.**
> Its **6 channels** are surfaces of that page — not six pages, and not six chances to repost the same cut.

## The roster

| # | Page | Reader (a motive, not a demographic) | The question it answers | Look |
|---|---|---|---|---|
| 1 | Consumerism | feels quietly overcharged, wants the receipt | why this costs what it costs | flat vector, catalogue, price tags |
| 2 | Marketing History | small operator who wants the campaign that worked | how it was really built — brief, budget, mistake | archive collage, newsprint |
| 3 | Psychology | curious about their own reflexes | why your brain does this — one mechanism | stickman, locked frame, no LUT |
| 4 | Self-Improvement | already failed at motivation, wants a system | the system, not the willpower | whiteboard, grids, arrows |
| 5 | Dark Psychology | negotiating power and losing | the influence mechanic being used on you | hard key light, noir |
| 6 | **HELD** | — | — | — |

### Why slot 6 is empty

**Mindset and Wolf Mindset are not a sixth reader.** They are the Self-Improvement reader after midnight.
Psychology, Dark Psychology, Mindset, Wolf Mindset and Self-Improvement are five labels on two audiences.
Inventing a sixth label to fill a grid is how you get six pages on one niche with better branding.

Slot 6 opens when the **daily scan** produces an evidenced sixth reader — distinct motive, distinct
question, distinct look. Not before. `lib/pages.ts` holds the slot and `auditPages()` refuses the roster if
anyone fills it with a duplicate.

## What is now enforced in code

| Guard | Where |
|---|---|
| `solo_domains_niche_uniq` — unique index on the normalised niche | `scripts/migrate.sql` |
| `solo_domains_no_banned_niche` — no finance/health/legal row can be written | `scripts/migrate.sql` |
| `page_channels_one_page_one` — exactly one page-one channel per page | `scripts/migrate.sql` |
| `distinctness()` — same cluster, or two of (angle, visual) = **block** | `lib/pages.ts` |
| `canAddPage()` — every candidate checked against every live page | `lib/pages.ts` |
| `auditPages()` — the roster audited as a whole | `lib/pages.ts` |
| `cloneBrief()` — returns `allowed: false` for a taken or banned niche | `lib/scaleout.ts` |

## The arithmetic

**5 pages × 6 channels = 30 channels.**

Per page: YouTube Longform (**page 1**) · YouTube Shorts · TikTok · Instagram · Facebook · X.

> Note: the earlier "2 YouTube channels per brand = 10 channels" predates the 6-channel model and is retired.

## Raw vs edited, per surface

Every channel above carries the **edited** cut. The **raw** cut exists only on Whop — that is the migration
incentive and the reason no platform can demonetise the thing people are actually paying for.
`page_channels.cut` is constrained to `edited` so a raw cut cannot be attached to a public surface even by hand.
