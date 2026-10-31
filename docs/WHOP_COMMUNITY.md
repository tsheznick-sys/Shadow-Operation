# THE WHOP COMMUNITY — what it is, who gets in, and what runs itself

**Status:** rebuilt 2026-10-31 against the code that exists, not against a plan.
**Supersedes:** §5 of `docs/SHADOW_OPERATION_FULL_PIPELINE_CONTENT_TO_COMMUNITY.md` ($19 Vault Circle /
$79 Shadow Council / Skool / ManyChat / 6 posts a day). Every one of those numbers is wrong now; the
correction table is at the bottom so nobody re-imports them.

> Every price, quota and time in this document is read from a file, and a test fails if the document
> and the code disagree (`CM01`–`CM06` in `tests/agent.test.ts`). If you change a tier, the doc breaks
> the build until you change it too. That is the point.

---

## 1. What the community is

The community is **the thing the content sells into**, and it lives on **whop.com**. It is not a chat
room bolted onto a video pipeline; it is the second half of a loop that already runs:

```
comment on a post
   → Chatfuel fires a webhook
      → WF6 → /api/chatfuel/dm
         → ONE private reply, carrying a whop.com link built from env ids
            → whop.com checkout (paid tiers) or the community page (free)
               → a member row in `agent_members`
                  → a tier, a quota, a publish path
```

That is the whole funnel. There is no separate "join" form, no ManyChat keyword, no manual invite.

---

## 2. The three doors

Three products. Not two, not four. **Max was dropped** — at $71 it sat above Team $62 and made the
top of the ladder pointless.

| Door | Price | Seats | Runs / 5h | Runs / month | Watermark | Polish | Direct publish |
|---|---|---|---|---|---|---|---|
| Free | $0 | 1 | 20 | 300 | **yes — `STICKMAN`** | — | no: download the file |
| **Circle** | **$44** | 1 | 40 | 600 | no | — | no: we publish for you |
| **Pro** | **$53** | 1 | 80 | 1200 | no | yes | **yes, to your own channel** |
| **Team** | **$62** | 3 | 80 per seat | 1200 per seat | no | yes | yes, per seat |

Source: `lib/tiers.ts` (`TIER_SPECS`, `FREE_SPEC`). 44, 53 and 62 all reduce to 8.

**The ladder** is not a subscription and is deliberately kept separate:

| Product | Price | What it is |
|---|---|---|
| First Shot | $28 | 14 days, everything, lapses by itself — no card kept |
| Lite | $17 | the downgrade save: free-level runs **without** the watermark |
| GOOD | $35 | one-time build, no recurring agent access |
| BETTER | $89 | one-time build, no recurring agent access |

**No percentage discounts, ever.** A discount on a $44 product that is already priced at its
break-even (see `docs/COMMUNITY_FUNDING_MODEL.md`) is a slow insolvency. The ladder is the discount
mechanism: First Shot for trials, Lite for saves.

---

## 3. What a member actually experiences

The member does not see a pipeline. They see four things.

**a. A run.** `POST /api/agent/run` → reserve → gate → render → settle. The quota is claimed
**before** the renderer is paid, so two clicks cannot spend one run, and a failure on our side is
refunded automatically. The response says what tier priced it, what resolution they got, and how many
runs are left.

**b. A file.** Free members get 720p with `STICKMAN` burned in — they distribute our brand. Paid tiers
get 1080p clean. The watermark is not a nag; it is the reason the free tier exists.

**c. A publish.** Three paths, assigned by tier, never chosen by the member:

| Tier | Path | What that means |
|---|---|---|
| Free | `manual_download` | the file is the product; they post it themselves |
| Circle | `buffer_scheduled` | **we** publish to the page's channels on the schedule; they never touch an API key |
| Pro / Team | `oauth_direct` | published to **their own** channel, with a **2-hour** human review on their first three posts |

The first three Pro/Team posts sit at `g4_review` with a two-hour SLA before they go out. After
three clean publishes the row goes straight to `pass`. A member who has never published before does
not get to publish unreviewed, and should not want to.

**d. A calendar.** The scheduler books real slots, in Africa/Nairobi, every day of the year — no DST,
because Kenya has none:

| Surface | Time (EAT) | Days |
|---|---|---|
| YouTube longform | **09:00** | Mon / Wed / Fri |
| YouTube Shorts | **12:00** | daily |
| TikTok | **17:00** | daily |
| Instagram | **19:00** | daily |
| Facebook | **20:00** | daily |

Five surfaces, staggered. **X is not one of them** — it was removed, and `lib/publish.ts` refuses any
surface that is not in the five.

---

## 4. How the community is laid out

Whop gives a product one community with spaces. Five is enough; more is a ghost town with better
lighting.

| Space | Who can post | What goes there |
|---|---|---|
| **start-here** | owner | the run loop in one screen, the three prices, what each buys. Read once, never again |
| **renders** | members | what the agent made for them this week. This is the proof channel and the only one that has to be busy |
| **wins** | members | a number, a screenshot, a link. No essays |
| **pods** | pods | three-seat crews from Team, and the cohort pods. Accountability, not chat |
| **ask** | members, answered by owner | questions. Every answer that is worth repeating goes into start-here |

