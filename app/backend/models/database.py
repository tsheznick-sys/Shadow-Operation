
from sqlmodel import SQLModel, create_engine, Session, Field
from typing import Optional
import os

# Single unified DATABASE_URL — sqlite for local, override with postgres in prod
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
# Also allow separate legacy env names
if not os.getenv("DATABASE_URL") and os.getenv("DATABASE_SHADOW"):
    DATABASE_URL = os.getenv("DATABASE_SHADOW")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# ===== Publisher (3 owned pages @shadow.cinema.ai / @shadow.edits.ai / @vault.prompt.lab) =====
class ContentItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    creator_account_id: Optional[int] = Field(default=None, index=True)
    page: str = Field(index=True)
    platform: str = "instagram"
    hook: str
    story: str
    offer: str
    caption: str
    prompt_id: Optional[str] = None
    render_path: Optional[str] = None
    status: str = "draft"
    scheduled_at: Optional[str] = None
    created_at: str = ""

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content_id: int = Field(foreign_key="contentitem.id")
    platform: str
    external_id: Optional[str] = None
    status: str = "pending_approval"
    published_at: Optional[str] = None

# ===== Funnel (ClickFunnels + Brunson tripwire) =====
class Funnel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    funnel_type: str
    niche: str = "Niche #2: Applied AI Video"
    status: str = "draft"
    value_ladder_json: str = "{}"
    steps_order: str = "[]"
    creator_ref: Optional[str] = None
    whop_store_url: Optional[str] = None
    created_at: str = ""

class FunnelStep(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    funnel_id: int = Field(foreign_key="funnel.id", index=True)
    step_type: str
    name: str
    order: int = 0
    page_id: Optional[int] = None
    order_bump_product: Optional[str] = None
    oto_product: Optional[str] = None
    downsell_product: Optional[str] = None
    hso_json: str = "{}"

class Page(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    funnel_step_id: Optional[int] = Field(default=None, foreign_key="funnelstep.id")
    title: str
    slug: str = Field(index=True)
    builder_json: str = "{}"
    headline: Optional[str] = None
    hook: Optional[str] = None
    story: Optional[str] = None
    offer: Optional[str] = None
    seo_title: Optional[str] = None
    published: bool = False

# ===== ManyChat (subscribers/flows/broadcasts + 8 platforms) =====
class Subscriber(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    platform: str = Field(index=True)
    platform_user_id: str = Field(index=True)
    name: Optional[str] = None
    avatar: Optional[str] = None
    tags: str = ""
    custom_fields: str = "{}"
    status: str = "active"
    source: Optional[str] = None
    creator_ref: Optional[str] = None
    whop_customer_id: Optional[str] = None
    whop_purchased: bool = False
    last_message_at: Optional[str] = None
    created_at: str = ""

class Flow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    trigger_type: str
    trigger_value: Optional[str] = None
    platform: str = "all"
    status: str = "draft"
    nodes_json: str = "{}"
    created_at: str = ""

class MessageLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    subscriber_id: int = Field(foreign_key="subscriber.id", index=True)
    direction: str
    channel: str
    body: str
    flow_id: Optional[int] = None
    created_at: str = ""

class Broadcast(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    flow_id: int = Field(foreign_key="flow.id")
    audience_filter: str = "{}"
    status: str = "draft"
    scheduled_at: Optional[str] = None
    sent_count: int = 0

# ===== Auth (creator accounts) =====
class CreatorAccount(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    handle: str = Field(index=True)
    niche: Optional[str] = None
    whop_user_id: Optional[str] = None
    status: str = "active"
    created_at: str = ""
