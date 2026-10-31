# Gaps + Incentives + Higgsfield — What Makes 1-2% Churn Actually Work

**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` | **Date:** 2026-10-30 | **Question:** Can Higgsfield only do work? Which tools needed for best incentive?

## Answer: Higgsfield alone = 20% of job. It cannot do work alone.

| Tool | What it actually does | Without it gap | Incentive to keep it |
|---|---|---|---|
| **Higgsfield UI $29-149/mo (per-clip LUT, lip-sync, avatar)** | Visual finish only: LUT teal/purple + @premiereprotutos logo + face-fix per clip | Videos look phone-raw → 0 trust → 8s hook dies at 3s watch | Incentive: Keep as *finish* not start. Charge community `+ $0` — you bundle Higgsfield API `HIGGSFIELD_API_KEY` per-clip auto via WF3, cost ~$0.08/clip → $14/mo for 6/day. Show `Higgsfield pro grade` badge on vault — perceived value $79. |
| **TubeGen 30m ($29) OR Flow Wisely ($16) OR Wan 1.3B T4 free** | **Engine** — makes 30m faceless longform from Claude script → OpusClip source. No engine = no 6/day | Without TubeGen/Wan, Higgsfield has nothing to style. You'd manual edit 60 min/video → 6h/day → quit | Incentive: Use **Tier mix** already planned: Pillow 0cr thumb + Wan T4 free 32s (you have Colab) + Higgsfield UI manual for 60s. Cost $0 card. TubeGen only when 5 pages scale ($29/mo buys 30m). |
| **OpusClip $15/mo virality** | **Distribution multiplier** — 30m → 5-8 shorts + virality 9.2 score + auto-reframe 9:16 | Higgsfield outputs 32s only → 1 post/day → Publisher starves. OpusClip gives queue38 6-8 from 1 longform | Incentive: Bundle as `Virality Engine` — members see virality score inside Agent. Keep tier 0 free until 5 pages, then $15 is 1 vault sale. |
| **Buffer Team $12/channel** | **Publishing without opening apps** — 6/day auto after G4. No Buffer = you open IG/TikTok/YT daily → Social quits | Content piles in drive, never posts → streak breaks → churn spike | Incentive: One-frontend `jarvis-app/app/social` embeds Buffer analytics + no-per-platform open = Social Manager loves it ($12 = his time saved). |
| **Claude Max $20 + Grok $16 = $36 brain** | **Decision** — VET 8-Gate, scripts, SEO, triage FINAL TERMS, WWS copy | Higgsfield can't write, vet, or SEO. Without brain, you post junk er<2% | Incentive: Main brain — show token meter in `/n8n` embeds, cost $1.20/day → member sees AI cost, values $19. |
| **Whop + ManyChat 8ch + Chatfuel $15+15** | **Money** — Ladder $28+$17+$35+$89+$44+$53+$62, DM automation where stuck | No funnel → views never become $ — community empty | Incentive: 3 sales $81 covers MVP $60/mo. Show `Whop live Sun 09:00` in /admin. |
| **n8n Cloud $20** | **Orchestrator** — 9 WFs host. Without = manual Zap hell | Breaks 24/7 alias + retention + proof | Incentive: Embeds in Vercel `/n8n` 24/7, all 3 bros see same board. |

## The stack that locks 1-2% (incentivized tiers)

- **Free rails now:** Wan T4 (free Colab) + Pillow 0cr + OpusClip free tier + Higgsfield UI manual + Buffer Free 3 ch = **$36/mo MVP** (Claude+Grok + n8n) — you can start today no card.
- **Paid rails at 5 pages:** TubeGen $29 + OpusClip $15 + Higgsfield $29 + Buffer Team $60 = **$133** + brain $36 = **$189/mo scale** — paid by 7 vault sales.

**Incentive design to make members *want* best tools:**

1. **Good-Better-Best vault:** Starter $27 = Pillow+Wan templates (teach). Pro $79 = TubeGen prompts + OpusClip presets (give). Pro+Agent $29 = auto Higgsfield per-clip (do for them). Ascendancy = tool access.
2. **Tool credits inside Agent:** Lite $9 = 30 Higgsfield LUT runs/mo. Pro $29 = unlimited. Visual counter: `You used 18/30 LUTs — upgrade?` — drives upgrade not churn.
3. **Leaderboard = tool proof:** Leaderboard shows `Tool stack: Higgsfield Pro + OpusClip 9.2` next to winner — social proof to upgrade.

## Gaps still open after ZIP

| Gap | Risk | Fix in ZIP v2 |
|---|---|---|
| **Whop entitlement env missing** | Agent mock open → free riders | `lib/tiers.ts` + `lib/entitlement.ts` wired — set `WHOP_API_KEY` + `WHOP_PRODUCT_CIRCLE_ID/PRO_ID/TEAM_ID` — now enforces. |
| **No card for Higgsfield/OpusClip** | Manual UI bottleneck | WF3 supports `n8n_auto_higgsfield` node but fallback manual checkbox in `/content` G4. |
| **No TubeGen credits** | 30m stall | WF2 fallback to Wan T4 Colab URL (env `WAN_T4_URL`) — already in n8n solo JSON. |
| **Buffer Team not Team** | Social opens apps | WF4 fallback Publisher API direct if BUFFER_TOKEN missing. |
| **Churn >2.5% no alert** | Late save | WF8 now Jive broadcasts if threshold. |

## Conclusion: Use all, incentize stepped

**No — Higgsfield only will not hold 1-2%.** It is the lipstick. You need Engine (Wan/TubeGen) → Clip (OpusClip) → Finish (Higgsfield) → Publish (Buffer) → Money (Whop/ManyChat) → Brain (Claude+Grok). Incentivize by putting better tools behind higher tier, not paywalling all at once. MVP $36/mo proves 1.2% possible, scale $189/mo locks it for 5 pages.
