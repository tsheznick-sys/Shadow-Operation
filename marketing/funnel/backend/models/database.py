
from sqlmodel import SQLModel, create_engine, Session, Field
from typing import Optional
import os
DATABASE_URL=os.getenv("DATABASE_URL","sqlite:///./data.db")
connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine=create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
def init_db():
    SQLModel.metadata.create_all(engine)
def get_session():
    with Session(engine) as session: yield session
class Funnel(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    name: str
    funnel_type: str
    niche: str = "Niche #2: Applied AI Video"
    status: str = "draft"
    value_ladder_json: str = "{}"
    steps_order: str = "[]"
    creator_ref: Optional[str]=None
    whop_store_url: Optional[str]=None
    created_at: str=""
class FunnelStep(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    funnel_id: int=Field(foreign_key="funnel.id", index=True)
    step_type: str
    name: str
    order: int=0
    page_id: Optional[int]=None
    order_bump_product: Optional[str]=None
    oto_product: Optional[str]=None
    downsell_product: Optional[str]=None
    hso_json: str="{}"
class Page(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    funnel_step_id: Optional[int]=Field(default=None, foreign_key="funnelstep.id")
    title: str
    slug: str=Field(index=True)
    builder_json: str="{}"
    headline: Optional[str]=None
    hook: Optional[str]=None
    story: Optional[str]=None
    offer: Optional[str]=None
    seo_title: Optional[str]=None
    published: bool=False
