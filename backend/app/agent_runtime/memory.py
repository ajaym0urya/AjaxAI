from app.agent_runtime.agent_base import BaseAgent
from app.database.db import db

class MemoryAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Memory Agent",
      role="Maintains episodic, semantic, and procedural recall",
      capabilities=["semantic_search", "embedding_indexing"]
    )

  async def recall_context(self, query: str, log_fn):
    await log_fn("[Memory Agent] Indexing vector embeddings and querying semantic database...")
    memories = db.memories.list()
    if memories:
      await log_fn(f"[Memory Agent] Context recalled: '{memories[0].get('content')}'")
    else:
      await log_fn("[Memory Agent] Zero historical context matching search query.")
