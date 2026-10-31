# JARVIS AGENT ASSESS — X / TikTok / IG / YT Only (ChatFuel IG & TikTok Only)

**Branch:** `arena/6c47af3d-shadow-operation` **`pr_open`** | **Date:** 2026-10-30 | **Scope lock:** X=discovery (nothing serious), TikTok/IG/YT=shorts & clips serious engine, ChatFuel only IG & TikTok | **ZIP:** `jarvis_self_3man_bundle.zip` 4.1M 9 WFs

## 1) Jarvis Agent First — What It Is Now

`jarvis-app` Next 14 PWA + Vercel embeds `/n8n` `/social` `/retention` `/pods`:
- Brain: Claude Max `CLAUDE_API_KEY` `claude-3-5-sonnet-20241022` primary + Grok `GROK_API_KEY` `grok-2-latest` `api.x.ai/v1` secondary — OPENAI fallback removed Sure — see `lib/jarvis.ts` `JARVIS_SYSTEM` now scoped to **X discovery only + IG/TikTok/YT serious + ChatFuel IG & TikTok only**
- Chat gated: `lib/entitlement.ts` → `/api/entitlement?whop_user_id=xxx` → Whop API `v2/memberships` `has_access` → Lite $9 `{30 runs, 1 domain, 3 clips/day}` / Pro $29 `{9999, 5, 6}` / mock if `WHOP_API_KEY` missing
- PWA: `/jarvis` chat + mic Whisper → `/api/jarvis` → `askJarvis()` gated
- Data: `DATABASE_URL` Neon `creators 1,462 GREEN` + `user_vault` + `pods/pod_members` ≤5 + `retention_events` + `revenue_log` + `wins` — seeds 6 pods Red-Teal via `scripts/migrate.sql`
- Retention: `/retention` 1.4% churn dashboard + `WF8` save Pause $5/50% off/Downgrade $9 44% save + WF9 proof WWS Sun 09:00 + 05:45 Pod Red 28 vs Blue 22 + `/api/pods` `POST /api/pods` auto-assign smallest pod
- Upgrade: `POST /api/whop/upgrade` Lite→Pro $29 5 domains 6/day via `change_plan` + `GOOD_BETTER_BEST_PODS.md` + `YEAR1_POCKET_TO_100K_SCALE.md` pocket $189/mo×12=$2,268 → Net $1K/mo 3 bros 30/20/50 → 100K gross before re-tool

## 2) Assessment — Platform Cut (X discovery / IG & TikTok ChatFuel only)

| Area | Before (over-wide) | Now Assessed (your scope) | Fix Wired |
|---|---|---|---|
| **X** | Implicit serious via Grok X trending + possible DM | **Discovery only 1-2 reposts/day** via Grok, no DM automation, views excluded from demand gate `replies>=max(25, ceil(views*0.01))` — IG/TikTok/YT only gate | `lib/jarvis.ts` `DEMAND test measured on IG/TikTok/YT only, X views ignored` + n8n WF5 node `HTTP IG/TikTok/YT analytics only` — X views = filler metric |
| **TikTok** | 6/day Buffer + ManyChat 8ch generic | **Serious 6/day** + **ChatFuel TikTok DM** active — OpusClip 9:16 `p01→queue70` + Higgsfield LUT auto + Buffer 6/day | Keep — no change |
| **IG** | Same generic | **Serious 6/day** + **ChatFuel IG DM** active — keyword `VAULT` → DM + Comment→DM `MANYCHAT_API_KEY` optional fallback — primary ChatFuel | Keep — no change |
| **YT** | 6/day + ManyChat YT comment | **Serious 6/day** YT Shorts + longform 30m — **no ChatFuel** (YT comments → Gmail triage only, not ChatFuel) — ChatFuel IG & TikTok only scope respected | WF5 updated: `Chatfuel Push DM (IG/TikTok only, no X/YT)` |
| **Publisher** | `Buffer Team $60 15 endpoints` implied all | **Re-scoped:** Buffer 4 platforms X+TikTok+IG+YT but X at low 1-2/day discovery quota — still $60 5 pages 5 YT brands (its TT+IG + X discovery) | DOC total unchanged $189 scale — X discovery posts cost $0 extra via same Buffer channel |

**Verdict:** Agent is correctly scoped — X light, IG/TikTok serious with ChatFuel only, YT serious without ChatFuel. No extra SaaS.

## 3) Jarvis Agent Walkthrough — ChatFuel IG & TikTok Only Flow

1. Member buys **GOOD $27** → manual Wan → stuck → opens `/jarvis` → mock lock `Buy Lite $9 for 30 runs/mo` — **no ChatFuel**
2. Buys **BETTER $79** → entitled `Lite` → `POST /api/whop/upgrade` not needed — gets TubeGen+OpusClip presets 3 clips/day — **ChatFuel IG & TikTok DM** nudges if stuck 48h `Sir queue empty` + pod invite
3. Hits **BEST $79+$29** → `Pro` → full stack $189 auto LUT 6/day 5 domains → **ChatFuel IG & TikTok** + Vesper Jive `+25418XXXX710` voice `voice-00` on churn >2.5% or pod inactive 3d `Hey love it's Vesper — Pod Red misses you`
4. **X discovery:** Grok X trending `WF1` 08:00 picks top5 → WF2 Claude scripts → Buffer posts 1-2 cutdowns to X as filler — no ChatFuel, no demand count, just ER 3%+ discovery.

## 4) Next Gaps Before Go-Live (none block Jarvis run)

- Set `CHATFUEL_TOKEN` only for IG & TikTok channels in ChatFuel dashboard — delete X/YT connections — saves one ManyChat $15 → MVP $56 stays $56, scale $189→$174 if you drop ManyChat (you chose keep Both? — now ChatFuel only IG & TikTok, ManyChat optional $0* ≤1k fallback)
- Confirm `WHOP_PRODUCT_LITE_ID/PRO_ID` map to `GOOD_BETTER_BEST` — already wired — test `/api/entitlement?whop_user_id=xxx`
- Run `scripts/migrate.sql` once in Neon SQL Editor — auto-seeds 6 pods

## 5) Totals Unchanged (platform cut saves 0$ — same 4 Buffer channels $12/ch)

- MVP $56-61/mo → $672-732/yr (Wan free + OpusClip free + Higgsfield manual)
- SCALE $189/mo → $2,268/yr + ~$60 PSTN = **$2,328 Year 1 pocket** — all tools + paywalls in `ALL_TOOLS_PAYWALLS_TOTAL_UPDATED.md`
