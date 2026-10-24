
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import time, json
from models.database import get_session, Page, FunnelStep
from pydantic import BaseModel
from typing import Optional
router=APIRouter()
class PageCreate(BaseModel):
    title: str; slug: str; funnel_step_id: Optional[int]=None; builder_json: str="{}"; headline: Optional[str]=None; hook: Optional[str]=None; story: Optional[str]=None; offer: Optional[str]=None; published: bool=False
@router.get("/")
def list_pages(session: Session=Depends(get_session)):
    return {"pages": session.exec(select(Page)).all()}
@router.post("/")
def create_page(data: PageCreate, session: Session=Depends(get_session)):
    p=Page(**data.model_dump()); session.add(p); session.commit(); session.refresh(p); return p
@router.put("/{page_id}")
def update_page(page_id: int, data: PageCreate, session: Session=Depends(get_session)):
    p=session.get(Page, page_id)
    if not p: return {"error":"not found"}
    for k,v in data.model_dump().items(): setattr(p,k,v)
    session.add(p); session.commit(); session.refresh(p); return p
@router.get("/funnel/{funnel_id}")
def pages_for_funnel(funnel_id: int, session: Session=Depends(get_session)):
    from models.database import Funnel
    steps=session.exec(select(FunnelStep).where(FunnelStep.funnel_id==funnel_id)).all()
    return {"funnel_id": funnel_id, "steps_with_pages": [{"step": s, "page": session.get(Page, s.page_id)} for s in steps]}
