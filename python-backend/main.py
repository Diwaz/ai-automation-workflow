from typing import Union,List
import uuid
from datetime import datetime,timezone
from sqlalchemy import create_engine,Column,Integer,String,ForeignKey,JSON,DateTime,Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base,sessionmaker,relationship,Session
from sqlalchemy.sql import expression
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import DateTime
from fastapi import FastAPI,Depends,HTTPException
from pydantic import BaseModel
from uuid import UUID as UUIDv2

app = FastAPI()

# create engine
engine= create_engine('postgresql://postgres:admin@localhost:5432/postgres')
# base class for modals
Base = declarative_base()

class utcnow(expression.FunctionElement):
    type = DateTime()
    inherit_cache = True

@compiles(utcnow, "postgresql")
def pg_utcnow(element, compiler, **kw):
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"

class User(Base):
    __tablename__ = "User"

    id = Column(String,primary_key=True,index=True,default=uuid.uuid4)
    username = Column(String,nullable=False,unique=True)
    email = Column(String,unique=True,index=True,nullable=True)
    createdAt = Column(DateTime,server_default=utcnow())
    # relationships
    workflows = relationship("Workflow",back_populates="user")
    creds = relationship("Credential",back_populates="user")

class Credential(Base):
    __tablename__ = "Credential"

    id = Column(String, primary_key=True, default=uuid.uuid4)
    title = Column(String, unique=True, nullable=False)
    provider = Column(String, nullable=False)
    apiKey = Column(String, unique=True, nullable=False)

    userId = Column(String, ForeignKey("User.id"), nullable=False)

    # relationship
    user = relationship("User", back_populates="creds")


class Workflow(Base):
    __tablename__ = "Workflow"

    id = Column(String, primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    enabled = Column(Boolean, default=True)
    nodes = Column(JSON, nullable=False)
    connections = Column(JSON, nullable=False)
    createdAt = Column(DateTime,server_default=utcnow())
    userId = Column(String, ForeignKey("User.id"), nullable=False)

    # relationship
    user = relationship("User", back_populates="workflows")
# create tables in db 

# session in db 
SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

class WorkflowResponse(BaseModel):
    id: str
    title: str
    enabled:bool
    nodes:List[dict]
    connections:List[dict]
    userId: str

    class Config:
        orm_mode = True

class UUIDbody(BaseModel):
    userId: str


@app.post("/api/v1/workflows/get",response_model=List[WorkflowResponse])
def get_workflow(body:UUIDbody,db:Session = Depends(get_db)):
    print("******************userId*******************",body.userId)
    if not body.userId:
        raise HTTPException(status_code=400,detail="Invalid User Id")
    workflows = db.query(Workflow).filter(Workflow.userId == body.userId).all()
    return workflows


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
