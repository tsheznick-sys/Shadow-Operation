
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import time
from models.database import get_session, Post, ContentItem
router=APIRouter()
@router.get("/")
def queue(session: Session=Depends(get_session)):
    return {"queue": session.exec(select(Post)).all(), "G4":"pending_approval"}
@router.post("/approve/{post_id}")
def approve(post_id: int, session: Session=Depends(get_session)):
    p=session.get(Post, post_id)
    if not p: return {"error":"not found"}
    p.status="posted"; p.published_at=time.strftime("%Y-%m-%dT%H:%M:%SZ"); session.add(p); session.commit(); return {"post": p}
@router.post("/schedule-day1")
def schedule_day1(session: Session=Depends(get_session)):
    items=session.exec(select(ContentItem)).all()
    for c in items:
        if not c.render_path: c.render_path=f"outbound/renders/{c.page}/{c.prompt_id}.mp4"
        p=Post(content_id=c.id, platform=c.platform, status="pending_approval"); session.add(p)
    session.commit(); return {"scheduled": len(items)}
