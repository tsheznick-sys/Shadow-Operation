from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
import time, json
from models.database import get_session, Funnel, FunnelStep
router = APIRouter()

class FunnelCreate(BaseModel):
    name: str; slug: str; funnel_type: str = "tripwire"; niche: Optional[str] = "Niche #2: Applied AI Video"; creator_ref: Optional[str] = None; whop_store_url: Optional[str] = "https://whop.com/shadow-vault-niche2"

@router.get("/")
def list_funnels(session: Session = Depends(get_session)):
    funnels = session.exec(select(Funnel)).all()
    if not funnels:
        # Return demo if DB empty (for docs), but mark as DB
        return {"funnels": [{"id": 1, "name": "Vault Tripwire", "slug": "vault-tripwire", "funnel_type": "tripwire", "pages": ["squeeze","tripwire","oto","thankyou"], "aov": "$42", "whop": "https://whop.com/shadow-vault-niche2?ref=@shadow.cinema.ai", "_note": "DB empty — run POST /api/funnels/seed-tripwire to create real DB funnel with 4 pages"}], "db": "empty, demo fallback"}
    out = []
    for f in funnels:
        steps = session.exec(select(FunnelStep).where(FunnelStep.funnel_id == f.id)).all()
        out.append({"id": f.id, "name": f.name, "slug": f.slug if hasattr(f, 'slug') else f.name.lower().replace(" ", "-"), "funnel_type": f.funnel_type, "status": f.status, "steps": len(steps), "whop_store_url": f.whop_store_url, "steps_detail": steps})
    return {"funnels": out, "db": "live"}

@router.post("/")
def create_funnel(data: FunnelCreate, session: Session = Depends(get_session)):
    f = Funnel(name=data.name, funnel_type=data.funnel_type, whop_store_url=data.whop_store_url, creator_ref=data.creator_ref, status="draft", created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ"), niche=data.niche or "Niche #2")
    # store slug in niche or value_ladder if no slug field — Funnel model has no slug column, use value_ladder_json to hold slug
    f.value_ladder_json = json.dumps({"slug": data.slug, "value_ladder": data.niche})
    session.add(f); session.commit(); session.refresh(f)
    return {"id": f.id, "funnel": f, "next": "Add pages via POST /api/pages or POST /api/funnels/seed-tripwire"}

@router.post("/seed-tripwire")
def seed_tripwire(session: Session = Depends(get_session)):
    # Create Vault Tripwire funnel with 4 steps + 4 pages (Brunson ladder)
    funnel = Funnel(name="Vault Tripwire", funnel_type="tripwire", status="live", whop_store_url="https://whop.com/shadow-vault-niche2", creator_ref="@shadow.cinema.ai", niche="Niche #2: Applied AI Video", value_ladder_json=json.dumps({"slug": "vault-tripwire", "aov": "$42", "stack": "$497→$27", "bump": "$9", "oto": "$79", "continuity": "$19/mo"}), created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    session.add(funnel); session.commit(); session.refresh(funnel)
    steps_data = [
        {"step_type": "squeeze", "name": "Squeeze — Free Chapter", "order": 1, "hso": {"hook": "20h→20m: Free chapter (35 prompts)", "story": "Old way 20h client, new 1 prompt → Veo3. Epiphany Bridge.", "offer": "Email → free chapter PDF + Loom 1"}},
        {"step_type": "checkout", "name": "Tripwire — $27 Vault Lite", "order": 2, "hso": {"hook": "Client paid $0 → I charged $250. One prompt.", "story": "Same phone, different prompt: anamorphic golden hour 35mm. Notion OS.", "offer": "$27 Vault Lite (5 automations, Whop checkout ?ref=)"}, "order_bump_product": "Prompt Pack $9", "oto_product": "Vault $79"},
        {"step_type": "oto", "name": "OTO — $79 Vault", "order": 3, "hso": {"hook": "Vault Stack $497→$79 today", "story": "Vault $79 + E-book $49 + Notion $29 + Looms $79 + Presets $47", "offer": "One-click OTO $79 (60/40 split via Whop)"}, "oto_product": "Vault $79"},
        {"step_type": "thankyou", "name": "Thank You + Continuity $19/mo", "order": 4, "hso": {"hook": "One prompt = one render. Not 50 tries.", "story": "Daily prompt lab: 1:1 prompt→render. Fail = prompting like chat not DP.", "offer": "Join $19/mo Prompt Lab — 30 prompts/mo + updates"}},
    ]
    from models.database import Page
    created_steps = []
    created_pages = []
    for sd in steps_data:
        step = FunnelStep(funnel_id=funnel.id, step_type=sd["step_type"], name=sd["name"], order=sd["order"], order_bump_product=sd.get("order_bump_product"), oto_product=sd.get("oto_product"), hso_json=json.dumps(sd["hso"]))
        session.add(step); session.commit(); session.refresh(step)
        # Create page for step
        page = Page(title=sd["name"], slug=f"vault-tripwire/{sd['step_type']}", funnel_step_id=step.id, headline=sd["hso"]["hook"], hook=sd["hso"]["hook"], story=sd["hso"]["story"], offer=sd["hso"]["offer"], builder_json=json.dumps({"sections": [{"type": "headline", "text": sd["hso"]["hook"]}, {"type": "video", "src": "loom placeholder"}, {"type": "whop_checkout", "url": "https://whop.com/shadow-vault-niche2?ref=@shadow.cinema.ai"}, {"type": "order_bump", "product": sd.get("order_bump_product")}, {"type": "countdown", "minutes": 15}]}), published=True)
        session.add(page); session.commit(); session.refresh(page)
        step.page_id = page.id; session.add(step); session.commit()
        created_steps.append(step); created_pages.append(page)
    return {"funnel": funnel, "steps": created_steps, "pages": created_pages, "whop": "https://whop.com/shadow-vault-niche2?ref=@shadow.cinema.ai", "check": "GET /api/pages + GET /api/funnels + frontend Builder at 3001 will show 4 pages with Whop checkout"}
