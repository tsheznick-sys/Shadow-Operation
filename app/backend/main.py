
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os, pathlib
from models.database import init_db

# Import all routers
from routers import content, publisher, video_gen
from routers import funnels, pages, checkout, analytics, brunson
from routers import flows, subscribers, broadcasts
from routers import auth
from routers import questions
from routers import messenger, instagram, whatsapp, telegram, tiktok, x_dm, youtube, discord, whop

# Ensure renders directory exists (shared across Publisher)
(pathlib.Path(__file__).resolve().parents[2] / "outbound" / "renders").mkdir(parents=True, exist_ok=True)
RENDERS_DIR = pathlib.Path(__file__).resolve().parents[2] / "outbound" / "renders"
RENDERS_DIR.mkdir(parents=True, exist_ok=True)
# Also ensure legacy path for preview compatibility
pathlib.Path("outbound/renders").mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("✓ Shadow Unified DB ready: Publisher+Funnel+ManyChat+Auth (single sqlite → postgres in prod)")
    yield

app = FastAPI(
    title="Shadow Operation — Unified",
    description="One full-stack app combining Publisher (Veo3 6/day), Funnel (Brunson Tripwire Whop), ManyChat (8 platforms), Auth — single backend, single DB, single frontend.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS wildcard for Arena preview + local dev; tighten in prod via ALLOWED_ORIGINS env
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve renders for preview (G4 approve needs to see video) — mount both prefixes
for mount in ["/renders", "/outbound/renders"]:
    try:
        app.mount(mount, StaticFiles(directory=str(RENDERS_DIR)), name=mount.replace("/", "_"))
    except Exception as e:
        print(f"mount {mount} failed: {e}")

# ===== Publisher (Content + Video + Publish) =====
app.include_router(content.router, prefix="/api/content", tags=["Publisher — Content (HSO)"])
app.include_router(video_gen.router, prefix="/api/video", tags=["Publisher — Video (Veo3)"])
app.include_router(publisher.router, prefix="/api/publish", tags=["Publisher — Publish (G4)"])

# ===== Funnel (Brunson) =====
app.include_router(funnels.router, prefix="/api/funnels", tags=["Funnel"])
app.include_router(pages.router, prefix="/api/pages", tags=["Funnel — Pages"])
app.include_router(checkout.router, prefix="/api/checkout", tags=["Funnel — Checkout (Whop)"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Funnel — Analytics"])
# brunson strategies optional
try:
    app.include_router(brunson.router, prefix="/api/brunson", tags=["Funnel — Brunson"])
except: pass

# ===== ManyChat (Flows/Subscribers + Webhooks) =====
app.include_router(flows.router, prefix="/api/flows", tags=["ManyChat — Flows"])
app.include_router(subscribers.router, prefix="/api/subscribers", tags=["ManyChat — Subscribers"])
app.include_router(broadcasts.router, prefix="/api/broadcasts", tags=["ManyChat — Broadcasts"])
# Platform webhooks (Meta verify shared env META_VERIFY_TOKEN=shadow_manychat_verify_2024)
app.include_router(messenger.router, prefix="/webhooks/messenger", tags=["Webhook — Messenger"])
app.include_router(instagram.router, prefix="/webhooks/instagram", tags=["Webhook — Instagram"])
app.include_router(whatsapp.router, prefix="/webhooks/whatsapp", tags=["Webhook — WhatsApp"])
app.include_router(telegram.router, prefix="/webhooks/telegram", tags=["Webhook — Telegram"])
app.include_router(tiktok.router, prefix="/webhooks/tiktok", tags=["Webhook — TikTok"])
app.include_router(x_dm.router, prefix="/webhooks/x", tags=["Webhook — X"])
app.include_router(youtube.router, prefix="/webhooks/youtube", tags=["Webhook — YouTube"])
app.include_router(discord.router, prefix="/webhooks/discord", tags=["Webhook — Discord"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions — Every Run"])
app.include_router(whop.router, prefix="/webhooks/whop", tags=["Webhook — Whop"])

@app.get("/")
def root():
    # If frontend built, serve SPA at / for E2B preview (fixes {"detail":"Not Found"} when visiting raw sandbox URL)
    try:
        from fastapi.responses import FileResponse as _FR
        fd = pathlib.Path(__file__).resolve().parents[1] / "frontend" / "dist" / "index.html"
        if fd.exists():
            return _FR(str(fd))
    except: pass
    return {
        "service": "Shadow Operation — Unified",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "frontend": "app/frontend (Vite) → :3000 or :3004",
        "modules": {
            "publisher": ["POST /api/content/seed-day1 → 6 HSO", "POST /api/video/generate-day1 → Veo3 or Pillow fallback", "GET /api/publish/ → queue pending_approval"],
            "funnel": ["GET /api/funnels/ → Tripwire", "POST /api/funnels/seed-tripwire → 4 pages Whop checkout", "GET /api/pages/"],
            "manychat": ["GET /api/flows/ → Keyword VAULT flows", "POST /api/flows/seed-demo", "/webhooks/instagram + /messenger verify"],
            "auth": ["POST /api/auth sync (CreatorAccount)"],
        },
        "renders": ["/renders/...", "/outbound/renders/..."],
        "env": "Whop replaces Stripe, GEMINI from Doc 1PY, single DB sqlite → shadow_ops postgres"
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "services": {
            "publisher": {"posts_day": 6, "stories_day": 8, "cap": "G4 approve + 25/day/account", "veo": "Pillow fallback in Arena, real Veo3 on Fly"},
            "funnel": {"parity": "ClickFunnels + Brunson strategies", "payment": "Whop (Stripe disabled)"},
            "manychat": {"gates": "G4 human-send, G8 opt-out, Hard Rules 1-3", "platforms": ["messenger","instagram","whatsapp","telegram","tiktok","x","youtube","discord","whop"]},
            "auth": {"status": "ok"},
        },
        "db": "unified sqlite ./data.db → postgres shadow_ops in prod",
        "renders_dir": str(RENDERS_DIR),
    }

# Optional legacy healths for drop-in compatibility
@app.get("/health/publisher")
def health_publisher(): return {"status":"ok","posts_day":6}
@app.get("/health/funnel")
def health_funnel(): return {"status":"ok","parity":"ClickFunnels + Brunson"}
@app.get("/health/manychat")
def health_manychat(): return {"status":"ok","gates":"G4,G8,Hard Rules"}

# ===== Full-stack single-port serving (fixes 403 traffic token) =====
# Serve built frontend on ONE port (8000) — solves e2b-traffic-access-token 403
FRONTEND_DIST = pathlib.Path(__file__).resolve().parents[1] / "frontend" / "dist"
try:
    if FRONTEND_DIST.exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="frontend_assets")
        from fastapi.responses import FileResponse, HTMLResponse
        @app.get("/app")
        def app_index():
            return FileResponse(str(FRONTEND_DIST / "index.html"))
        @app.get("/frontend")
        def frontend_alt():
            return FileResponse(str(FRONTEND_DIST / "index.html"))
        @app.get("/api")
        def api_info():
            return {"service": "Shadow Operation — Unified API", "version": "2.0.0", "docs": "/docs", "frontend": "/app", "health": "/health"}
        # SPA fallback — serve frontend for / and any non-API path (must be last route)
        # Preserves /api, /docs, /openapi.json, /health, /webhooks, /renders, /assets
        @app.get("/{full_path:path}")
        def spa_fallback(full_path: str):
            if full_path.startswith(("api/", "docs", "openapi.json", "redoc", "health", "webhooks/", "renders", "outbound/renders", "assets/")) or full_path in ("api","docs","openapi.json","health"):
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Not Found")
            return FileResponse(str(FRONTEND_DIST / "index.html"))
        print(f"✓ Frontend dist mounted from {FRONTEND_DIST} — /app + / + SPA fallback + /api on same port 8000")
    else:
        print(f"! Frontend dist not found at {FRONTEND_DIST} — run `cd app/frontend && npm run build`")
except Exception as e:
    print(f"Frontend mount failed: {e}")


