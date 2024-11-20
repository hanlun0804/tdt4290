from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from whisper.Manager import Manager
from dataclasses import asdict
from fastapi import FastAPI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],   
)

manager = Manager("95426951", language="en")

@app.get("/{phone_no}")
async def get_question(phone_no):
    global manager

    if not manager.is_current_customer(phone_no):
        manager = Manager(phone_no, language="en")
    
    response = manager.get_next_question()
    return JSONResponse(status_code=200, content=asdict(response))