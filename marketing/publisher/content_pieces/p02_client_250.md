# p02_client_250 — @shadow.cinema.ai (instagram) @ 19:00

**Hook:** Client paid $0 → I charged $250. One prompt.
**Story:** Left: shaky phone. Right: cinematic render same scene. Prompt anamorphic golden hour 35mm. Notion OS.
**Offer:** Full workflow in $27 Vault Lite. DM VAULT preview.
**Caption:** Same phone, different prompt. DM VAULT for Vault Lite.
**CTA:** DM VAULT → ManyChat keyword → Whop Tripwire $27
**Render:** `outbound/renders/@shadow.cinema.ai/p02_client_250.mp4` (9:16 placeholder gold/black — replace with Veo3 + Loom + FFmpeg)

## Changes required (from running app)
- render_path placeholder MP4 (20KB) — needs real Veo3 (GOOGLE_API_KEY ok but Arena blocks api.openai.com; works on Fly)
- publisher capped G4 pending_approval — tap Approve → Graph API needs per-page META_ACCESS_TOKENS
- manychat flow for keyword DM VAULT missing auto-DM — add in FlowBuilder keyword trigger
- funnel pages for Vault Tripwire not seeded — see docs/3_PAGES_24H_LAUNCH.md squeeze/tripwire/oto

## Next edit
Generate real video: POST /api/video/generate/{content_id} with Loom URL + prompt_id p02_client_250 → FFmpeg 9:16.
