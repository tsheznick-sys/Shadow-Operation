# JARVIS 14-DAY + GREEN/AMBER + DUAL CONVERSION + SHADOW SUPERFAST

**Branch:** `arena/6c47af3d-shadow-operation` **`pr_open`** | **Date:** 2026-10-30 Nairobi EAT | **Locks from Qs:** `strict_green` + `chatfuel_manychat` + `Comments→DM→Whop priority (both systems)` + `All above aside G4` + `leak_expand` | **ZIP:** `jarvis_self_3man_bundle.zip` 4.4M → 10 WFs (WF5 split)

> Fixes Jarvis errors: old 1%+25 only → now 50:1 + 3-5% ER strict, X discovery excluded, G4 removed from improve loop, DMs vs 14-day now two systems, shadow pattern leak→expand wired to Whop superfast.

---

## 1) GREEN vs AMBER — content runs from here

Calculated daily via Social Blade + HypeAuditor/NotJustAnalytics/Picuki (your lock) + `buyer_pool_x3` + `ratio` + `ER` in `n8n WF1 Mon 08:00 Grok`:

- **GREEN** = `ratio <50:1` **AND** `ER 5%+` (ideal 5%+) — **Comments→DM→Whop→Purchase superfast fast-close, NO 14-day**
- **AMBER** = `ratio 50-70:1` **AND** `ER 3-5%` — **trigger 14-day sequence nurture** before Whop (ChatFuel IG&TikTok + ManyChat YT)
- **RED** = `ratio >70` **OR** `ER <3%` → **HOLD** — no DM, improve loop (see §3, no G4)

Both GREEN/AMBER count as active for retention (pod streak), but Whop creation differs (see §4).

## 2) Content → Chat Fuel DMs → then the two systems

**Runs from content:** `WF2 daily 02:00 Claude 6 scripts/domain 4.5k words → TubeGen 30m / Wan T4 free p01_32s_9x16.mp4 queue38 → WF3 OpusClip 5-8 shorts virality 9.2 reframe speaker centered + Higgsfield LUT $0.08 auto per-clip finish → WF4 SEO Claude → Buffer 6/day serious IG/TikTok/YT + X 1-2/day discovery filler`

**Post-publish check (WF5 09:00 EAT daily):**
```js
// n8n WF5 demand_gate node — IG/TikTok/YT only, X views ignored
views = ig_views + tiktok_views + yt_views
replies = ig_comments + tiktok_comments + yt_comments
ratio = likes / comments
er = (likes + comments) / followers *100
buyer_pool_x3 = avg_comments*3

if (ratio<50 && er>=5) -> GREEN -> goto §2A fast-close
else if (ratio<=70 && er>=3 && er<5) -> AMBER -> goto §2B 14-day nurture
else -> RED -> goto §3 improve loop
```

### 2A) DMs system = Fast-close (GREEN superfast)

- **Prioritize:** `Comments → DM → Whop → Purchase` (your custom: both to advantage)
- **Trigger:** Any comment on YT/IG/TikTok post → `WF5 manychat_gmail_trigger`
  - IG & TikTok → **ChatFuel** auto-DM `VAULT` keyword within 2 min: “Proof = your demand test 1%+25. Want 1-page teardown? Reply YES → `FINAL TERMS` 10 pts”
  - YT → **ManyChat YT** auto-DM ( ChatFuel cannot YT) same copy → fallback Gmail DM if both fail
- **Conversion:** Shadow hard-close pattern **3-email cap → FINAL TERMS one-pager 10 points, sign only after PASS** — DMs send Whop $27/$79 link **same day** (no free audit before YES per Hard Rule 2, build_audit_now Anu exception only). No 14-day.
- **Whop:** Auto-create `Whop Vault $28+$17+$35+$89+$44+$53+$62/mo` on PASS `replies>=max(25, ceil(views*0.01))` via `WHOP_API_KEY` → ManyChat 8ch push → Gmail `Sir PASS`

### 2B) 14-day system = Nurture (AMBER)

- **Prioritize:** Same `Comments → DM → 14-day → Whop → Purchase` — but DM is entry to sequence, not immediate Whop
- **Sequence (WF5A new 14-day nurture WF — auto):**
  - **Day 1-3 Value Proof:** Day1 auto-DM via ChatFuel IG/TikTok + ManyChat YT: “Your niche is 50-70 ratio = AMBER, 3-5% ER = proof of niche but not viral yet. Here’s 1 script that moves it to <50+5%…” + 1 value clip from `WF3` proof queue
  - **Day 4-7 DM scripts+teardown:** Day4 teardown viral `quietwolfzz` 514K case + Day6 DM script `tiny.party.hat` style (see `gas/GMAIL_G4_SEND_200_VERIFIED.gs`) — no FINAL TERMS yet
  - **Day 8-14 DM close + Whop $19/mo Circle:** Day8 soft Whop $27 Starter link → Day11 Whop $79 Pro + 8ch bump → Day14 `Pause $5 vs Cancel delete in 7d` urgency → if reply YES any day → exit sequence → goto 2A fast-close FINAL TERMS
