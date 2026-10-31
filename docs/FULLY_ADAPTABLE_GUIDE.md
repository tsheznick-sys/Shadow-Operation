# FULLY ADAPTABLE SYSTEM — Recommendations + How to Run Config-Driven

Branch `arena/6c47af3d-shadow-operation` `pr_open` | 2026-10-30 EAT | Stack: Vercel+Neon+n8n+Claude Max+Grok+TubeGen→OpusClip→Higgsfield→Buffer

> **Principle:** No niche, threshold, price, platform, voice, pages count, or cadence is hardcoded. All editable via `config/adaptable.json` + `.env.local` + Vercel env + Neon DB `solo_domains` without touching code.

---

## 1) What is now adaptable (nothing hardcoded)

| Area | Hardcoded before | Now adaptable via | Env key |
|------|------------------|-------------------|---------|
| Niches | Wolf/Psych/Mindset/Marketing history/Consumerism | `NICHES_POOL` + Neon `solo_domains` top5 from WF1 Grok re-rank | `NICHES_POOL=Psychology,Dark Psychology,...` |
| GREEN/AMBER thresholds | `<50+5%+`, `50-70+3-5%` in `lib/jarvis.ts` | `THRESHOLD_*` in `lib/config.ts` | `THRESHOLD_RATIO_GREEN=50` `THRESHOLD_ER_GREEN=5` etc |
| Platforms & X serious | X discovery 1-2, IG/TT/YT 6/day in pages | `PLATFORMS` + `BUFFER_X_DAILY` + `BUFFER_SERIOUS_DAILY` + `X_MODE` | `PLATFORMS=X,IG,TikTok,YT` |
| ChatFuel / ManyChat | IG&TikTok ChatFuel only, YT ManyChat | `CHATFUEL_SCOPE` + `MANYCHAT_API_KEY` presence | `CHATFUEL_TOKEN=...` `MANYCHAT_API_KEY=...` |
| Pricing ladder | $28 first shot → $17/$35/$89/$53/$44 (all 8-aligned) | `WHOP_LADDER_*` + `TIER_*` tiers | `TIER_LITE_PRICE=17` `TIER_PRO_PRICE=53` `TIER_CIRCLE_PRICE=44` etc |
| Pages count | 5 pages hardcoded in `app/page.tsx` `app/retention` | `PAGES_COUNT` drives dashboard + pods + n8n loops | `PAGES_COUNT=5` (any N) |
| Brand voice | Wolf consumerism copy | `JARVIS_BRAND_VOICE` prompts override + Neon `brand_voice` row | `JARVIS_BRAND_VOICE=...` |
| Buffer cadence | 6/day serious + X 1-2 stated in pages | `BUFFER_DAILY_LIMIT` style via `lib/config.ts` content.serious_daily | `BUFFER_SERIOUS_DAILY=6` |
| Jive voice | `+25418XXXX710` hardcoded logs | `JIVE_JARVIS_NUMBER` env only, never docs real number | `JIVE_JARVIS_NUMBER=+25418XXXX710` |

All pages (`app/content|social|admin|pods|retention|bros|drafts|page.tsx`) now render from `CONFIG` / DB — hardcoded niche cards removed in code (template example strings are placeholders with `${CONFIG.niches.pool[0]}`).

---

## 2) Recommendations to run fully adaptable (do these before Feb 2027)

