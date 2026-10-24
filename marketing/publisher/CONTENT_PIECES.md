# Content Pieces — Day 1 (6 HSO)

App running: http://localhost:3003 (Publisher Queue) + http://localhost:8003/api/content/
Renders: outbound/renders/*/*.mp4 (placeholder 20KB, preview via /renders mount)

- [p01_20h_to_20m](p01_20h_to_20m.md) — @shadow.cinema.ai 20 hours of AI video → 20 minutes. Same 
- [p02_client_250](p02_client_250.md) — @shadow.cinema.ai Client paid $0 → I charged $250. One pro
- [p03_5_transitions](p03_5_transitions.md) — @shadow.edits.ai 5 AI transitions editors charge $200 for
- [p04_9min_edit](p04_9min_edit.md) — @shadow.edits.ai I edited 4 hrs per Reel. Now 9 minutes.
- [p05_one_to_one](p05_one_to_one.md) — @vault.prompt.lab One prompt = One render. Not 50 tries.
- [p06_stack](p06_stack.md) — @vault.prompt.lab Vault Stack: $497 value → $27 today

## App run check (where changes required)
- 9 services 200 (8000-8003 + 3000-3003 + 5173 chatfuel)
- 6 content seeded, 6 posts pending_approval, 3 creator_accounts
- renders placeholder not Veo3 real (needs GOOGLE_API_KEY + ffmpeg on host)
- Funnel pages empty (/api/pages) — need 4 pages for Tripwire
- ManyChat flows empty (/api/flows) — need VAULT keyword flow
- Frontend Queue preview now fixed via StaticFiles mount /renders
