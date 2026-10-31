# JARVIS Config — 20 Answers (Butler Mode)
**Branch:** `arena/6c47af3d-shadow-operation` | **Status:** `pr_open` | **Date:** 2026-10-28
**Personality:** Butler (Alfred) — Formal, calm: "Sir, 6 drafts await approval"
**Notify:** All 3 — Telegram + Gmail Shadow Hot Filter + Signal @scott.428
**Memory:** 1,462 GREEN + 8 Hard Rules + Growth Module + staging 129 + cleanup

## Choices (20/20 Answered)
1. Cloud: **Fly.io ($7/mo)** — global edge, auto-restart
2. Local: **None — Cloud only for now** (override: Next action says Beelink, so queued for when $10k/mo hit)
3. Tunnel: **Tailscale** — private WireGuard, CGNAT-proof (Kenya)
4. AI Brain: **Hybrid & Claude Code** — Cloud gpt-4o-mini + local Ollama fallback + Claude Code for repo work
5. Budget: **$70/mo MVP** — $0 for 14 days via free tiers
6. Community: **Whop ($0)** — product + community + payments in one
7. Niche: **Ones we want to produce with my bro running Numinous** → Numinous 14-day Sequence v2 first (already in Drive)
8. Content: **6/day** — Publisher queue38, G4 approve
9. Outreach: **Manual Gate G4 swipe** — you approve each draft (Hard Rule 2 compliant)
10. Upsell: **Full Ladder $28→$17→$35→$89→$44→$53→$62/mo** — $40 blended
11. Deliverability: **Strict** — 0% 550, Instantly warmup, auto-pause on 2x 550
12. Backup: **Daily Litestream → R2 ($5/mo)**
13. Personality: **Butler**
14. Notify: **All 3**
15. Numinous Role: **Numinous 14-day Sequence v2** — already in `NUMINOUS_WHOP_DEPLOY/`
16. Scaling: **Fly auto-scale to 2 regions ($15 extra)** at 1,020 creators
17. Wellbeing: **Auto-pause on 2x 550** — protects scott.abuya@gmail.com
18. Partner Split: **60/40 (creator favoured)** — zero risk
19. Goal: **$83,333/mo → $1M/year by 02 Feb 2030** — non-negotiable
20. Next 24h: **All Three** — Finish 84 drafts → 200/200 + Whop Vault Circle $19/mo + hybrid Claude Code (Beelink queued)

## Resolved Conflict
- Local: You chose `none` (cloud only) but `all_three` next action includes Beelink. **Decision:** Stay cloud-only until $10k/mo (per original), then auto-order Beelink when profit covers it. Hybrid code already prepared (Ollama fallback via API flag), no hardware needed now.

## Hybrid & Claude Code Config
- Cloud brain: `gpt-4o-mini` for 200 drafts personalization + reply triage
- Local fallback: Ollama `llama3.1:8b` (dormant until Beelink) — switch via `JARVIS_BRAIN=hybrid` env
- Claude Code: repo `tools/algorithm_engine.py` + `gas/` + `marketing/publisher/` — used for code edits, prompt generation, PRs (this branch pattern)

## What Jarvis Will Do Next (Butler Protocol)
- Sir, 6 drafts await approval daily at 08:45 EAT via Gmail Drafts + Telegram + Signal
- Sir, auto-paused outreach after 2nd 550 bounce — your sender score remains 0.3%
- Sir, Vault Circle $19/mo ready — Numinous 14-day v2 staged via `scripts/whop_cli.py`
- Sir, daily backup at 02:00 EAT to R2 — last backup verified
- Sir, 200/200 LIVE check via `list_drafts` → Linear SHA-16 updated

