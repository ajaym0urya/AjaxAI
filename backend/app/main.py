import os
import json
import uuid
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AjaxApply Mock Auth API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock DB configuration
DB_FILE = os.path.join(os.path.dirname(__file__), "..", "temp_db.json")

def load_db():
    if not os.path.exists(DB_FILE):
        return {"users": {}}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"users": {}}

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

# Models
class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str

class SignInRequest(BaseModel):
    email: str
    password: str

# Endpoints
@app.post("/api/signup")
def signup(req: SignUpRequest):
    db = load_db()
    
    # Check if email exists
    for uid, udata in db["users"].items():
        if udata["email"] == req.email:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    user_id = str(uuid.uuid4())
    db["users"][user_id] = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "password": req.password # Mock plaintext storage as requested
    }
    
    save_db(db)
    return {"status": "success", "user_id": user_id, "name": req.name, "email": req.email}

@app.post("/api/signin")
def signin(req: SignInRequest):
    db = load_db()
    
    for uid, udata in db["users"].items():
        if udata["email"] == req.email and udata["password"] == req.password:
            return {"status": "success", "user_id": uid, "name": udata["name"], "email": udata["email"]}
            
    raise HTTPException(status_code=401, detail="Invalid email or password")
