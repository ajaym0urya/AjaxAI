from app.agent_runtime.agent_base import BaseAgent
from typing import Dict, Any

class SecurityAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Security Agent",
      role="Audits task boundaries and security rules",
      capabilities=["compliance", "safety_clearance"]
    )

  async def check_safety(self, task: Dict[str, Any], log_fn) -> bool:
    title = task.get("title", "").lower()
    await log_fn(f"[Security Agent] Auditing task payload: '{task.get('title')}'")
    if "apply" in title or "submit" in title:
      return False # Needs human approval
    return True
