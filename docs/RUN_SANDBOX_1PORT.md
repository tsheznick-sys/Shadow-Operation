# Run All Apps on ONE Sandbox — Solve 403 Traffic Token

**Problem you saw:**
```
403 Forbidden Missing traffic access token
The sandbox iuwygbstsi9qmbvcrm4n7 requires a traffic access token.
e2b-traffic-access-token header is missing.
→ https://docs.e2b.dev/network/restrict-public-access
```
This is **not** your app — it's E2B's new default: every `https://{port}-{sandboxId}.e2b.app` must send header `e2b-traffic-access-token: <token>`. Direct browser URL without token = 403.

**Why it happened:** You opened `https://3000-…e2b.app` directly. The old stack exposed 9 ports (3000-3003, 5173, 8000-8003) → 9 different e2b.app URLs → 9 tokens needed.

**Fix: ONE port (8000) serves everything.**
FastAPI now mounts:
- `GET /health`, `/docs`, `/api/*`, `/webhooks/*` → API
- `GET /assets/*` + `GET /app` → built frontend `app/frontend/dist` ( `npm run build` already done)

**New way (one sandbox, one preview, no token hassle in Arena):**

In Arena, use the **LIVE PREVIEW** button that appears next to the process (e.g., `FullStack Unified (8000)`). Arena's proxy **automatically injects** `e2b-traffic-access-token: <auto>` — you never copy the raw URL.

If you *must* open raw e2b.app:
1. In Arena, click `⋮` on sandbox → `Copy traffic access token`
2. Use:
```bash
curl -H "e2b-traffic-access-token: $TOKEN" https://8000-iuwygbstsi9qmbvcrm4n7.e2b.app/health
# Browser: install ModHeader and add header e2b-traffic-access-token = $TOKEN for https://*e2b.app/*
```

**Local (no token needed):**
```bash
curl http://localhost:8000/health         # always works inside sandbox
curl http://localhost:8000/api/questions/  # Questions every run
open http://localhost:8000/app            # built frontend (single-port)
```

**Commands:**
```bash
# One-command full-stack (single process, single DB, single .env):
python app/fullstack_run.py
# or manually:
pip install -r app/backend/requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --app-dir app/backend
# frontend is already built to app/frontend/dist and served at /app + /assets
```

**Verify (inside sandbox, no token):**
```bash
curl http://localhost:8000/health | jq
curl http://localhost:8000/api/questions/ | jq .count # → 7+ (every run)
curl http://localhost:8000/api/content/ | jq .count
curl "http://localhost:8000/webhooks/instagram?hub.mode=subscribe&hub.verify_token=shadow_manychat_verify_2024&hub.challenge=test"
```

**Env:** Google Doc `1PYfbBi1lRRx7kLfygcoegLHXvhJzckJ7I79n233uQEA` tab `t.0` → `app/backend/.env` (already copied from `.env.example`; fill real tokens before prod). All `marketing/*/backend/.env` + `auth/backend/.env` + `chatfuel-app/.env` duplicate it for legacy.

**Chatfuel workspace:** `chatfuel-app/` still runs on `5173` separately *if you need Chatfuel Studio* — but new unified `8000` is enough for Publisher/Funnel/ManyChat/Auth/Questions. To also run Chatfuel on one sandbox, open its Live Preview `5173` (also auto-token).
