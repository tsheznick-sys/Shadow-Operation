
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from models.database import init_db
from routers import funnels, pages, checkout, analytics
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("✓ Funnel DB ready")
    yield
app=FastAPI(title="Shadow Funnel API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
app.include_router(funnels.router, prefix="/api/funnels", tags=["Funnels"])
app.include_router(pages.router, prefix="/api/pages", tags=["Pages"])
app.include_router(checkout.router, prefix="/api/checkout", tags=["Checkout"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
@app.get("/")
def root(): return {"service":"Shadow Funnel","docs":"/docs"}
@app.get("/health")
def health(): return {"status":"ok","version":"1.0.0","parity":"ClickFunnels + Brunson strategies"}
