# p06_stack — @vault.prompt.lab (instagram) @ 18:00

**Hook:** Vault Stack: $497 value → $27 today
**Story:** Slides: Vault $79 + E-book $49 + Notion $29 + 5 Looms $79 + Presets $47 + Updates $19/mo
**Offer:** 15 min preview — DM VAULT.
**Caption:** Stack broken down. DM VAULT free chapter proves it.
**CTA:** DM VAULT → ManyChat keyword → Whop Stack $497→$27
**Render:** `outbound/renders/@vault.prompt.lab/p06_stack.mp4` (9:16 placeholder gold/black — replace with Veo3 + Loom + FFmpeg)

## Changes required (from running app)
- render_path placeholder MP4 (20KB) — needs real Veo3 (GOOGLE_API_KEY ok but Arena blocks api.openai.com; works on Fly)
- publisher capped G4 pending_approval — tap Approve → Graph API needs per-page META_ACCESS_TOKENS
- manychat flow for keyword DM VAULT missing auto-DM — add in FlowBuilder keyword trigger
- funnel pages for Vault Tripwire not seeded — see docs/3_PAGES_24H_LAUNCH.md squeeze/tripwire/oto

## Next edit
Generate real video: POST /api/video/generate/{content_id} with Loom URL + prompt_id p06_stack → FFmpeg 9:16.
