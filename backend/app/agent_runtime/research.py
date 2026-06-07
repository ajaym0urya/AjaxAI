from app.agent_runtime.agent_base import BaseAgent
from typing import Dict, Any

class ResearchAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Research Agent",
      role="Web crawler and search analyzer",
      capabilities=["search", "web_indexing"]
    )

  async def gather_info(self, task_title: str, log_fn) -> str:
    await log_fn(f"[Research Agent] Searching web databases for: '{task_title}'...")
    return f"Indexed data related to '{task_title}' showing certifications, requirements, and job listings."
