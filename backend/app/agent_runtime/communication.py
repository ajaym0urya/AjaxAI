from app.agent_runtime.agent_base import BaseAgent

class CommunicationAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Communication Agent",
      role="Handles email delivery and external integrations",
      capabilities=["notifications", "integrations"]
    )
