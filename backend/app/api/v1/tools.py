from fastapi import APIRouter
from app.agent_runtime.tools import ToolRegistry

router = APIRouter()

@router.get("/")
async def list_tools():
  return ToolRegistry.get_all_tools()
