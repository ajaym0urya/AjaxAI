import datetime
from fastapi import APIRouter, HTTPException
from app.database.db import db
from app.websocket_manager import manager

router = APIRouter()

@router.get("/")
async def list_intent_recoveries():
  return db.intentRecoveries.list()

@router.get("/signals")
async def list_intent_signals():
  return db.intentSignals.list()

@router.post("/{recovery_id}/resurrect")
async def resurrect_context(recovery_id: str):
  recovery = db.intentRecoveries.get(recovery_id)
  if not recovery:
    raise HTTPException(status_code=404, detail="Recovery target not found")

  # Update status
  updated_recovery = db.intentRecoveries.update(recovery_id, { "status": "resurrected" })

  normalized_title = recovery.get("title", "")\
    .replace("Unfinished ", "")\
    .replace("Abandoned ", "")\
    .replace("Stalled ", "")

  # Create objective
  obj_id = f"obj_res_{int(datetime.datetime.utcnow().timestamp()*1000)}"
  new_objective = {
    "id": obj_id,
    "userId": "usr_admin",
    "title": normalized_title,
    "description": f"{recovery.get('description', '')}\n\n[Resurrected Context]: {recovery.get('originalContextSnippet', '')}",
    "complexity": "Medium",
    "status": "Active",
    "milestones": ["Analyze Resurrected Context", "Scaffold Action Plan", "Execute Task Sequence"],
    "blockers": [],
    "dependencies": [],
    "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "progressScore": 20,
    "momentumScore": 90,
    "stallScore": 0,
    "riskScore": 10,
    "completionProbability": 40,
    "intentStrength": 95,
    "recoveryPriority": 0
  }
  db.objectives.create(new_objective)

  # Create sequential tasks
  task1_id = f"tsk_res_{int(datetime.datetime.utcnow().timestamp()*1000)}_1"
  task1 = {
    "id": task1_id,
    "objectiveId": obj_id,
    "title": f"Analyze context: {recovery.get('title')}",
    "description": f"Evaluate original details: \"{recovery.get('originalContextSnippet')}\"",
    "status": "InProgress",
    "priority": "High",
    "order": 1,
    "dependencies": [],
    "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"
  }
  db.tasks.create(task1)

  task2_id = f"tsk_res_{int(datetime.datetime.utcnow().timestamp()*1000)}_2"
  task2 = {
    "id": task2_id,
    "objectiveId": obj_id,
    "title": f"Execute: {recovery.get('suggestedNextAction')}",
    "description": "Follow through on the resurrected next action step.",
    "status": "Pending",
    "priority": "High",
    "order": 2,
    "dependencies": [task1_id],
    "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"
  }
  db.tasks.create(task2)

  # Create memory log
  db.memories.create({
    "id": f"mem_res_{int(datetime.datetime.utcnow().timestamp()*1000)}",
    "type": "intent",
    "content": f"Resurrected Objective \"{new_objective.get('title')}\" from recovery database. Action step queued.",
    "tags": ["intent-recovery", "resurrection"],
    "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
  })

  # Broadcast event
  await manager.broadcast("context_resurrected", {
    "recovery": updated_recovery,
    "objective": new_objective
  })

  return { "success": True, "objective": new_objective }