**What is deliberately absent:** a general chat, a memes channel, and a "introduce yourself" thread.
Each one costs attention and returns nothing. The community earns its $44 by producing output, not by
being pleasant.

---

## 5. What runs itself, today

No claim below is aspirational. Each row names the file that does it.

| Runs without anyone | Where |
|---|---|
| Comment → DM → whop.com link, one private reply per comment, 7-day window | `app/api/chatfuel/dm`, `lib/whop-links.ts` |
| Slot planning: five surfaces, one post per surface per day, staggered times | `lib/schedule.ts` |
| Publishing every 15 minutes — claim, channel resolve, publish, mark | `app/api/cron/publish-due` + WF5 |
| Retry with 5 → 30 → 120 minute backoff, then block for a human | `lib/schedule.ts` |
| Quota claim and refund around every render | `app/api/agent/run` |
| Tier → quota → watermark → publish path, from one registry | `lib/tiers.ts` |
| Funding arithmetic, member counts, exact-vs-unknown | `/money`, `/api/funding` |
| Churn signal at a 2.0 % alert threshold | `lib/retention` + WF4 |

## 6. What is still a human, today

Said plainly, because a community doc that hides this is a lie the whole team inherits.

| Still manual | Why it is not automated yet | What would automate it |
|---|---|---|
| Posts **into** the community (daily drop, teardown, wins repost) | nothing writes to Whop's community API; the DM leg reads it, it does not post | a Whop post mutation behind the same gate as `/api/schedule` |
| The weekly live teardown | it is a person on a call | nothing. It should stay a person |
| Pod assignment | the table exists, the matching does not | a nightly job over `pod_members` |
| The 72-hour demand test and the 14-day challenge | the cohort reader exists (`/api/challenge`), the clock does not | a cron that reads the cohort and writes verdicts |
| Tier changes from a Whop event | `whop/webhook` verifies and records; it does not reprice a live session | a reconciler on `membership_*` |

---

## 7. The rules the community enforces on itself

These are the operation's own hard rules, turned outward. They are not moderation policy; they are
how the economics survive contact with members.

1. **No free 1:1 audits.** The R2-style audit costs real hours and returns nothing. A member who wants
   one passes the demand test first (≥1 % of views and ≥25 replies on a real post), then we build.
2. **Three emails, then FINAL TERMS.** Support is capped at three exchanges per issue. The fourth
   message is the template, not a fourth explanation.
3. **One page at a time.** A member does not get a second page until the first one has published for
   14 days. Five half-built pages is how an operator burns out and blames the tool.
4. **Waves of 25.** New members arrive in cohorts, not in a flood. A cohort can be answered by one
   person; a flood cannot.
5. **The ledger publishes its failures.** If the funding maths or a payout breaks, it is written where
   members can see it. A community that discovers a broken number in month four does not come back.
6. **Revenue is opt-in, off by default.** We do not ask a member what they earn unless they offer it.

---

## 8. The money

Covered in full in `docs/COMMUNITY_FUNDING_MODEL.md`. The two numbers that matter:

- **26 Circle members** cover tools + prizes. Below that the community runs at a loss and the owner
  funds it.
- **35 Circle members** cover tools + prizes + the annual renewal fund, with a reserve.

Churn alert at **2.0 %/month**. At 35 members that is 0.7 people — the alert exists to be noticed at
35, not at 350.

---

## 9. What this document replaced (do not re-import)

| Stale claim | Where it came from | The truth |
|---|---|---|
| "Vault Circle $19/mo" | old §5 | **Circle $44** |
| "Shadow Council $79/mo" | old §5 | **Team $62** (3 seats); Max was dropped |
| "Skool $99/mo backup" | old §5 | not in the stack; Whop holds product + community + payments |
| "ManyChat 8 channels, VAULT keyword" | old §5 | **Chatfuel**, three surfaces, one private reply per comment |
| "6 posts a day ET" | old §5 | five surfaces, staggered EAT slots, longform 3×/week |
| "IG + TikTok + YT + X" | old §2 | **YouTube, TikTok, Instagram, Facebook** — X removed |
| "Gmail drafts, approve 6 in the morning" | old §5 | Pro/Team's **first three** publishes only, 2-hour SLA |
| "Telegram + Signal for 1:1s" | old §5 | Telegram is the operator alert channel, not a member surface |

---

## 10. Go-live checklist for the community

1. Whop: three products — **Circle $44, Pro $53, Team $62** — each with a plan id (`plan_…`).
2. `WHOP_PRODUCT_CIRCLE_ID` / `_PRO_ID` / `_TEAM_ID` set; `WHOP_PLAN_*_ID` set from **Checkout Links →
   Details** (a `prod_…` id 404s at `/checkout/`).
3. `WHOP_COMMUNITY_URL` points at the community itself.
4. The five spaces created, `start-here` written, `renders` empty and waiting.
5. One post, one video, one buyer — end to end — before the second post is scheduled.
6. `GET /money` shows the member count and says `exact: true`.

**Until item 5 is done, this is a plan, not a community.** The build is finished; the proof is not.
