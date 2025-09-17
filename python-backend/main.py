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

class formBody(BaseModel):
    action:str
    payload:List[dict]
    
# keeps track of all the triggered events
trigger_events = []

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


# Form-Trigger Event Listener
@app.post("/form/{workflow_id}")
def trigger_event(workflow_id:str,formBody:formBody,db:Session=Depends(get_db)):
    trigger_output = {}
    trigger_output["workflow_id"] = workflow_id
    trigger_output["payload"] = formBody
    trigger_output["status"] = "pending"
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    trigger_output["workflow"]= workflow
    trigger_events.append(trigger_output)
    print(trigger_events)
    return {"data":"Event Triggered!!!"}



mock_data = {
    "id": str(uuid.uuid4()), 
    "title": "My First Workflow",
    "enabled": True,
    "nodes": [
        {
            "id": str(uuid.uuid4()),
            "data": {
                "id": "form-node-1",
                "name": "Form",
                "type": "form",
                "fields": [
                    {
                        "form_field": "text",
                        "form_label": "Name",
                        "form_value": "randomUser"
                    },
                    {
                        "form_field": "text",
                        "form_label": "Email",
                        "form_value": "example@gmail.com"
                    }
                ]
            },
            "type": "taskNode",
            "position": {"x": 100, "y": 150},
        },
        {
            "id": str(uuid.uuid4()),
            "data": {
                "id": "gmail-node-1",
                "name": "Gmail",
                "type": "gmail",
                "to_send": "Hello you are accepted",
                "to": "example@gmail.com", 
                "subject": "Message"
            },
            "type": "taskNode",
            "position": {"x": 400, "y": 200},
        },
    ],
    "connections": [
        {
            "id": f"edge-{uuid.uuid4()}",
            "source": "form-node-1",
            "target": "gmail-node-1"
        }
    ]
}
# class Nodes(BaseModel):

def execute_nodes(workflow):
    nodes=workflow["nodes"]
    for node in nodes:
        print("label",node["data"]["type"])
        execute_node_type = node["data"]["type"]
        print(execute_node_type)
        # if

# execute_nodes(mock_data)