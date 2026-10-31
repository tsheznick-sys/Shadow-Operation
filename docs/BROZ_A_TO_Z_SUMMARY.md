# SHADOW OPERATION — A TO Z SUMMARY FOR THE BROZ

**Branch `arena/6c47af3d-shadow-operation` `pr_open` | 2026-10-31 EAT | ZIP `jarvis_self_3man_bundle.zip` 1.7M / 123 files | Drive `1tHjh66Z...` | Live `https://github.com/tsheznick-sys/Shadow-Operation`**

> **One sentence:** Jarvis does everything while you sleep — you only swipe SEND, sign, and collect — from finding niches to posting 6/day to getting paid on Whop.

**The whole system, at a glance:** `docs/n8n_workflow_map.png` (14 workflows, 6 lanes) · node-level detail `docs/N8N_WORKFLOW_DIAGRAM_FULL.md` · raw image `https://github.com/tsheznick-sys/Shadow-Operation/raw/arena/6c47af3d-shadow-operation/docs/n8n_workflow_map.png`

---

## A — The engine chain (what actually makes the videos)

**Finance is gone as a niche (2026-10-31).** YouTube's July 2026 clarification names *"AI personas giving advice on health, finance, legal"* as a permanent-removal risk. **Page 1 is now Consumerism** — business-adjacent RPM without being advice. No finance, health, legal or medical page, ever.

**Dual output.** Every script is cut twice: **RAW → Whop private community** (no edits, includes the mistakes — no platform to demonetise it) and **EDITED → YouTube/TikTok/IG/FB/X** (must pass the policy gate, or it does not ship). The raw cut exists nowhere public — that is the reason to pay.

**Two ledgers.** One for the community (views, ER, comments, revenue opt-in) and one for the team (plus policy strikes, demonetisation risk, raw-vs-edited gap, margin). The team needs the wound; the prospect does not.

**Agent tiers (Max dropped 2026-10-31).** Free 0 · Circle $44 (40 runs, scheduled through our publisher) · Pro $53 (80 runs, **direct publishing to their own accounts + a 2-hour review SLA** until auto-publish is earned). $71 Max was killed because it sat **above the $62 Team tier** — Team is seats, not a bigger agent. The rule: **the more access we take on, the more we must be paid to carry it.**

**Four panel screens, all built:** Home (quota, queue, next action) · Create (7 steps, 6 gates) · Performance (six metrics ordered by how badly they hurt, views last) · Vault (raw cuts, scripts, policy log, pods).

**Team $62 = everything, for three seats.** It inherits every Pro entitlement per seat, plus seat management, a shared hook bank, the team ledger and one invoice. The uncomfortable arithmetic is recorded rather than hidden: **Pro is $53 for one person, Team is $62 for three.** Guard: three seats claimed and used within 30 days, or it reverts to Circle — a team of one is not a team, and a decorative $53 tier is a mess we would have built ourselves.

**Free opens in waves of 25.** Wave 1 is challenge finishers only — proven intent, zero acquisition cost. Each wave is measured (blocked-asset rate ≤ 10%, support load, watermark CTR) before the next opens. If a wave produces more blocked assets than published clips, the next wave does not open.

**We hold a key to their channel, so we write the law down.** AES-256-GCM, key in env only. We ask for **upload and our own analytics — nothing else**, and we never request subscriber lists, comment management, delete access or anything financial even when offered. The member sees exactly what we hold. Revoked within an hour of churn, instantly on request, deleted within 24 hours. **A token in a log is a breach, not a bug.**

**The App Store waits for GREEN.** Internal only until page 1 posts a GREEN week plus three clean publish cycles. Then it is listed as a second revenue line — and marketed.

**Stickman Agent is the product.** Members do not buy a library, they buy a staff member: script, render, cut, schedule, audit. Free tier gets **20 runs per 5-hour window** (300/month cap) and **our content to clip**, with **our watermark on every export** — free users distribute our brand at their cost. Paid tiers are clean. Supporters may skip the funnel and join the community directly at $44; the discount is **0%**, only the path is shorter. Nobody publishes freely until rules, policy and disclosure pass; the first 3 publishes get G4 review, then auto-publish is earned.

**`stickman_all` on every page.** `kaomei/stickman-video-director` (git clone, **free**) renders the **30-minute longform AND the Shorts** — one master prompt + one reference frame locks the character across both.

