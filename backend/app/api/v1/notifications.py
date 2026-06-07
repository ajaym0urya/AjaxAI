from fastapi import APIRouter
from app.database.db import db

router = APIRouter()

@router.get("/")
async def list_notifications():
  notifications = db.notifications.list()
  # Sort descending by date
  return sorted(notifications, key=lambda x: x.get("createdAt", ""), reverse=True)

@router.post("/read")
async def mark_notifications_read():
  notifications = db.notifications.list()
  for notif in notifications:
    if not notif.get("read", False):
      db.notifications.update(notif.get("id"), { "read": True })
  return { "success": True }
