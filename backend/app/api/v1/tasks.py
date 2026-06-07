from fastapi import APIRouter
from typing import Optional
from app.database.db import db

router = APIRouter()

@router.get("/")
async def list_tasks(objectiveId: Optional[str] = None):
  tasks = db.tasks.list()
  if objectiveId:
    tasks = [t for t in tasks if t.get("objectiveId") == objectiveId]
  return sorted(tasks, key=lambda x: x.get("order", 0))
