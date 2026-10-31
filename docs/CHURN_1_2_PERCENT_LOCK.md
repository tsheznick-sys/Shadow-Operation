# CHURN LOCK: 1-2% — SYSTEM + AGENT + PROOF LOOP

**Goal:** Keep Whop churn at 1-2% (vs 12% standard, vs 4-5% with system alone). Wired into ZIP `jarvis_self_3man_bundle.zip` with entitlement gate.

**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` | **Date:** 2026-10-30 Nairobi EAT | **Stack:** `jarvis-app` + `n8n 9WFs` + `Whop` + `Wise` + `Buffer Team` + `Chatfuel/ManyChat`

---

## Why 12% → 4-5% → 1-2%

- **12% churn:** No system. Pay $26, watch 1 video, stuck, ghost.
- **4-5% churn:** System (teach how to make money) — fixes `I don't know what to post`
- **1-2% churn:** System + Agent (does it with them) + Proof Loop (proves others win weekly) — fixes `I didn't execute` + `I want refund` + `I outgrew you`

> Churn = `didn't get result in 30 days`. 1-2% means *every* member gets micro-win in 7 days and money win in 30 days.

---

## 1. SYSTEM — You teach exact money system (but keep 10% edge)

**Teach 90%, keep 10% in Agent:**

| Module | What you give (Whop Course $35+$17) | What you KEEP in paid Agent |
|---|---|---|
| **M1: Niche to $100** | 1000 faceless niches CSV, 8-Gate filter (buyer_pool_x3, ratio<50, ER 3%+) | Grok live X trending + auto-rank Top 5 |
| **M2: 30m → 8 clips** | TubeGen prompt pack, OpusClip virality checklist | Auto TubeGen 30m + OpusClip + Higgsfield per-clip (WF2-3) |
| **M3: Post without opening platforms** | Buffer Team SOP, hashtag banks | Auto Buffer 6/day + SEO by Claude Max (WF4) |
| **M4: Close $35** | DM scripts, 8ch ManyChat funnel | ManyChat auto + Whop ladder $28+$17+$35+$89+$44+$26 |
| **M5: Scale to 5 pages** | 5-domain template | WF8 auto-duplicates when PASS |

**Delivery:** Whop `Courses` app (videos 6-8 min) + Notion SOP + templates. Each lesson ends with `→ Open Jarvis Agent and type: "Make my Day 1 queue"` — drives to Agent.

**Anti-clone guard:** System teaches *how*, Agent does *done-for-you*. They stay for execution, not info.

---

## 2. AGENT — Paid fee to use, navigates where stuck (stickiness = anti-churn)

**Location:** `jarvis-app/app/jarvis` embedded in Whop via Whop Embed + `whop.com/apps` OAuth. Entitlement gate: `jarvis-app/lib/entitlement.ts` checks `WHOP_API_KEY` → `has_access` → unlocks.

**Pricing tiers (Whop one checkout):**

- `Agent Lite $17/mo add-on` — 30 runs/mo, 1 domain, 3 clips/day — for Circle $26 members
- `Agent Pro $44/mo add-on` — unlimited, 5 domains, 6/day Buffer auto — unlocks when they hit $100
- `Agent Team $62/mo` — for your own 3-man only (not community)

**Where it keeps engagement:**

1. **Stuck detector:** `lib/jarvis.ts` now includes `STUCK_TRIGGERS`: `if no post 48h → DM "Sir, queue empty"`, `if video 3 FAILs 1%+25 → offer reframe`, `if DM not replied 24h → nudge`
2. **Navigation:** Agent knows exact pipeline step: `SCOUT→VET→OUTREACH→REPLY→DEMAND→WHOP` and `TubeGen→OpusClip→Higgsfield→Buffer→Analytics`. Answers `where am I stuck?` with button.
3. **Vault lock-in:** Every chat saves to `Neon pg: user_vault` + `R2`. Leaving = losing library. UI shows `47 scripts saved • Pause keeps them ($5/mo) vs Cancel deletes in 7 days`
4. **Daily streak:** `Day 4 streak • 3/6 posts today` — push via Telegram + Chatfuel DM.

**Entitlement wiring (WIRED IN ZIP):** `lib/entitlement.ts` → `GET /api/entitlement?whop_user_id=xxx` → calls `https://api.whop.com/api/v1/memberships?user_id=xxx&product_id=prod_lite` with `WHOP_API_KEY`. If `active` → grants `lite/pro`, else mocks. See `jarvis-app/lib/entitlement.ts` + `jarvis-app/app/jarvis/page.tsx` gate.

**Cost to you:** $0 extra — same Claude $20 + Grok $16 + n8n $20 that powers 5 pages already runs their Agent (metered via Neon).

---

## 3. PROOF LOOP — weekly momentum (people stay for momentum, not just info)

| Loop | Cadence | Owner | n8n WF |
|---|---|---|---|
| **WWS — Weekly Wins Show** | Sun 09:00 EAT | Admin | WF9 extracts wins from Whop API + Buffer → Claude summary → Whop Announcements |
| **Clip of Proof** | Tue + Fri | Social Manager | WF3 Higgsfield auto-clips student win → Buffer queue |
| **Leaderboard** | Live dashboard `/social` + `/admin` | WF6 daily 05:45 | `Top 3 views: @wolf_ke 12k` |
| **Office Hour Teardown** | Thu 19:00 EAT | Content Guy G4 | Zoom → Whop Event → Vesper transcribes |
| **DM proof nudge** | Trigger: 3 days inactive | WF7 Vesper via Jive | `Hey love it's Vesper — Sarah just hit 10k` |

---

## 7 Extra Saves to reach 1-2%

1. **Day 0-7 Activation Sprint:** Must publish 1 clip in 48h. Agent DM every 12h until done.
2. **Save Offer on Cancel:** Whop `membership_cancelled` webhook → n8n WF8 → `Pause $8/mo` vs `35% off → $17` vs `Downgrade $17 Lite` — saves 40%.
3. **Pause not Cancel:** Whop `pause_membership` API — show as first option.
4. **Payment Recovery:** Failed card → Chatfuel DM + SMS via Africa's Talking + 3 retries.
5. **Streak freeze:** Miss 1 day? Agent offers `freeze $0`
6. **Pod accountability:** Auto-assign 5-person pod on join via ManyChat.
7. **Ascension on win:** Hit $100/mo → Agent unlocks Pro upsell.

## Metrics

- **Churn %:** `(cancelled_last30 / active_start)*100` — target 1.2%
- **Save rate:** `offers_accepted / cancel_clicks` — target 45%
- **Activation:** `% published in 7 days` — target 85%
- **Agent DAU:** `% used Agent last 7d` — target 60%
- **Proof views:** `WWS replay views` — target 40%

**Alert:** IF churn >2.5% 7d rolling → WF7 Jive broadcast all 3.

## Teach vs Keep

- **Teach:** Niches, scripts, captions, hashtags, DM close
- **Keep:** Grok live rank, TubeGen 30m auto, OpusClip virality, Higgsfield LUT, Buffer 6/day, save-offer engine

> Show 90% + rent 10% via Agent $9-29 → retainers at 1-2%.
