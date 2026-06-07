from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.db import db
from app.websocket_manager import manager

router = APIRouter()

class UpdateStatusRequest(BaseModel):
  status: str # 'applied' | 'ignored'

@router.get("/")
async def list_opportunities():
  return db.opportunities.list()

@router.post("/{opportunity_id}/status")
async def update_opportunity_status(opportunity_id: str, req: UpdateStatusRequest):
  opp = db.opportunities.get(opportunity_id)
  if not opp:
    raise HTTPException(status_code=404, detail="Opportunity not found")
  updated = db.opportunities.update(opportunity_id, {
    "status": req.status
  })
  
  # Broadcast event
  await manager.broadcast("opportunity_updated", updated)
  return updated
