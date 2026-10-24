
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
import time
from models.database import get_session, CreatorAccount
router = APIRouter()
class CreatorCreate(BaseModel):
    email: str
    handle: str
    niche: Optional[str]=None
@router.get("/")
def list_creators(session: Session=Depends(get_session)):
    return {"creators": session.exec(select(CreatorAccount)).all()}
@router.post("/")
def create_creator(data: CreatorCreate, session: Session=Depends(get_session)):
    c = CreatorAccount(**data.model_dump(), created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    session.add(c); session.commit(); session.refresh(c)
    return c
