import os
import asyncio
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
  "ajaxai_workers",
  broker=REDIS_URL,
  backend=REDIS_URL
)

celery_app.conf.update(
  task_serializer="json",
  accept_content=["json"],
  result_serializer="json",
  timezone="UTC",
  enable_utc=True,
)

@celery_app.task(name="app.workers.run_objective_swarm_task")
def run_objective_swarm_task(objective_id: str):
  print(f"[Celery Worker] Starting swarm coordination for objective: {objective_id}")
  from app.agent_runtime.orchestrator import ChiefOrchestratorAgent
  
  # Set up event loop for running async tasks inside Celery sync worker thread
  loop = asyncio.get_event_loop()
  if loop.is_closed():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
  orchestrator = ChiefOrchestratorAgent()
  success = loop.run_until_complete(orchestrator.coordinate_swarm(objective_id))
  print(f"[Celery Worker] Swarm execution step complete for objective {objective_id}. Success: {success}")
  return success
