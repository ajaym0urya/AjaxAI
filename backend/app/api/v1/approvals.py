import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.db import db
from app.websocket_manager import manager

router = APIRouter()

class ResolveApprovalRequest(BaseModel):
  status: str # 'approved' | 'rejected'

@router.get("/")
async def list_approvals():
  return db.approvals.list()

@router.post("/{approval_id}/resolve")
async def resolve_approval(approval_id: str, req: ResolveApprovalRequest):
  appr = db.approvals.get(approval_id)
  if not appr:
    raise HTTPException(status_code=404, detail="Approval request not found")
  
  updated_appr = db.approvals.update(approval_id, {
    "status": req.status,
    "resolvedBy": "Alex Carter",
    "resolvedAt": datetime.datetime.utcnow().isoformat() + "Z"
  })

  # Reset Objective and Task states based on user approval
  new_status = "Active" if req.status == "approved" else "Blocked"
  db.objectives.update(appr.get("objectiveId"), {
    "status": new_status,
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"
  })

  task_status = "InProgress" if req.status == "approved" else "Blocked"
  db.tasks.update(appr.get("taskId"), {
    "status": task_status,
    "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"
  })

  # Broadcast event
  await manager.broadcast("approval_resolved", updated_appr)

  return updated_appr
