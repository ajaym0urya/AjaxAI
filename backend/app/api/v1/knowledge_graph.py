from fastapi import APIRouter
from app.database.db import db

router = APIRouter()

@router.get("/")
async def get_graph():
  nodes = db.knowledgeNodes.list()
  edges = db.knowledgeEdges.list()
  return { "nodes": nodes, "edges": edges }
