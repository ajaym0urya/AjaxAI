import datetime
from app.agent_runtime.agent_base import BaseAgent
from app.database.db import db

class KnowledgeAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Knowledge Agent",
      role="Graph mapper and semantic relationship analyzer",
      capabilities=["relation_mapping", "graph_generation"]
    )

  async def update_graph(self, task: dict, log_fn):
    await log_fn("[Knowledge Agent] Drawing semantic links on the active Knowledge Graph...")
    
    # Create Node
    node_id = f"kn_auto_{int(datetime.datetime.utcnow().timestamp()*1000)}"
    db.knowledgeNodes.create({
      "id": node_id,
      "type": "task",
      "label": task.get("title", "Active Task Checkpoint"),
      "properties": { "taskId": task.get("id"), "stage": "completed" },
      "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    })

    # Link back to main objective
    db.knowledgeEdges.create({
      "id": f"ke_auto_{int(datetime.datetime.utcnow().timestamp()*1000)}",
      "sourceNodeId": "kn_obj",
      "targetNodeId": node_id,
      "type": "depends_on",
      "label": "defines",
      "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    })
