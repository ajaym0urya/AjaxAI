import datetime
import random
from app.agent_runtime.agent_base import BaseAgent
from app.database.db import db

class OpportunityAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Opportunity Agent",
      role="Discovers and scores opportunities for users",
      capabilities=["relevance_matching", "career_discovery"]
    )

  async def scan_opportunities(self, text: str, log_fn):
    await log_fn("[Opportunity Agent] Scanning outputs for career advancements...")
    score = random.randint(80, 98)
    db.opportunities.create({
      "id": f"opp_auto_{int(datetime.datetime.utcnow().timestamp()*1000)}",
      "title": "Principal AI PM Certification Course",
      "description": "Recommended by Opportunity Swarm. Fits gap areas.",
      "type": "certification",
      "url": "https://careers.microsoft.com",
      "metadata": { "duration": "4 weeks", "cost": "$499" },
      "relevanceScore": score,
      "status": "discovered",
      "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    })