```
WF1 daily 08:00 whole-internet scan (X / Reddit / YouTube / Trends / rivals)
   → Claude action plan per niche: angle · hook · CTA · day · proof
WF2 daily 02:00  → 6 scripts/domain (4,500 words = 30 min) → stickman render 30m + Shorts → queue70
WF3 webhook      → OpusClip 6 clips @ virality 9.2 → Higgsfield polish $0.08/clip on LONG **and** SHORTS + character lock
WF4 06:00 G4     → the ONLY publish gate → Buffer
WF4 buffer       → 6 Shorts/day serious + longform Mon/Wed/Fri + X 1–2 discovery
```

- **TubeGen $29 = fallback only.** Missing → Wan T4 free (`WAN_T4_URL`) → if Higgsfield alone, stop (it polishes, it cannot source).
- **Alternatives, env switch `ENGINE_PROVIDER`:** `pictory $25` Marketing History · `fliki $21` Dark Psych voice · `invideo $17` Consumerism · `heygen $24` Wolf avatar · `frameloop $19` dailies.
- **LUT is gone.** Watermarks (`@premiereprotutos`) gone. Never come back.

---

## B — The 2-channel YouTube split (new)

| Channel | What it carries | Cadence |
|---|---|---|
| `<Brand> Shorts` | every clip from WF3 | 6/day via Buffer |
| `<Brand>` longform | the 30-min renders | 3×/week, Mon/Wed/Fri |

**Every niche runs 5 channels:** 2 YouTube (Shorts + **Longform = page 1, the source**) + 1 TikTok + 1 IG + 1 FB. **X was removed 2026-10-31** — worst reach per hour for a faceless animation page. **One page live (Stickman) = 5 channels now; the full roster of 5 pages = 25 channels**, launched one at a time.

**Why:** Shorts channels earn subscriber velocity from volume; longform channels protect watch-time and RPM. One mixed channel splits the algorithm signal and depresses RPM. `YT_CHANNELS_PER_BRAND=2` (set `1` for legacy).

---

## C — How money is made

**Ladder `WHOP_API_KEY` — numerology_8:** `$28 first shot` (one-time, 14 days all-access) → `$17 Lite/mo` → `$35 GOOD` → `$89 BETTER` → `$53 Pro/mo` across 5 domains 6/day → `$44 Circle/mo` → `$62 Team`.

**Every price reduces to 8** — except the $28 first shot, which reduces to 1 (2+8=10→1, the Leader). Shortcut: an aligned price satisfies `n % 9 == 8`. Jarvis **consults the owner with live market data before changing any price** — it never reprices quietly. Full detail: `docs/PRICING_NUMEROLOGY.md`.

**Two ways in:**
- **GREEN** → `Comments → DM → Whop` **same day**, 3-email cap, then FINAL TERMS.
- **AMBER** → the **monthly 14-day Growth Operator sequence** per the playbook: Warm-Up 1–3 / Value 4–9 / Money 10–14 with **11 buy buttons**. Higgsfield renders the slides → Buffer. G4 approves once per cycle.

**Save offers:** pause **$8/mo** · downgrade to **Lite $17** — **one per 30 days**. No percentage discount: at $44 every clean rate lands off-pattern, and discounting a premium price tells the member the price was never real.

**Funding is self-funding:** $44 Circle · tools $165 paid first · prizes **$710** pro-rata · annual fund $133/mo. **Break-even 26 members · recommended 35** at full ARPU — and **35 / 44** at the industry-median ARPU of 71.2%. Circle moved $26 → $44 because price is the strongest known lever on churn (curated high-ticket rooms run 2–3%/mo; the $27–97 band runs 8–12%, and $26 sat in it while we targeted 2%). At 26: net `$1,070.94 − $165 − $710 = $195.94`. At 35: net `$1,441.65 − $165 − $710 − $133 = $433.65 reserve`. **Autopay is HELD** until you grant it.

---

## C2 — Trust: why free value is not the answer

**The trap:** every competitor already gives away more than you do — 100+ niches, 300+ prompts, the whole AI stack, or a 3–7 day trial. Free information signals nothing in 2026. Your own funnel proved it: **371 emails → 4 replies → 0 signed**, and the one prospect who got a **free 6-part audit** (Omar, 164K) asked for more free work instead of signing. Meanwhile Anu (222K) never asked for free anything — she asked **"can you show case studies?"**

**Trust is removed, not given.** Three engines, in this order:

