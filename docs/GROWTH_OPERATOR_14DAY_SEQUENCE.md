# THE 14-DAY SEQUENCE — Growth Operator Book, Wired into Jarvis

**Source of truth (Drive):** `Shadow_Operation_Playbook.pdf` — `1c7H10-d4QgjomCoUNhox3pEE00mqsP0V`
**Origin:** Consulting.com Growth Marketer / Shadow Operator training — 4-Step Method, Monetisation Gameplan, 14-day launch formula.
**Rule from the owner (2026-10-31):** this book is a **main guide** — every sequence Jarvis builds follows it, not ad-hoc copy.

---

## 1. What the book actually specifies

| Element | Book rule | Where it lives in Jarvis |
|---|---|---|
| 4-Step Method | **Find → Approach → Develop → Monetise** | WF1 (Find) → WF5 outreach (Approach) → WF5A/sequence (Develop) → Whop (Monetise) |
| Trusted metric | **Comments only.** Followers, ER, likes are inflated | `buyer_pool_x3 = avg_comments × 3` — every projection anchors here |
| Buyer pool | Avg comments × 3, clean comments only (keyword-reply funnels excluded) | `THRESHOLD_BUYER_POOL_MIN=3000`, G4 keyword-funnel exclusion |
| ER floor | 2.0% classic ER floor, 10% auto-exclude as implausible | `THRESHOLD_ER_AMBER_MIN=3`, `THRESHOLD_ER_GREEN=5` |
| Like:comment ratio | Under 50:1 | `THRESHOLD_RATIO_GREEN=50` |
| Launch shape | **14-day Stories sequence, three phases** | `content.monthly_sequence` → WF10 |
| Phase 1 | **Warm-Up, days 1–3** — attention and trust, **no selling** | slides 1–3 |
| Phase 2 | **Value Delivery, days 4–9** — teach and prove the method, seed the problem | slides 4–9 |
| Phase 3 | **Money Days, days 10–14** — open the offer, answer objections, close | slides 10–14 |
| Buy buttons | **11 psychological buy buttons** built into the copy | prompt block §4 below |
| Demand test | 3-slide carousel in **Stories only**, read after **72 hours** | `demand_test` gate |
| Demand bar | **50+ comments = GREEN**, 25–49 = AMBER, <25 = RED (hold) | `THRESHOLD_DEMAND_GREEN=50`, `THRESHOLD_DEMAND_AMBER=25` |
| Known failures | wrong links, skipped steps, broken order, cross-platform feed tests, no warm-up | pre-send checklist §5 |

**Book lessons that became hard rules here:** built-before-written-yes gets abandoned (commitment first) · qualified ≠ buildable (watcher vs buyer-intent) · keyword-automation comments inflate the pool · one-time launch revenue is not MRR.

---

## 2. What changed on 2026-10-31 (owner answers)

1. **Cadence:** the 14-day sequence runs **monthly**, not once per launch.
2. **Assets:** **Higgsfield generates the slides** for each cycle, in that operation's marketing style.
3. **Pipeline:** slides → **Buffer** → upload to platforms.
4. **Platform gate:** **TikTok and IG start only after 1,000 followers on both**; the team gets triggered the moment both numbers land.
5. **Longform cadence:** render daily 02:00, **publish 3×/week (Mon/Wed/Fri)** per page — bank the rest as backlog.
6. **Storage:** content lives **off Drive** — R2 is canonical, Drive keeps deliverables only. Neon holds the index (row per asset) because Neon is cheaper than object storage for metadata.

---

## 3. Monthly cycle — WF10 flow

```
1st of month 07:00 EAT
   │
   ├─ Claude reads playbook phases + last month's top 3 posts + Whop ladder
   ├─ Builds 14 days × slides: day, phase, slide_count, hook, body, CTA, link_sticker
   ├─ Higgsfield renders each slide in the page's operation style
   │     (stickman character lock · 1080×1350 feed · 1080×1920 story)
   ├─ R2 upload (canonical) → Neon INSERT sequence_assets(cycle, day, phase, url, prompt_hash)
   ├─ G4 review in /content (one approve per cycle, not per slide)
   ├─ Buffer schedule: IG carousel + TikTok (only if follower gate open)
   └─ Telegram all 3: "Cycle 2026-11 built — 14 days, 42 slides, approve in /content"
```

**Follower gate (WF11, runs daily 06:30):**

```
read IG followers + TikTok followers
  if IG >= 1000 AND TikTok >= 1000:
      unlock → Buffer publishes cycle → Telegram/Signal/Gmail all 3 "1K reached — sequence live"
  else:
      hold → log headroom → continue YouTube/X/Shorts only
```

**If only one platform clears 1K:** that platform starts alone, the other stays queued — never block both on the slower one.

---

## 4. Slide prompt block (what Higgsfield receives)

> **Role:** direct-response operator building a 14-day micro-launch for a faceless finance/psychology YouTube brand.
> **Visual style:** stickman character lock — one master prompt, one reference frame, identical character across every slide. Bold single-line headline, 3–6 word subhead, high contrast, no stock photos, no watermark, no teal/purple LUT.
> **Phase discipline:**
> **Days 1–3 Warm-Up** — no price, no link, no offer. Attention and trust only.
> **Days 4–9 Value Delivery** — teach one concrete method per day, prove it with a number or a before/after, seed the problem the product solves. Still no hard sell.
> **Days 10–14 Money Days** — open the offer, name the price, answer one objection per day, exact link sticker, close.
> **11 buy buttons to distribute across days 10–14:** reciprocity · commitment · social proof · authority · scarcity · urgency · specificity · loss aversion · identity · ease-of-use · risk reversal.
> **Output per slide:** headline (≤7 words) · subhead (≤12 words) · visual direction · sticker/caption text · CTA for Money Days only.
> **Hard constraints:** never invent testimonials, never promise income, no "guaranteed" claims, no keyword-comment CTA funnels (they inflate the buyer pool and the book excludes them).

---

## 5. Pre-send checklist (from the book's known failures)

- [ ] Right link on the right day — no copy-paste drift from last cycle
- [ ] Story-only placement for the demand test, never a feed post
- [ ] Warm-Up present before any offer — a skipped warm-up invalidates the read
- [ ] Phase order intact: 1-3 → 4-9 → 10-14
- [ ] Day numbers match the calendar (2nd of month = Day 1)
- [ ] Follower gate checked — IG and TikTok both ≥1,000 before Buffer publishes
- [ ] G4 approved once for the whole cycle
- [ ] Objection coverage: at least one slide per common objection (price, time, "will this work for me")

---

## 6. Where this is enforced

| Layer | File | What it holds |
|---|---|---|
| Config | `config/adaptable.json` → `content.monthly_sequence`, `content.storage`, `conversion.demand_test` | cadence, phases, thresholds, storage policy |
| n8n | `n8n/n8n_workflows_self_3man.json` → **WF10 monthly sequence**, **WF11 follower gate** | the actual automation |
| App | `jarvis-app/app/content/page.tsx`, `/social` | cycle review + follower headroom |
| Env | `SEQUENCE_DAY_1=2`, `FOLLOWER_GATE_IG=1000`, `FOLLOWER_GATE_TIKTOK=1000`, `R2_*` | overridable, no code change |
| Poster | `docs/n8n_workflow_map.png` | WS5A box now reads "monthly 14-day slides" |

---

*Wired 2026-10-31 · branch `arena/6c47af3d-shadow-operation` · source book read from Drive copy `1c7H10-d4QgjomCoUNhox3pEE00mqsP0V`.*
