# FULL BREAKDOWN — JARVIS AGENT ZIP (Grok + Claude Primary, OPENAI_API_KEY fallback REMOVED 2026-10-30 Sure)

**Branch:** `arena/6c47af3d-shadow-operation` `pr_open` | **Date:** 2026-10-30 Nairobi EAT | **Zip:** `jarvis_self_3man_bundle.zip` 55M 2140+ files 7 WFs + Vesper Adaptive + Grok+Claude | **Drive:** `17KpzZCm...` HQ — manual push (sandbox allowlist blocks drive.google.com) | **Change:** `OPENAI_API_KEY` fallback **DELETED** per your Sure — only `CLAUDE_API_KEY` + `GROK_API_KEY`/`XAI_API_KEY` remain in `jarvis-app/lib/jarvis.ts`

**What was replaced & removed:**
- `jarvis-app/lib/jarvis.ts` no longer checks `OPENAI_API_KEY` at all — tries `CLAUDE_API_KEY` (claude-3-5-sonnet-20241022) → fallback `GROK_API_KEY`/`XAI_API_KEY` at `https://api.x.ai/v1` (`grok-2-latest`) → mock only if both missing. Previous version kept `|| OPENAI_API_KEY` fallback for migration; now **deleted** per Sure.
- `jarvis-app/package.json` description notes `OPENAI_API_KEY removed` — deps `@anthropic-ai/sdk` + `openai` (openai SDK now only for xAI Grok compatibility, not OpenAI)
- `jarvis-app/.env.example` `OPENAI_API_KEY=sk-proj-xxx` line **deleted** — only `GROK_API_KEY` + `CLAUDE_API_KEY` + `XAI_API_KEY` + `XAI_BASE_URL` + `GROK_MODEL` remain — cost line updated to `$41 MVP $80 scaled [OPENAI fallback deleted]`
- `n8n/*.json` 3 workflows already `Claude 3.5 Sonnet primary + Grok-2 secondary` — no `grok-2-latest` fallback to OpenAI
- `scripts/grok_claude_agent_session.py` primary — `scripts/openai_agent_session.py` deprecated archive
- `docs/OPENAI_AGENT_MCP.md` deprecated header, `docs/GROK_CLAUDE_AGENT_MCP.md` primary

**Current Zip truly needed tools (no public domains, no OpenAI):** Vercel Hobby $0 (stay_hobby_0) or Pro $20 + n8n Cloud $20 7 WFs + Neon $0/$19 + **Claude $20 + Grok $16 = $36 brain** (was OpenAI $30) + TubeGen $149 + OpusClip $0/$15 + Higgsfield $0/$89 + Publisher $0 + Buffer Team 5ch $60 + R2 $5 + Whop $0+fees (2.7%+$0.30+3%) + Chatfuel $15-25 + ManyChat $15 + Telegram/Signal/Gmail/Linear/Drive HQ $0 + Wise $0 virtual card per SaaS via Whop self-funded — **MVP $56/mo $672/yr → $528/yr prepaid | SCALE $325-$414/mo $3,900-$4,968/yr → $3,336-$4,416/yr prepaid** — domains -$60/yr removed, **Whop virtual card Wise $0 self-funded** — 3 sales $27=$81 covers MVP

**Zip prepared:** `jarvis_self_3man_bundle.zip` 55M at repo root after rebuild includes `jarvis-app/lib/jarvis.ts` **without OPENAI fallback**, new docs, 7 WFs, 9 Vesper audios, Jive `+25418XXXX710` secure env only — ready for Drive HQ manual push (see §6 in previous full breakdown).