1. **One master config file** `config/adaptable.json` is git source of defaults; override per deploy via Vercel env — never edit code to change niche/price.
2. **Weekly Grok re-rank WF1**: let Grok rank 1000 niches CSV `data/creator_db_faceless_1000_FINAL.csv` on `buyer_pool_x3 + ratio<50 + ER5%+` → write top5 to Neon `solo_domains` → WF2 reads it — so niches auto-rotate without you.
3. **Threshold tuning**: start strict `THRESHOLD_RATIO_GREEN=50 ER_GREEN=5`. After 2 weeks, if AMBER volume >60%, loosen to `55+4.5%` via env only, re-run demand test.
4. **Pricing A/B**: keep the numerology_8 ladder `$28+$17+$35+$89+$53+$44` as default, A/B via `WHOP_LADDER_PRICES` env + `lib/entitlement.ts` — test $44 Circle vs $17 Lite conversion weekly in n8n WF6 leak→expand. Any new price must still reduce to 8 (run `scripts/check_numerology.py`).
5. **Platform switch**: to add YouTube Shorts-only brand, set `PLATFORMS=IG,TikTok,YT` + `X_MODE=off` → X cron skips DMs automatically via `CONFIG.content.x_mode`.
6. **Pages scale**: bump `PAGES_COUNT=8` + deploy — WF2 loops `for solo_domains limit PAGES_COUNT` — no app code change. Each page = 1 YT 30m + its TT/IG/Shorts.
7. **Brand voice per page**: store `brand_voice` per `solo_domains` row → `JARVIS_SYSTEM` concatenates `brand_voice` at prompt time → same Jarvis speaks Wolf vs Mindset appropriately.
8. **Buffer safety**: set `BUFFER_SERIOUS_DAILY=6` Team $12/ch; to throttle to 3/day on test week, change env → Vercel redeploy takes 1m.
9. **Voice ops**: `JIVE_JARVIS_NUMBER` stays env-only; Vapi SIP Africa's Talking $0.06 primary → Twilio $0.22 fallback via WF7 — no number in git.
10. **Churn keep 1-2%**: adaptable pods `PODS_MAX_SIZE=5` + `RETENTION_SAVE_OFFERS=pause,discount50,downgrade_lite` still 44% save — tune via env not WF edit.

## 3) Software programs — fully done checklist (verify before proceed)

- `jarvis-app/lib/config.ts` — central typed config, all `lib/jarvis.ts` + pages import from here ✓
- `jarvis-app/lib/jarvis.ts` — `JARVIS_SYSTEM` built from `CONFIG.thresholds + niches.pool + content.channels` (no literal `50:1` etc) ✓
- `jarvis-app/.env.example` — all adaptable envs listed with defaults (THRESHOLDS_*, NICHES_*, PLATFORMS_*, PAGES_COUNT, WHOP ladder, BUFFER limits, JIVE number) ✓
- `n8n/n8n_workflows_self_3man.json` — WF5 split uses `{{$env.THRESHOLD_RATIO_GREEN}}` style vars + n8n workflow variables file ✓
- `config/n8n_workflow_variables.json` — deploy-time variable substitution for adaptable thresholds ✓
- `jarvis-app/scripts/migrate.sql` — add `solo_domains` + `brand_voice` columns for adaptable niches/voice ✓
- `npm run build` + `tsc --noEmit` passes in CI ✓
- `vercel.json` crons still `*/15` + `45 5` (overridable via `CRON_*` env if needed) ✓

## 4) How to change anything without code (examples)

```bash
# New niche without code:
# Vercel env: NICHES_POOL=AI Agents, Crypto Psychology, Wolf Alpha
# + Neon: INSERT INTO solo_domains (name, niche) VALUES ('alpha_ai','AI Agents')
# + redeploy — WF1/WF2 pick it up

# Loosen GREEN gate:
# Vercel env: THRESHOLD_RATIO_GREEN=55  THRESHOLD_ER_GREEN=4.5
# + redeploy

# Add 8th YT brand:
# Vercel env: PAGES_COUNT=8
# + redeploy

# Change ladder:
# Vercel env: TIER_LITE_PRICE=17 TIER_PRO_PRICE=53 TIER_CIRCLE_PRICE=44 WHOP_LADDER_PRICES=$28+$17+$35+$89+$53+$44
```

## 5) ZIP bundle includes adaptable deploy

`jarvis_self_3man_bundle.zip` now ships: `config/adaptable.json` + `config/n8n_workflow_variables.json` + `jarvis-app/.env.example` adaptable + `scripts/setup_claude_key.sh` prompts for `ANTHROPIC_API_KEY` (no embedded key) + master prompt `docs/JARVIS_SOLO_MASTER_PROMPT.md` + live links `docs/LIVE_LINKS_SETUP.md` — import n8n variables after import.

---

*Run this guide before Feb 2027 Feb deadline — fastest to 1K net is 3 pages × 52 buyers $2,100 gross → 1,700 net.*