| # | Engine | Kills the belief | Mechanic | Conversion |
|---|---|---|---|---|
| 1 | **OPEN LEDGER** (`/proof`) | "I don't believe your numbers" | Every real day of every channel published with a 24h lag — including failures. Nothing hand-typed. | Makes case studies unnecessary |
| 2 | **14-DAY CHALLENGE** | "I don't believe it works in MY niche" | WF10 run as a cohort of 53: one action/day, ends in *their own* 72h demand test | **8–15%** vs 0.3–0.8% for a direct pitch |
| 3 | **SKIN IN THE GAME** | "I don't believe I'll get my money's worth" | $28 First Shot guaranteed: no 50 comments in 72h → refund **and they keep the assets** | risk on us, not them |

**Doctrine:** *free at scale, never free at 1:1, paid and guaranteed at the door.*

- Free **broadcast** content (30 clips/day across 5 pages) = top of funnel. Keep it.
- Free **1:1** work (audits, decks, strategy calls) = the worst move available. Banned as **R2**.
- **Never** a keyword-comment gate — it inflates the one metric this system trusts.

Full argument + competitor table: `docs/TRUST_ENGINE.md`

---

## D — The 14 workflows

| WF | When | What |
|---|---|---|
| **WF1** | **daily 08:00** | Whole-internet scan + Claude action plan → top5 by buyer pool ×3, ratio <50, ER ≥5% |
| **WF2** | daily 02:00 | 6 scripts/domain → stickman 30m + Shorts on all pages → queue70; publishes M/W/F |
| **WF3** | webhook | OpusClip 6 @9.2 + Higgsfield polish on longform and shorts |
| **WF4** | 06:00 | **G4 → the only gate** → Buffer 6/day + longform M/W/F + X 1–2 discovery |
| **WF5** | 09:00 | GREEN same-day fast-close, Chatfuel IG/TK + ManyChat YT |
| **WF5A** | on AMBER | Enrolls the monthly 14-day sequence |
| **WF6** | 05:45 + daily | Leak finder → expand; alerts at 2.0% churn, 5-pod cap, weekly expand |
| **WF7** | webhook | Vessy on Vapi `+25418XXXX710`, 3 legs, Whisper → Neon; **calls any seat silent 10 min** |
| **WF8** | Whop webhook | Save offers, autopay prep (held), revenue ledger |
| **WF9** | Sun 09:00 / 05:45 | WWS, leaderboard, pods ≤5 |
| **WF10** | 1st of month 07:00 | 14-day sequence: slides → Higgsfield → Buffer → G4 once |
| **WF11** | 72h after test | **Demand test** (not followers): 3-slide Stories → 50+ PASS / 25–49 AMBER / <25 RED |
| **WF12** | weekly | Interview digest → sets each seat's authority |
| **WF13** | any outbound run | **Global pause check** — Big Red Button, owner-only resume |

Every threshold is `THRESHOLD_*` env-overridable. Pages `PAGES_COUNT=5`. Platforms via `PLATFORMS` + `BUFFER_*`.

---

## E — The three seats

| Seat | Receives | Cannot |
|---|---|---|
| **Content** | G4, queue, video pages | Money, DMs |
| **Social** | Inbound, DM threads, Big DMs | Money, publishing outside G4 |
| **Admin** | Whole pipeline, exceptions | Move money |

Three ways in: **Google OAuth** (only the 3 seeded emails work) · email/password + HMAC `shadow_session` 7 days · **6-digit 2FA on `/money` and `/admin`**. Each seat answers an **18-question interview**; under **60%** = no unsupervised authority. Lives at `/onboarding` → `/autonomy`.

**Logins:** admin master `scott.abuya@gmail.com` (Vercel/Neon/n8n/Claude/Grok/Whop/Wise/Linear/Telegram/Signal/Jive — never social) · social master `info.wolf@gmail.com` (all brand channels — never admin).

---

## F — Signals: how Jarvis reaches you

Every message is signed **as Vessy**, the agent — not as a system notice.

1. **Daily email to all 3 seats** — the shared record.
2. **In-app PWA update** — free, opens like an app.
3. **SMS when a seat is offline.**
4. **Voice call if no reply in 10 minutes.**

Full detail: `docs/SIGNALS_CONTROLS_RETENTION.md`.

---

## G — The Big Red Button

`/control` (owner only) — one switch stops **publishing, DMs, voice and money**.

- **Stops:** WF4 Buffer, WF5/WF5A, WF7 voice, WF8/WF10 autopay and sequences, WF11 unlocking.
- **Keeps running:** WF1 research (free, keeps the pool fresh), WF2/WF3 rendering (assets stack in R2), WF6/FW9/WF12, inbound Whop webhooks.
- **Rules:** only the owner resumes · nothing auto-resumes · every pause and resume is written to `audit_log` with actor, time and reason · works from the phone via "press 1" on the Jive call (signed owner token).

