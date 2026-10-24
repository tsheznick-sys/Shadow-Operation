
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from models.database import init_db
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db(); yield
app=FastAPI(title="Auth API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
@app.get("/health")
def health(): return {"status":"ok"}
@app.get("/")
def root(): return {"service":"Auth"}
