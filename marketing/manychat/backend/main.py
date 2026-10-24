
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from models.database import init_db
from routers import flows, subscribers, broadcasts, messenger, instagram, whatsapp, telegram, tiktok, x_dm, youtube, discord, whop
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("✓ ManyChat DB ready")
    yield
app = FastAPI(title="Shadow ManyChat API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
for r, prefix, tags in [
    (messenger.router, "/webhooks/messenger", ["Messenger"]),
    (instagram.router, "/webhooks/instagram", ["Instagram"]),
    (whatsapp.router, "/webhooks/whatsapp", ["WhatsApp"]),
    (telegram.router, "/webhooks/telegram", ["Telegram"]),
    (tiktok.router, "/webhooks/tiktok", ["TikTok"]),
    (x_dm.router, "/webhooks/x", ["X"]),
    (youtube.router, "/webhooks/youtube", ["YouTube"]),
    (discord.router, "/webhooks/discord", ["Discord"]),
    (whop.router, "/webhooks/whop", ["Whop"]),
    (subscribers.router, "/api/subscribers", ["Users"]),
    (flows.router, "/api/flows", ["Flows"]),
    (broadcasts.router, "/api/broadcasts", ["Broadcasts"]),
]:
    app.include_router(r, prefix=prefix, tags=tags)
@app.get("/")
def root(): return {"service":"Shadow ManyChat","docs":"/docs","platforms":["messenger","instagram","whatsapp","telegram","tiktok","x","youtube","discord","whop"]}
@app.get("/health")
def health(): return {"status":"ok","version":"1.0.0","gates":"G4 human-send, G8 opt-out, Hard Rules 1-3 enforced"}