Implementation: `jarvis-app/lib/control.ts` (`mayActOutbound()` is called *before* any outbound workflow acts), `/api/control`, `/control`, and the `/admin` button.

---

## H — Retention & offline

| Asset | Kept |
|---|---|
| Longform masters | **30 days**, then deleted (regenerable from script + character lock) |
| Published assets | **forever** |
| Transcripts / call recordings | 12 months |
| Neon index rows | forever |

Storage: **R2 canonical** (content), **Neon** index, **Drive** deliverables and docs only. The 30-day rule keeps R2 on the $5 tier.

**Offline = full autonomy continues** + a daily SMS feedback line to all three seats.

---

## I — Autonomy: you asked "what runs alone?"

**Overall 80%**, money excluded from the average.

| Lane | % | Lane | % |
|---|---|---|---|
| Research | 95 | Publish | 70 |
| Clip + polish | 90 | Voice | 60 |
| Retention saves | 90 | **Money** | **40 (capped — prepares, you approve)** |
| Sequence | 85 | DMs | 75 |
| Render | 80 | | |

Floors are enforced in `lib/autonomy.ts`, so a 2am edit cannot hand away more than you agreed. Three lanes earn their way up: publish +15 after 30 clean G4s · DMs +10 after a 100% social interview · money +20 after 90 clean days. Full table: `docs/AUTONOMY_MATRIX.md`, live at `/autonomy`.

---

## J — Costs

| Plan | Monthly | Notes |
|---|---|---|
| **MVP 1 brand** | **$61** | 3 sales cover it |
| **SCALE 5 brands** | **~$165–175** | adds R2 $5 + SMS ~$10; 7 sales cover it |

n8n Cloud $20 · Buffer Team $60 · Claude · OpusClip · Higgsfield $0.08/clip · stickman $0 · Wan T4 $0. Pay monthly until $1K net, then prepay annually for the discount.

---

## K — Go-live (today)

**One page at a time.** Page 1 (Stickman) runs alone until it posts a GREEN week; each later page needs a 3-of-3 board vote. Five channels compounding beats twenty-five guessing.

1. Neon → run `jarvis-app/scripts/migrate.sql` (16 tables)
2. n8n → import `n8n/n8n_workflows_self_3man.json` (**14 workflows**) + `config/n8n_workflow_variables.json`
3. Vercel → env matrix + crons + domain
4. All three seats sign in → `/onboarding` (18 questions each) → owner reviews `/autonomy` and `/control`
5. Import `data/creator_db_faceless_1000_FINAL.csv`
6. Start WF1 → WF2 → WF3 → WF4 for **every page at once**, 2 YT channels per brand
7. First 72 hours: watch the G4 queue, `/autonomy`, and the first demand test

**First-week target:** 5 pages live · **30 clips out** · **first 3 Circle members.**

**Phase 2:** once the Shadow Operation role converts the required clients, Jarvis gets the full backend — run the pipeline end to end, monetise the pages, make the sales itself.

---

## L — Adaptable, no code

`config/adaptable.json` (or Vercel env): `PAGES_COUNT` `NICHES_POOL` `THRESHOLD_RATIO_GREEN` `THRESHOLD_ER_GREEN` `ENGINE_PROVIDER` `YT_CHANNELS_PER_BRAND` `BUFFER_*` `WHOP_LADDER_PRICES` `LONGFORM_PUBLISH_DAYS` `RETENTION_MASTERS_DAYS` `CALLBACK_MINUTES` `AUTONOMY_*` `TEAM_*`. Redeploy — never edit code. Guide: `docs/FULLY_ADAPTABLE_GUIDE.md`.

---

## M — Verify it all still builds

```
cd jarvis-app && npm install && npx tsc --noEmit && npm run build   # 31 pages, 17 routes
python3 -c "import json;json.load(open('../n8n/n8n_workflows_self_3man.json'))"   # 14 WFs
python3 scripts/make_workflow_map.py                                # poster
python3 scripts/make_bundle.py                                      # zip
```

---

*Everything hard-coded before is now env. One ZIP rule: main in repo `jarvis_self_3man_bundle.zip` → Drive `NUMINOUS_WHOP_DEPLOY` (`17KpzZCmxxz13vJfkKv96EZZ5e7KTft8G`).*
