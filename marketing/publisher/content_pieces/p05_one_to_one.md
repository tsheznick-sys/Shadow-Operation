# p05_one_to_one — @vault.prompt.lab (instagram) @ 11:00

**Hook:** One prompt = One render. Not 50 tries.
**Story:** Prompt lab Notion: 1:1 prompt→render. Most fail prompting like chat, not cinematographers.
**Offer:** Daily prompt here. 35 inside DM PROMPT → $19/mo after free chapter.
**Caption:** Day 1/30 — one prompt daily. DM PROMPT.
**CTA:** DM PROMPT → ManyChat keyword → Whop Continuity $19/mo
**Render:** `outbound/renders/@vault.prompt.lab/p05_one_to_one.mp4` (9:16 placeholder gold/black — replace with Veo3 + Loom + FFmpeg)

## Changes required (from running app)
- render_path placeholder MP4 (20KB) — needs real Veo3 (GOOGLE_API_KEY ok but Arena blocks api.openai.com; works on Fly)
- publisher capped G4 pending_approval — tap Approve → Graph API needs per-page META_ACCESS_TOKENS
- manychat flow for keyword DM PROMPT missing auto-DM — add in FlowBuilder keyword trigger
- funnel pages for Vault Tripwire not seeded — see docs/3_PAGES_24H_LAUNCH.md squeeze/tripwire/oto

## Next edit
Generate real video: POST /api/video/generate/{content_id} with Loom URL + prompt_id p05_one_to_one → FFmpeg 9:16.
