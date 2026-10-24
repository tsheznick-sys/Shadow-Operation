
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import time, json
from models.database import get_session, Subscriber
from pydantic import BaseModel
from typing import Optional
router=APIRouter()
class SubCreate(BaseModel):
    platform: str; platform_user_id: str; name: Optional[str]=None; source: Optional[str]=None; creator_ref: Optional[str]=None
@router.get("/")
def list_subs(session: Session=Depends(get_session)):
    return {"subscribers": session.exec(select(Subscriber)).all()}
@router.post("/")
def create_sub(data: SubCreate, session: Session=Depends(get_session)):
    s=Subscriber(**data.model_dump(), created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    session.add(s); session.commit(); session.refresh(s); return s
