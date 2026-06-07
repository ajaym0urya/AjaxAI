import datetime
from typing import List, Dict, Any
from app.agent_runtime.agent_base import BaseAgent
from app.database.db import db
from app.agent_runtime.llm_client import generate_json

class PlannerAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Planner Agent",
      role="Decomposes objectives into milestone roadmaps",
      capabilities=["roadmapping", "task_generation"]
    )

  async def decompose_objective(self, objective: Dict[str, Any], log_fn) -> List[Dict[str, Any]]:
    await log_fn(f"Ajax is building a custom learning roadmap for '{objective.get('title')}'")
    
    title = objective.get("title", "")

    # Fallback mock for when Azure keys are not yet configured
    fallback_mock = {
      "tasks": [
        { "title": "Initial Assessment", "desc": "Analyzed current status and requirements." },
        { "title": "Resource Gathering", "desc": "Collected required materials and guides." },
        { "title": "Finding opportunities", "desc": "Searching for relevant milestones." },
        { "title": "Execution Plan", "desc": "Drafted the step-by-step action plan." }
      ]
    }

    system_prompt = """
    You are an autonomous AI Chief of Staff.
    The user wants to achieve a specific goal.
    Generate a JSON object containing a list of 4 highly realistic, contextual milestones needed to achieve this goal.
    Return strictly in this format:
    {
      "tasks": [
        {"title": "Short Task Title", "desc": "One sentence description of what the AI did/will do."},
        ...
      ]
    }
    Make sure the 3rd task title is something like 'Finding opportunities' or similar, so it flows well with the UI.
    """

    user_prompt = f"Goal: {title}"

    response_data = await generate_json(system_prompt, user_prompt, fallback_mock)
    tasks_data = response_data.get("tasks", fallback_mock["tasks"])

    created_tasks = []
    for idx, t_info in enumerate(tasks_data):
      task = db.tasks.create({
        "id": f"tsk_plan_{int(datetime.datetime.utcnow().timestamp()*1000)}_{idx}",
        "objectiveId": objective.get("id"),
        "title": t_info["title"],
        "description": t_info["desc"],
        "status": "Pending",
        "priority": "High",
        "order": idx + 1,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
        "updatedAt": datetime.datetime.utcnow().isoformat() + "Z"
      })
      created_tasks.append(task)
      
    return created_tasks
