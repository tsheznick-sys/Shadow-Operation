
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import time, json
from models.database import get_session, Flow
from pydantic import BaseModel
from typing import Optional
router=APIRouter()
class FlowCreate(BaseModel):
    name: str; trigger_type: str; trigger_value: Optional[str]=None; platform: str="all"; status: str="draft"; nodes_json: str="{}"
@router.get("/")
def list_flows(session: Session=Depends(get_session)):
    return {"flows": session.exec(select(Flow)).all()}
@router.post("/")
def create_flow(data: FlowCreate, session: Session=Depends(get_session)):
    f=Flow(**data.model_dump(), created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    session.add(f); session.commit(); session.refresh(f); return f
@router.get("/{flow_id}")
def get_flow(flow_id: int, session: Session=Depends(get_session)):
    return session.get(Flow, flow_id) or {"error":"not found"}
@router.put("/{flow_id}")
def update_flow(flow_id: int, data: FlowCreate, session: Session=Depends(get_session)):
    f=session.get(Flow, flow_id)
    if not f: return {"error":"not found"}
    for k,v in data.model_dump().items(): setattr(f,k,v)
    session.add(f); session.commit(); session.refresh(f); return f
@router.delete("/{flow_id}")
def delete_flow(flow_id: int, session: Session=Depends(get_session)):
    f=session.get(Flow, flow_id)
    if f: session.delete(f); session.commit()
    return {"ok":True}
@router.post("/seed-demo")
def seed_demo(session: Session=Depends(get_session)):
    demos=[{"name":"Keyword VAULT → Whop Checkout","trigger_type":"keyword","trigger_value":"VAULT","platform":"all","status":"live","nodes_json":json.dumps({"nodes":[{"type":"message","data":{"text":"Vault unlocked"}}]})},{"name":"Welcome","trigger_type":"welcome","trigger_value":"","platform":"all","status":"live","nodes_json":json.dumps({"nodes":[{"type":"message","data":{"text":"Welcome"}}]})},{"name":"Default Reply","trigger_type":"default_reply","trigger_value":"","platform":"all","status":"live","nodes_json":json.dumps({"nodes":[{"type":"ai","data":{"ai_mode":"support"}}]})},{"name":"Post-Purchase","trigger_type":"whop_purchase","trigger_value":"","platform":"all","status":"live","nodes_json":json.dumps({"nodes":[{"type":"message","data":{"text":"Purchased!"}}]})}]
    created=[]
    for d in demos:
        f=Flow(**d, created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ")); session.add(f); created.append(f)
    session.commit(); return {"seeded": len(created)}