- **Both apply:** If AMBER buyer replies YES on Day2, sequence stops and fast-close takes over — best of both.

## 3) Improve content to reach GREEN required conversions (All above aside G4)

**Errors fixed:** Old loop included `Content G4 queue38 tweaks` — you locked **exclude G4**. Now 3 loops run, no G4:

1. **A/B Hook/CTA via Higgsfield/OpusClip virality 9.2** — `tools/production_pipeline.py --in 8s --out 32s --cr edit` 8s Hook-Value-CTA variants → OpusClip ranks 9.2 → keep winner, drop loser
2. **Daily ER check + weekly re-rank Grok 1000 niches** — Social Blade + HypeAuditor alternatives scrape daily (you lock) → `buyer_pool_x3 ER ratio` live → Grok `xAI` 1000 faceless Wolf/Psych/Marketing history/Wolf/Consumerism niche re-rank weekly via `WF1` → auto top5
3. **Whop ladder + DM script A/B** — `data/product_blueprint.md` Starter $27 / Pro $79 / Circle $19/mo ladder A/B + `gas` DM script variants A/B via `POST /api/cron/daily-brief 05:45` → conversion lift funds content

**Not included:** `G4 queue38` — Content Guy still approves initial queue38 once, but **improve loop does not touch G4** per your `All the above aside for the G4`.

## 4) Shadow superfast pattern → Whop part

**You chose `leak_expand` (Daily leak finder → weekly expand) — fastest without breaking Hard Rules:**

- **Daily 05:45 leak finder:** `jarvis-app/app/api/cron/daily-brief` → loads `reference/operator_context.md` + `templates/creator_tracker.csv` → Grok+Claude names single biggest leak (e.g., `DM→Whop dropoff 12% — FINAL TERMS not sent`) → Telegram/Signal all 3 bros `Sir, leak: ...`
- **Weekly expand:** `WF1 Mon 08:00` re-rank → if GREEN pool expands (e.g., Psych Hack ratio 48→42, ER 4.8→5.2) → auto-expand to 5 pages template via `tools/big_run_1000.py` + `n8n WF9` pods ≤5 Red 28 vs Blue 22
- **Whop superfast:** On GREEN PASS, `WF5` Whop Create Product Vault ladder auto → `/admin` Big Red Button optional → grant `ADMIN_EMAIL=scott.abuya@gmail.com` + `SOCIAL_MASTER_EMAIL=info.wolf@gmail.com` → revenue → `Neon revenue_log` → `WF8 alias Wise batch $0.43%` `Jarvis $108 + community $500` via `SOCIAL approve` → `/retention` card

**Speed:** Comments (0-2h) → DM fast-close (same day if GREEN) or 14-day nurture (if AMBER) → Whop → Purchase all via ChatFuel IG&TikTok + ManyChat YT, X ignored.

## 5) What Claude Code must build next (prompt in `docs/CLAUDE_MASTER_PROMPT_JARVIS.md`)

- Read `lib/jarvis.ts` new `JARVIS_SYSTEM` GREEN/AMBER + dual conversion + leak→expand (already patched)
- Install `n8n/n8n_workflows_self_3man.json` now 10 WFs (WF5 split into WF5-GREEN-fast + WF5A-AMBER-14day)
- Add `jarvis-app/app/api/cron/daily-brief` leak→expand + `scripts/grok_claude_agent_session.py` session import-memory mandatory
- Verify `WHOP_API_KEY` + `CHATFUEL_TOKEN` IG&TK only + `MANYCHAT_API_KEY` YT only + `BUFFER_TOKEN` 6/day serious + X 1-2/day discovery

## 6) Costs unchanged

`docs/ALL_TOOLS_PAYWALLS_TOTAL_UPDATED.md` — $56 MVP → $189 5 pages pocket Year1 $2,268 + ~$60 PSTN = $2,328 until Net $1K/mo 3 bros then 30/20/50 → 100K gross. 14-day sequence = no extra SaaS (uses ChatFuel already $15 + ManyChat $15).

