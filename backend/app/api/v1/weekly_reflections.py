from fastapi import APIRouter
from app.database.db import db

router = APIRouter()

@router.get("/")
async def list_weekly_reflections():
  return db.weeklyReflections.list()
