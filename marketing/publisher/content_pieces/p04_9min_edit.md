# p04_9min_edit — @shadow.edits.ai (tiktok) @ 20:00

**Hook:** I edited 4 hrs per Reel. Now 9 minutes.
**Story:** Timeline 4hr → 9min (AI auto-cut+caption). Epiphany: edit prompts not frames.
**Offer:** DM VAULT — free Loom teardown.
**Caption:** Edit prompts not frames. DM VAULT.
**CTA:** DM VAULT → ManyChat keyword → Whop Middle $79
**Render:** `outbound/renders/@shadow.edits.ai/p04_9min_edit.mp4` (9:16 placeholder gold/black — replace with Veo3 + Loom + FFmpeg)

## Changes required (from running app)
- render_path placeholder MP4 (20KB) — needs real Veo3 (GOOGLE_API_KEY ok but Arena blocks api.openai.com; works on Fly)
- publisher capped G4 pending_approval — tap Approve → Graph API needs per-page META_ACCESS_TOKENS
- manychat flow for keyword DM VAULT missing auto-DM — add in FlowBuilder keyword trigger
- funnel pages for Vault Tripwire not seeded — see docs/3_PAGES_24H_LAUNCH.md squeeze/tripwire/oto

## Next edit
Generate real video: POST /api/video/generate/{content_id} with Loom URL + prompt_id p04_9min_edit → FFmpeg 9:16.
