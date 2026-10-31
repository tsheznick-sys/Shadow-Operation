# UPGRADE LITE→PRO + SCALE $189 — Wired Choice Locked

**Lock:** `upgrade_lite_to_pro` + `scale_189` — 2026-10-30 `arena/6c47af3d-shadow-operation` `pr_open`

### What you chose

- **Focus:** Push Lite ($9/mo Better) → Pro ($29/mo Best) upgrades before spinning all 6 pods. Fastest $ to $19/mo continuity lift.
- **Stack:** Full stack scale **$189/mo for 5 pages** (not free rails $36, not hybrid $29): TubeGen $29 auto LUT per-clip + OpusClip $15 virality + Higgsfield auto $29 + Buffer Team $60 + brain $36 = $189 — covered by 7 vault sales $189.

### Why Higgsfield alone fails — gaps doc says

- Higgsfield = finish only: LUT teal/purple + @premiereprotutos logo/watermark per clip.
- Needs Engine Wan/TubeGen (30m source) + Clip OpusClip (5-8 shorts p01_32s_9x16.mp4 queue38) + Publish Buffer 6/day.
- Without scale, queue38 starves → Pod Red streak 28 drops → churn 3%+.

### Upgrade Lite→Pro wired (entitlement)

1. Lite member sees: Leaderboard `Pod Red Sarah 12k views` badge `Stack: Higgsfield Pro + OpusClip 9.2` + CTA `Upgrade to BEST $29/mo — same stack auto?` (in `/retention` + `/pods` + Jarvis DM).
2. Click → `POST /api/whop/upgrade {whopUserId, fromTier:'circle', toTier:'pro'}` → the route resolves both ids through `lib/tiers.ts` (`WHOP_PRODUCT_CIRCLE_ID` → `WHOP_PRODUCT_PRO_ID`) and calls Whop `change_plan` (v1) with `WHOP_API_KEY`. Owner-only, rate-limited, audited.
3. Webhook `membership_changed` → n8n WF8 `pro_ascension` branch: `UPDATE user_vault tier=pro` → `INSERT retention_events action=upgrade_lite_to_pro` → Telegram `Sir Lite→Pro $29 ascension @sarah pod Red`.
4. `lib/entitlement.ts` now returns `tier=pro` → `tierLimits() = {runs:9999, domains:5, clipsPerDay:6}` vs Lite `{runs:30, domains:1, clipsPerDay:3}`.

### Scale $189 activation steps

1. Vercel env: Set `TUBEGEN_API_KEY` + `OPUSCLIP_API_KEY` + `HIGGSFIELD_API_KEY` + `BUFFER_TOKEN` (Team).
2. n8n WF2 fallback disabled: TubeGen primary, Wan T4 only if `TUBEGEN_API_KEY` missing (already wired).
3. Cost gate: `n8n/n8n_workflows_self_3man.json` `total_cost` line shows $189 scale vs $56 MVP — 7 sales auto-cover.

### Gaps checked before upgrade push

- `/api/entitlement?whop_user_id=xxx` wired (already in ZIP 4.1M)
- `/api/pods` pod accountability max 5 wired (already in ZIP)
- Next gap: `membership_changed` webhook → add in Whop Dashboard → Webhooks → `https://your-n8n.app/webhook/whop-upgrade`

### Incentive wiring Good-Better-Best

- GOOD $27: Pillow+Wan manual — no auto
- BETTER $79: TubeGen+OpusClip presets — Lite $9 unlocks (3 clips/day)
- BEST $79+$29: Full scale auto Higgsfield + 5 domains — Pro $29 unlocks (6 clips/day) — target for upgrade push

### Metrics to watch for 1-2% churn

- `upgrade_rate` target 18% Lite→Pro within 30d
- `save_rate` Pause $5 vs cancel 44% (already wired)
- `pod_streak` Pod Red 28 vs Blue 22 battle keeps even if upgrade pending