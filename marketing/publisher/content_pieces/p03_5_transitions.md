# p03_5_transitions — @shadow.edits.ai (tiktok) @ 10:00

**Hook:** 5 AI transitions editors charge $200 for — 60 seconds.
**Story:** Whip/glitch/morph/speed-ramp/match-cut each 8s with shortcut overlay.
**Offer:** Want 5 presets? DM VAULT — free TikTok pack.
**Caption:** Editors gatekeep this. DM VAULT on IG. #videoediting #premierepro #aitransitions
**CTA:** DM VAULT → ManyChat keyword → Whop Vault $79
**Render:** `outbound/renders/@shadow.edits.ai/p03_5_transitions.mp4` (9:16 placeholder gold/black — replace with Veo3 + Loom + FFmpeg)

## Changes required (from running app)
- render_path placeholder MP4 (20KB) — needs real Veo3 (GOOGLE_API_KEY ok but Arena blocks api.openai.com; works on Fly)
- publisher capped G4 pending_approval — tap Approve → Graph API needs per-page META_ACCESS_TOKENS
- manychat flow for keyword DM VAULT missing auto-DM — add in FlowBuilder keyword trigger
- funnel pages for Vault Tripwire not seeded — see docs/3_PAGES_24H_LAUNCH.md squeeze/tripwire/oto

## Next edit
Generate real video: POST /api/video/generate/{content_id} with Loom URL + prompt_id p03_5_transitions → FFmpeg 9:16.
