import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.database.db import db
from app.workers.celery import run_objective_swarm_task
from app.websocket_manager import manager

router = APIRouter()

class CreateObjectiveRequest(BaseModel):
  title: str
  description: str
  complexity: Optional[str] = "Medium"

@router.get("/")
async def list_objectives():
  return db.objectives.list()

@router.post("/")
async def create_objective(req: CreateObjectiveRequest):
  obj_id = f"obj_{int(datetime.datetime.utcnow().timestamp()*1000)}"
  objective = {
    "id": obj_id,
    "userId": "usr_admin",
    "title": req.title,
    "description": req.description,
    "complexity": req.complexity,
    "status": "Draft",
    "milestones": [],
    "blockers": [],
    "dependencies": [],
    "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "progressScore": 0,
    "momentumScore": 0,
    "stallScore": 0,
    "riskScore": 0,
    "completionProbability": 0,
    "intentStrength": 50,
    "recoveryPriority": 0
  }
  db.objectives.create(objective)
  
  # Broadcast event
  await manager.broadcast("objective_created", objective)
  return objective

@router.post("/{objective_id}/execute")
async def execute_objective(objective_id: str, background_tasks: BackgroundTasks):
  obj = db.objectives.get(objective_id)
  if not obj:
    raise HTTPException(status_code=404, detail="Objective not found")
  
  updated = db.objectives.update(objective_id, {
    "status": "Active",
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"
  })

  # Broadcast event
  await manager.broadcast("objective_activated", updated)

  # Trigger Celery background task if broker is connected, or trigger local async fallback task
  try:
    run_objective_swarm_task.delay(objective_id)
  except Exception as e:
    print(f"[API Server Alert] Celery broker not available, falling back to FastAPI BackgroundTasks: {e}")
    # Async background task fallback
    from app.agent_runtime.orchestrator import ChiefOrchestratorAgent
    async def local_runner():
      orchestrator = ChiefOrchestratorAgent()
      await orchestrator.coordinate_swarm(objective_id)
    background_tasks.add_task(local_runner)

  return updated
