import json
from typing import List, Dict, Any

class BaseAgent:
  def __init__(self, name: str, role: str, capabilities: List[str]):
    self.name = name
    self.role = role
    self.capabilities = capabilities
    self.objectives: List[str] = []
    self.state: str = "Idle" # "Idle" | "Thinking" | "Running" | "Paused" | "Healing"
    self.task_queue: List[Dict[str, Any]] = []
    self.memory_context: List[str] = []

  def get_status(self) -> Dict[str, Any]:
    return {
      "name": self.name,
      "role": self.role,
      "capabilities": self.capabilities,
      "objectives": self.objectives,
      "state": self.state,
      "task_queue": self.task_queue,
      "memory_context": self.memory_context
    }

  async def post_message(self, message: str, to_agent: str, run_id: str):
    from app.database.db import db
    import datetime
    db.agentMessages.create({
      "id": f"msg_{int(datetime.datetime.utcnow().timestamp()*1000)}",
      "agentRunId": run_id,
      "fromAgent": self.name,
      "toAgent": to_agent,
      "content": message,
      "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })

  async def process(self, input_str: str, context: Dict[str, Any]) -> str:
    raise NotImplementedError("Each agent must implement its own process logic.")
