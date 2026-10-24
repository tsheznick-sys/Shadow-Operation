from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os, pathlib
from models.database import init_db
from routers import content, publisher, video_gen
# Ensure outbound/renders exists for preview
(pathlib.Path(__file__).resolve().parents[3] / "outbound" / "renders").mkdir(parents=True, exist_ok=True)
(pathlib.Path("outbound/renders")).mkdir(parents=True, exist_ok=True)
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("✓ Shadow Publisher DB ready (content_queue + posts, shares shadow_ops)")
    yield
app=FastAPI(title="Shadow Publisher API", description="Generate Veo3 videos + queue posts for 3 owned pages (IG/TikTok/Shorts) → approve → post (ManyChat DM VAULT).", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
# Serve renders for preview (G4 approve needs to see video) — absolute paths
RENDERS_DIR = pathlib.Path(__file__).resolve().parents[3] / "outbound" / "renders"
RENDERS_DIR.mkdir(parents=True, exist_ok=True)
for mount in ["/renders", "/outbound/renders"]:
    try:
        app.mount(mount, StaticFiles(directory=str(RENDERS_DIR)), name=mount.replace("/","_"))
    except Exception as e:
        print(f"mount {mount} failed: {e}")
app.include_router(content.router, prefix="/api/content", tags=["Content Queue (HSO)"])
app.include_router(video_gen.router, prefix="/api/video", tags=["Video Generate (Veo3)"])
app.include_router(publisher.router, prefix="/api/publish", tags=["Publish (Meta/TikTok/YouTube G4)"])
@app.get("/")
def root():
    return {"service":"Shadow Publisher","hosted":"here (marketing/publisher)","docs":"/docs","frontend":os.getenv("FRONTEND_URL"),"pages":["@shadow.cinema.ai (IG+Shorts)","@shadow.edits.ai (TikTok)","@vault.prompt.lab (IG+X)"],"flow":"HSO → Veo3 → FFmpeg → approve → post → ManyChat VAULT + Funnel ?ref"}
@app.get("/health")
def health():
    return {"status":"ok","posts_day":6,"stories_day":8,"cap":"G4 approve + 25/day/account"}
