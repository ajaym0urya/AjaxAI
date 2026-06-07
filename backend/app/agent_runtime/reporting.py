from app.agent_runtime.agent_base import BaseAgent

class ReportingAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Reporting Agent",
      role="Compiles progress reports and metrics summaries",
      capabilities=["reporting", "analytics"]
    )
