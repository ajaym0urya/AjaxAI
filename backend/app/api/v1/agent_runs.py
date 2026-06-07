from fastapi import APIRouter
from typing import Optional
from app.database.db import db

router = APIRouter()

@router.get("/")
async def list_agent_runs(objectiveId: Optional[str] = None):
  runs = db.agentRuns.list()
  if objectiveId:
    runs = [r for r in runs if r.get("objectiveId") == objectiveId]
  return runs
