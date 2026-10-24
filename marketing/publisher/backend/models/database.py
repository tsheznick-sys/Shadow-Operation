
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
class ContentItem(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    creator_account_id: Optional[int]=Field(default=None, index=True)
    page: str = Field(index=True)
    platform: str = "instagram"
    hook: str; story: str; offer: str; caption: str
    prompt_id: Optional[str]=None
    render_path: Optional[str]=None
    status: str="draft"
    scheduled_at: Optional[str]=None
    created_at: str=""
class Post(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    content_id: int=Field(foreign_key="contentitem.id")
    platform: str
    external_id: Optional[str]=None
    status: str="pending_approval"
    published_at: Optional[str]=None
