# SKILLS — Jarvis Agent Needs to Complete Whole System (loaded via .agents/skills)

**For Claude Code:** Read this + `00_MASTER_SYSTEM_PROMPT.md` + `prompt-skills.md` — skills are file-backed, not model-only. Path: `.agents/skills/` symlink to `docs/` + `jarvis-app/` skills. All 13 skills below must be available via `list_connector_tools` or local file reads.

| # | Skill (name in .agents/skills) | File lives | What Claude does with it |
|---|---|---|---|
| 1 | **vet-8gate** | `tools/apparatus_1000.py` + `data/creator_db_faceless_1000_FINAL.csv` (1,462 GREEN) + `reference/SHADOW_OPERATION_RULES.md` | Runs buyer_pool_x3=avg_comments*3, ratio<50:1, ER 3%+ ideal 5%+, 8-Gate GREEN; rejects RED <2% ER (Q14) |
| 2 | **draft-outreach** | `gas/GMAIL_G4_SEND_200_VERIFIED.gs` + `templates/gmail_next100_manifest_101_200.json` | Drafts 6/day swipe (G14 equal SEND), FINAL TERMS after 3 emails (R3), human SEND gate |
| 3 | **reply-triage** | `jarvis-app/app/api/cron/check-replies/route.ts` + `lib/jarvis.ts` Claude fallback Grok | Triage Gmail replies 05:45 daily brief, classifies positive/negative, pushes Linear SHA |
| 4 | **demand-test** | `jarvis-app/app/omar/page.tsx` + `reference/SHADOW_OPERATION_RULES.md` R9-11 | Thu 19:00 POLL→Sun 09:00 measure 1%+25 (= max(25, 1% views)) IG/TikTok/YT only X ignored → PASS→Whop vault auto |
| 5 | **content-6day** | `n8n/n8n_workflows_self_3man.json` WF2 TubeGen→WF3 OpusClip+Higgsfield per-clip→WF4 Buffer | Makes 30m 4.5k words Claude while sleep → 5-8 shorts virality 9.2 per 30m → Buffer 6/day serious + X 1-2 discovery |
| 6 | **retention-1-2** | `docs/CHURN_1_2_PERCENT_LOCK.md` + `GOOD_BETTER_BEST_PODS.md` + `WF8/WF9` + `jarvis-app/app/retention/page.tsx` | Pause $5 / 50% off $9.50 / Downgrade $9 Lite — saves 40% → 1.4%→1.1% with pods≤5 |
| 7 | **upgrade-lite-pro** | `docs/UPGRADE_LITE_TO_PRO_SCALE189.md` + `jarvis-app/app/api/whop/upgrade/route.ts` + `lib/entitlement.ts` | all_three triggers (Day3 win + Day7 streak + Leaderboard Top3) → Whop change_plan Lite $9(30 runs,1dom,3/d)→Pro $29(9999,5d,6/d) |
| 8 | **year1-scale** | `docs/YEAR1_POCKET_TO_100K_SCALE.md` | Pocket $189/mo×12=$2,268 → Net $1K/mo 3 bros 30/20/50 → 100K gross before re-tool |
| 9 | **platform-scope** | `docs/ASSESS_JARVIS_AGENT_X_TIKTOK_IG_YT.md` + `GROK_CLAUDE_AGENT_MCP.md` | X discovery light + ChatFuel IG & TikTok only + YT comments→Gmail triage |
| 10 | **voice-vesper** | `docs/JARVIS_VESPER_VOICE_WIRED.md` + `JARVIS_JIVE_VOICE_SPEC.md` + `VESPER_ADAPTIVE_SENSOR_TONALITY.md` + `jarvis-app/lib/voice.ts` + `audio/vesper_voice_*.mp3` + `audio/jarvis_voice_*.mp3` | Vapi SIP Jive One `+25418XXXX710` secure env only — 3 legs parallel (Owner All/Social account/Content) — voice-00 Vesper 20yo playful witty adaptive per role intro — Whisper transcribe → Neon/Drive 17KpzZCm/calls + Linear — feedback call Owner only Big Red Button optional |
| 11 | **whop-pay** | `docs/SHADOW_OPERATION_FULL_PIPELINE_CONTENT_TO_COMMUNITY.md` + `data/product_blueprint.md` | Ladder $27+$9+$79+$19/mo via Whop `whop.py` + ManyChat 8ch VAULT keyword → DM → Whop |
| 12 | **higgsfield-stack** | `docs/TOOL_GAPS_INCENTIVE_HIGGSFIELD.md` + `JARVIS_AGENT_ZIP_TRULY_NEEDED_TOOLS.md` | Higgsfield finish $0.08/clip only — needs Wan T4 free / TubeGen $29 engine + OpusClip clip + Buffer publish — incentivized Good-Better-Best tiers |
| 13 | **live-links** | `docs/LIVE_LINKS_SETUP.md` (this ZIP) | Step-by-step with live https:// links to set all things for Jarvis Agent — see below section |

**Load order for Claude:** `00_MASTER_SYSTEM_PROMPT.md` → `ALL_TOOLS_PAYWALLS_TOTAL_UPDATED.md` ($56 MVP → $189 scale pocket) → `CLAUDE_MASTER_PROMPT_JARVIS.md` → `SKILLS_JARVIS.md` → then per-task skill file.

