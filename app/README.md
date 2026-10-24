# Shadow Operation — Unified Full-Stack (v2)

One backend + one frontend + one DB replaces 8 microservices.

```
app/backend  → FastAPI unified (Publisher + Funnel + ManyChat + Auth) :8000
app/frontend → Vite React unified (4 tabs) :3000
outbound/renders → 9:16 video previews mounted at /renders
```

## Why unified?

Before: 4 backends (8000-8003) + 4 frontends (3000-3003) + Chatfuel 5173 = 9 processes, 4 DB files, 4 .env copies.  
Now: **1 backend (8000) + 1 frontend (3000)** = single `data.db` (sqlite locally, `shadow_ops` postgres on Fly), single `.env`, single `vite proxy`.

All features preserved:
- Publisher: `POST /api/content/seed-day1` (6 HSO), `POST /api/video/generate-day1` (Veo3 or Pillow 720x1280 fallback), `POST /api/publish/schedule-day1` → G4 approve queue.
- Funnel: `POST /api/funnels/seed-tripwire` → 4 steps + 4 pages with Whop `https://whop.com/...?ref=@shadow.cinema.ai` builder_json (Stripe disabled).
- ManyChat: `POST /api/flows/seed-demo` → 4 live flows (VAULT keyword, Welcome, Default, Post-Purchase). `GET /webhooks/instagram` + `/messenger` verify `shadow_manychat_verify_2024`.
- Auth: `POST /api/auth/` CreatorAccount.

## Run locally

```bash
# backend
pip install -r app/backend/requirements.txt
uvicorn app.backend.main:app --host 0.0.0.0 --port 8000 --reload --app-dir app/backend

# frontend (second terminal)
cd app/frontend && npm install && npm run dev
# → http://localhost:3000  (shell tabs: Publisher | Funnel | ManyChat | Auth)
# → http://localhost:8000/docs  (unified Swagger)
```

## Env

One `.env` at `app/backend/.env` (or legacy per-service `.env` still read). Required:
```
DATABASE_URL=sqlite:///./data.db  # Fly: postgres://...shadow_ops
META_ACCESS_TOKEN=EAAd...
META_VERIFY_TOKEN=shadow_manychat_verify_2024
META_APP_ID=2104082527135617
IG_ACCESS_TOKEN=IGAAUh...
WHOP_API_KEY=apik_kVrTn...  # replaces Stripe
GOOGLE_API_KEY=AQ.Ab8...   # GEMINI→Veo3
OPENAI_API_KEY=sk-proj-taCQ...
CHAT_FUEL_CLI=8d2124...
```

## Deploy (Fly)

Already wired for Fly: `GOOGLE_API_KEY` veoreal in Arena shows `veo_configured:false` fallback, on Fly `true` after `fly secrets set GOOGLE_API_KEY=...`.

## Legacy

Old microservices kept at `marketing/*/backend` + `auth/backend` for reference, but `app/` is source of truth for deploy.
