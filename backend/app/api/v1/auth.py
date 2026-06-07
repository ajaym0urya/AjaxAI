from fastapi import APIRouter
from app.database.db import db

router = APIRouter()

@router.get("/me")
async def get_current_user():
  users = db.users.list()
  if users:
    return users[0]
  return {
    "id": "usr_admin",
    "name": "Alex Carter",
    "email": "alex.carter@enterprise.com",
    "role": "Principal Engineer"
  }
