
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import time
from models.database import get_session, ContentItem
from pydantic import BaseModel
from typing import Optional
router=APIRouter()
class CCreate(BaseModel):
    page: str; platform: str="instagram"; hook: str; story: str; offer: str; caption: str; prompt_id: Optional[str]=None; scheduled_at: Optional[str]=None
@router.get("/")
def list_content(session: Session=Depends(get_session)):
    return {"content": session.exec(select(ContentItem)).all()}
@router.post("/")
def create_cc(data: CCreate, session: Session=Depends(get_session)):
    c=ContentItem(**data.model_dump(), status="queued", created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ")); session.add(c); session.commit(); session.refresh(c); return c
@router.post("/seed-day1")
def seed_day1(session: Session=Depends(get_session)):
    day1=[{"page":"@shadow.cinema.ai","platform":"instagram","hook":"20 hours of AI video → 20 minutes. Same $500 look.","story":"Old: 20h per client (Premiere+Midjourney). New: 1 prompt → Veo3 → done.","offer":"DM VAULT — free chapter (35 prompts + Loom) → render today.","caption":"20h → 20m. DM VAULT #aivideo","prompt_id":"p01_20h_to_20m","scheduled_at":"2026-10-24T09:00:00+03:00"},{"page":"@shadow.cinema.ai","platform":"instagram","hook":"Client paid $0 → I charged $250. One prompt.","story":"Left: shaky phone. Right: cinematic render same scene.","offer":"Full workflow in $27 Vault Lite. DM VAULT preview.","caption":"Same phone, different prompt. DM VAULT.","prompt_id":"p02_client_250"},{"page":"@shadow.edits.ai","platform":"tiktok","hook":"5 AI transitions editors charge $200 for — 60 seconds.","story":"Whip/glitch/morph/speed-ramp/match-cut","offer":"Want 5 presets? DM VAULT — free TikTok pack.","caption":"Editors gatekeep this. DM VAULT #videoediting","prompt_id":"p03_5_transitions"},{"page":"@shadow.edits.ai","platform":"tiktok","hook":"I edited 4 hrs per Reel. Now 9 minutes.","story":"Timeline 4hr → 9min (AI auto-cut+caption).","offer":"DM VAULT — free Loom teardown.","caption":"Edit prompts not frames. DM VAULT.","prompt_id":"p04_9min_edit"},{"page":"@vault.prompt.lab","platform":"instagram","hook":"One prompt = One render. Not 50 tries.","story":"Prompt lab Notion: 1:1 prompt→render.","offer":"Daily prompt here. 35 inside DM PROMPT → $19/mo","caption":"Day 1/30 — one prompt daily. DM PROMPT.","prompt_id":"p05_one_to_one"},{"page":"@vault.prompt.lab","platform":"instagram","hook":"Vault Stack: $497 value → $27 today","story":"Slides: Vault $79 + E-book $49 + Notion $29 + 5 Looms $79 + Presets $47","offer":"15 min preview — DM VAULT.","caption":"Stack broken down. DM VAULT.","prompt_id":"p06_stack"}]
    out=[]
    for d in day1:
        c=ContentItem(**d, status="queued", created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ")); session.add(c); out.append(c)
    session.commit(); return {"seeded": len(out)}
