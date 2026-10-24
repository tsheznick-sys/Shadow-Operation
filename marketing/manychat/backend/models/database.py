
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
class Subscriber(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    platform: str=Field(index=True)
    platform_user_id: str=Field(index=True)
    name: Optional[str]=None
    avatar: Optional[str]=None
    tags: str=""
    custom_fields: str="{}"
    status: str="active"
    source: Optional[str]=None
    creator_ref: Optional[str]=None
    whop_customer_id: Optional[str]=None
    whop_purchased: bool=False
    last_message_at: Optional[str]=None
    created_at: str=""
class Flow(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    name: str
    trigger_type: str
    trigger_value: Optional[str]=None
    platform: str="all"
    status: str="draft"
    nodes_json: str="{}"
    created_at: str=""
class MessageLog(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    subscriber_id: int=Field(foreign_key="subscriber.id", index=True)
    direction: str
    channel: str
    body: str
    flow_id: Optional[int]=None
    created_at: str=""
class Broadcast(SQLModel, table=True):
    id: Optional[int]=Field(default=None, primary_key=True)
    name: str
    flow_id: int=Field(foreign_key="flow.id")
    audience_filter: str="{}"
    status: str="draft"
    scheduled_at: Optional[str]=None
    sent_count: int=0
