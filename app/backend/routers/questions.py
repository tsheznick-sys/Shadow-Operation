from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
import time, uuid
from models.database import get_session, Question

router = APIRouter()

class QuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct: str = "A"
    category: Optional[str] = "general"

class QuestionUpdate(BaseModel):
    question: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct: Optional[str] = None
    category: Optional[str] = None

def _now():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ")

@router.get("/")
def list_questions(session: Session = Depends(get_session)):
    questions = session.exec(select(Question).order_by(Question.id)).all()
    # Auto-seed if empty — Questions Always come in Every run
    if not questions:
        seed_data = [
            ("What is the HSO framework used for videos?", "Hook Story Offer", "High Speed Optimization", "Hybrid System Output", "Hot Sale Offer", "A", "publisher"),
            ("Which platform gives $1.50 CPM post-purchase flow?", "ManyChat", "Whop", "ManyChat Post-Purchase Clip", "TikTok", "C", "manychat"),
            ("What does G4 gate enforce?", "Auto-post", "Human approve before publish", "Generate 4 videos", "Grade 4 audit", "B", "publisher"),
            ("Whop replaces which checkout in funnel?", "PayPal", "Stripe", "Gumroad", "Shopify", "B", "funnel"),
            ("Veo3 fallback in Arena uses?", "Real Veo API", "Pillow 720x1280 imageio", "OpenAI Sora", "Midjourney", "B", "publisher"),
        ]
        questions = []
        for q, a, b, c, d, corr, cat in seed_data:
            qq = Question(question=q, option_a=a, option_b=b, option_c=c, option_d=d, correct=corr, category=cat, run_id="seed", created_at=_now())
            session.add(qq)
            questions.append(qq)
        session.commit()
        # re-fetch for ids
        questions = session.exec(select(Question).order_by(Question.id)).all()
    return {"questions": questions, "count": len(questions), "note": "Questions Always come in Every run — auto-seeded if empty"}

@router.post("/")
def create_question(data: QuestionCreate, session: Session = Depends(get_session)):
    q = Question(**data.model_dump(), run_id=str(uuid.uuid4())[:8], created_at=_now())
    # normalize correct
    q.correct = q.correct.upper().strip()[0] if q.correct else "A"
    if q.correct not in ["A","B","C","D"]:
        q.correct = "A"
    session.add(q)
    session.commit()
    session.refresh(q)
    return q

@router.post("/seed")
def seed_questions(session: Session = Depends(get_session)):
    session.exec(select(Question))  # trigger init
    # clear and reseed
    existing = session.exec(select(Question)).all()
    for q in existing:
        session.delete(q)
    session.commit()
    data = [
        ("What is the HSO framework used for videos?", "Hook Story Offer", "High Speed Optimization", "Hybrid System Output", "Hot Sale Offer", "A", "publisher"),
        ("Which platform gives $1.50 CPM post-purchase flow?", "ManyChat", "Whop", "ManyChat Post-Purchase Clip", "TikTok", "C", "manychat"),
        ("What does G4 gate enforce?", "Auto-post", "Human approve before publish", "Generate 4 videos", "Grade 4 audit", "B", "publisher"),
        ("Whop replaces which checkout in funnel?", "PayPal", "Stripe", "Gumroad", "Shopify", "B", "funnel"),
        ("Veo3 fallback in Arena uses?", "Real Veo API", "Pillow 720x1280 imageio", "OpenAI Sora", "Midjourney", "B", "publisher"),
        ("How many HSO pieces in Day 1?", "3", "6", "9", "12", "B", "publisher"),
        ("What is Tripwire price in Vault?", "$0", "$27", "$79", "$497", "B", "funnel"),
    ]
    created = []
    for q,a,b,c,d,corr,cat in data:
        qq = Question(question=q, option_a=a, option_b=b, option_c=c, option_d=d, correct=corr, category=cat, run_id="seed", created_at=_now())
        session.add(qq)
        created.append(qq)
    session.commit()
    for qq in created:
        session.refresh(qq)
    return {"seeded": len(created), "questions": created}

@router.get("/{qid}")
def get_question(qid: int, session: Session = Depends(get_session)):
    q = session.get(Question, qid)
    if not q:
        return {"error": "not found"}
    return q

@router.put("/{qid}")
def update_question(qid: int, data: QuestionUpdate, session: Session = Depends(get_session)):
    q = session.get(Question, qid)
    if not q:
        return {"error": "not found"}
    for k,v in data.model_dump(exclude_unset=True).items():
        setattr(q,k,v)
    if q.correct:
        q.correct = q.correct.upper().strip()[0]
    session.add(q)
    session.commit()
    session.refresh(q)
    return q

@router.delete("/{qid}")
def delete_question(qid: int, session: Session = Depends(get_session)):
    q = session.get(Question, qid)
    if not q:
        return {"error": "not found"}
    session.delete(q)
    session.commit()
    return {"ok": True, "deleted": qid}

@router.post("/answer")
def answer_question(payload: dict, session: Session = Depends(get_session)):
    qid = payload.get("question_id")
    choice = payload.get("choice","").upper().strip()
    q = session.get(Question, qid)
    if not q:
        return {"error": "question not found"}
    correct = (choice == q.correct)
    return {"question_id": qid, "chosen": choice, "correct_answer": q.correct, "is_correct": correct, "explanation": f"Correct is {q.correct}" if not correct else "Correct!"}
