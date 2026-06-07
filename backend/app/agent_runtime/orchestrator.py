import datetime
import asyncio
import random
from typing import Dict, Any
from app.agent_runtime.agent_base import BaseAgent
from app.database.db import db
from app.websocket_manager import manager
from app.agent_runtime.llm_client import generate_json

class ChiefOrchestratorAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Ajax",
      role="Chief of Staff",
      capabilities=["orchestration", "execution"]
    )

  async def coordinate_swarm(self, objective_id: str) -> bool:
    objective = db.objectives.get(objective_id)
    if not objective:
      return False

    self.state = "Running"
    title = objective.get("title", "")
    
    async def log_activity(msg: str):
      print(f"[Ajax] {msg}")
      db.memory.create({
        "id": f"mem_{int(datetime.datetime.utcnow().timestamp()*1000)}_{random.randint(0,999)}",
        "type": "agent_log",
        "content": msg,
        "tags": [objective_id],
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
      })
      await manager.broadcast("agent_log", {"message": msg, "objectiveId": objective_id})
      await asyncio.sleep(2)

    await log_activity(f"Ajax started working on your goal: '{title}'")

    # 1. Planner Check
    tasks = db.tasks.find(lambda t: t.get("objectiveId") == objective_id)
    if not tasks:
      from app.agent_runtime.planner import PlannerAgent
      planner = PlannerAgent()
      tasks = await planner.decompose_objective(objective, log_activity)

    # Progress some tasks
    for i, t in enumerate(tasks):
      if i < 2:
        db.tasks.update(t.get("id"), {"status": "Completed", "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"})
        await log_activity(f"Ajax {t.get('description').lower()}")
      elif i == 2:
        db.tasks.update(t.get("id"), {"status": "InProgress", "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"})

    # Update objective progress
    db.objectives.update(objective_id, {
      "progressScore": random.randint(20, 35),
      "momentumScore": 85,
      "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"
    })
    await manager.broadcast("objective_updated", {"objectiveId": objective_id})

    # 2. Discover Opportunities dynamically
    await log_activity("Ajax is searching for relevant opportunities...")

    fallback_mock = {
      "opportunities": [
        {
          "title": "General Certification Program",
          "description": "A great certification for your goal.",
          "type": "certification",
          "url": "https://example.com/certification",
          "relevanceScore": 88
        }
      ],
      "approval_request": "Register for the certification",
      "approval_reason": "Crucial first step for your roadmap.",
      "discovery_log": "Ajax found a relevant certification program."
    }

    system_prompt = """
    You are an autonomous AI. Given a user goal, discover 1 to 2 highly relevant real-world opportunities (e.g. specific jobs, programs, open source projects, certifications).
    Also, generate a natural language log message describing what you found.
    Also, generate a proposed action that requires user approval.
    Return strictly as JSON:
    {
      "opportunities": [
        {"title": "...", "description": "...", "type": "job|certification|project", "url": "https://...", "relevanceScore": 95}
      ],
      "approval_request": "Short text of what you want to do (e.g., 'Apply for X')",
      "approval_reason": "Short reason why",
      "discovery_log": "A natural language message for the activity feed (e.g., 'Ajax found 2 high-matching roles.')"
    }
    """

    response = await generate_json(system_prompt, f"Goal: {title}", fallback_mock)
    
    for idx, opp in enumerate(response.get("opportunities", fallback_mock["opportunities"])):
      db.opportunities.create({
        "id": f"opp_{int(datetime.datetime.utcnow().timestamp()*1000)}_{idx}",
        "title": opp.get("title"),
        "description": opp.get("description"),
        "type": opp.get("type", "opportunity"),
        "url": opp.get("url", "#"),
        "relevanceScore": opp.get("relevanceScore", 85),
        "status": "new",
        "metadata": {},
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
      })

    await log_activity(response.get("discovery_log", fallback_mock["discovery_log"]))

    # 3. Create an Approval request
    approval_target = response.get("approval_request", fallback_mock["approval_request"])
    approval_reason = response.get("approval_reason", fallback_mock["approval_reason"])

    await log_activity(f"Ajax requires your approval to proceed with: {approval_target}")
    
    db.approvals.create({
      "id": f"app_{int(datetime.datetime.utcnow().timestamp()*1000)}",
      "objectiveId": objective_id,
      "taskId": tasks[2].get("id") if len(tasks) > 2 else "none",
      "actionType": "application",
      "requestDetails": approval_target,
      "reason": approval_reason,
      "status": "pending",
      "requestedBy": "Ajax",
      "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    })

    await manager.broadcast("approval_required", {"objectiveId": objective_id})

    self.state = "Idle"
    return True
