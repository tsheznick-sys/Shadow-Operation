from sqlmodel import SQLModel, create_engine
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}, echo=False)
def init_db():
    SQLModel.metadata.create_all(engine)
def get_session():
    from sqlmodel import Session
    with Session(engine) as s:
        yield s
