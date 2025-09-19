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
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class UpdateWorkflow(BaseModel):
    id:str
    title:str
    enabled:bool
    nodes:List[dict]
    connections:List[dict]
    userId:str

class UUIDbody(BaseModel):
    userId: str

class formBody(BaseModel):
    action:str
    payload:List[dict]

# keeps track of all the triggered events
trigger_events = []

@app.post("/api/v1/workflows/get",response_model=List[WorkflowResponse])
def get_workflows(body:UUIDbody,db:Session = Depends(get_db)):
    print("******************userId*******************",body.userId)
    if not body.userId:
        raise HTTPException(status_code=400,detail="Invalid User Id")
    workflows = db.query(Workflow).filter(Workflow.userId == body.userId).all()
    return workflows


@app.get("/workflow/{workflow_id}")
def get_workflow(workflow_id:str,db:Session=Depends(get_db)):
    if not workflow_id:
        raise HTTPException(status_code=400,detail="Invalid User Id")
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        print("DATA:::::::::::",workflow)
    except Exception as e:
        return {"error": e}

    return {workflow}

@app.patch("/workflow/{workflow_id}")
def update_workflow(workflow_id:str,updatedBody:UpdateWorkflow,db:Session =Depends(get_db)):
    if not workflow_id:
        raise HTTPException(status_code=400,detail="Invalid User Id")
    try:
        print("workflowid",updatedBody.id)
        updated_data = updatedBody.dict(exclude_unset=True)
        db.query(Workflow).filter(Workflow.id == workflow_id).update(
            updated_data
        )
        db.commit()
    except Exception as e:
        return {"error": str(e)}

    return {"Updated"}


# Form-Trigger Event Listener
@app.post("/form/{workflow_id}")
def trigger_event(workflow_id:str,formBody:formBody,db:Session=Depends(get_db)):
    trigger_output = {}
    print("reached here")
    trigger_output["workflow_id"] = workflow_id
    trigger_output["payload"] = formBody
    print("form body",formBody)
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
            receiver = trigger_output.payload[0]["email"]
            print("email",receiver)
            workflow = job["workflow"]
            nodes= workflow.nodes
            # print(":::::WORKKKKFLOWW::::",workflow.id)
            workflowId = workflow.id
            response_from_node = {}
            for node in nodes:
                # print("::::NODE::::",node)
                type = node["data"]["type"]
                if node["data"]["count"] > 1:
                    count = node["data"]["count"]
                    if type == "telegram":
                        print("Message sent to telegram")
                        inputToNode=find_response(response_from_node,workflowId,count)
                        res = sendMail(receiver,inputToNode)
                        # print("tg res",res)
                        print("tg res")
                        store_response(response_from_node,workflowId,count,True,'response from tele')
                    elif type == "whatsapp":
                        inputToNode =find_response(response_from_node,workflowId,count)
                        print("input to this node",response_from_node)
                        print("Message sent to whatsapp")
                        res = sendMail(receiver,inputToNode)
                        # print("whatsapp res",res)
                        print("whatsapp res")
                        store_response(response_from_node,workflowId,count,False,'')
                    elif type == "aiagent":
                        find_response(response_from_node,workflowId,count)
                        print("calling ai agent")
                        res = call_llm()
                        store_response(response_from_node,workflowId,count,True,res)
                    else:
                        print("Message not sent")
            print("Workflow ended")
        await asyncio.sleep(1)

def find_response(payload:dict,id:str,count:int):
    print("To find wheather the prev node provide any output")
    newCountId = count-1
    code = f"f{id}-{str(newCountId)}"
    print("code to add",code)
    if len(payload) == 0:
        print("reached here in empty")
        return False
    if payload[code]["response"]:
        print("output exist")
        output = payload[code]["output"]
        return output 
    return False

def store_response(payload:dict,id:str,count:int,response:bool,output:str):
    newCountId = count
    code = f"f{id}-{str(newCountId)}"

    if code not in payload:
        payload[code]= {}
    
    payload[code]["response"] = True
    payload[code]['output'] = output

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

        if messageBody == 'False':
            messageBody = "Thanks For Apply to 100xDevs Now Wait for further processing"

        text = "Hello, This mail is from 100xdevs congratulation welcome to the server"
        html = f"""\
            <html>
                <body>
                    <p> Hi,<br>
                    {messageBody}
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

def call_llm():
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

    result = llm.invoke("You are an email assistant send a very short email congratulating joining to 100xSchool also give slight hint that this message was executed after different node execution and finally reached the ai part")
    # print (result.content)
    return result.content


@app.on_event("startup")
async def start_worker():
    asyncio.create_task(worker())

