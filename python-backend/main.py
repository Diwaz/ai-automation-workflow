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
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()
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
    return {"data":"Event Triggered !!"}

async def worker():
    while True:
        if trigger_events:
            print("Executing workflow started")
            job = trigger_events.pop(0)
            trigger_output = job["payload"]
            # print("receiver",trigger_output.payload[0]["to"])
            receiver = trigger_output.payload[0]["to"]
            workflow = job["workflow"]
            nodes= workflow.nodes
            # print(":::::WORKKKKFLOWW::::",workflow.nodes[1])
            for node in nodes:
                # print("::::NODE::::",node["data"]["type"])
                type = node["data"]["type"]
                if node["data"]["count"] > 1:
                    if type == "telegram":
                        print("Message sent to telegram")
                        res = sendMail(receiver,"Telegram")
                        print("tg res",res)
                    elif type == "whatsapp":
                        print("Message sent to whatsapp")
                        res = sendMail(receiver,"Whatsapp")
                        print("whatsapp res",res)
                    else:
                        print("Message not sent")
            print("Workflow ended")
        await asyncio.sleep(1)

def sendMail(receiver:str,messageBody:str):
    smtp_server="smtp.gmail.com"
    port= 587
    secret = os.getenv("GMAIL_APP_PASS")
    sender_email= "y2kdwz@gmail.com"
    password=secret
    receiver_email = receiver
    try: 
        message = MIMEMultipart("alternative")
        message["Subject"] = "Welcome to 100xDevs"
        message["From"] = sender_email
        message["To"] = receiver_email

        text = "Hello, This mail is from 100xdevs congratulation welcome to the server"
        html = f"""\
            <html>
                <body>
                    <p> Hi,<br>
                    This is an official mail sent from SMTP server
                    sent by ---------------------{messageBody}
                    </p>
                </body>
            </html>
                """
        part1 = MIMEText(text,"plain")
        part2= MIMEText(html,"html")
        message.attach(part1)
        message.attach(part2)

        with smtplib.SMTP(smtp_server,port) as server:
            server.starttls()
            server.login(sender_email,password)
            server.sendmail(sender_email,receiver_email,message.as_string())
            return "Success"
        
    except Exception as e:
        print("failed to send mail")
        return "Failed"

@app.on_event("startup")
async def start_worker():
    asyncio.create_task(worker())

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