import datetime
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.database.db import db

router = APIRouter()

class CreateMemoryRequest(BaseModel):
  content: str
  type: Optional[str] = "semantic"
  tags: Optional[List[str]] = []

@router.get("/")
async def list_memories():
  return db.memories.list()

@router.post("/")
async def create_memory(req: CreateMemoryRequest):
  memory_id = f"mem_{int(datetime.datetime.utcnow().timestamp()*1000)}"
  memory = {
    "id": memory_id,
    "type": req.type,
    "content": req.content,
    "tags": req.tags,
    "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
  }
  db.memories.create(memory)
  
  # Inject dynamic Node in Knowledge Graph
  node_id = f"kn_mem_{int(datetime.datetime.utcnow().timestamp()*1000)}"
  db.knowledgeNodes.create({
    "id": node_id,
    "type": "document",
    "label": f"Clipped: {req.content[:20]}...",
    "properties": { "memoryId": memory_id, "source": "Chrome Extension" },
    "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
  })

  return memory
