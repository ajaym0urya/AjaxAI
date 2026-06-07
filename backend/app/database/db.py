import os
import json
import datetime
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from azure.cosmos import CosmosClient

# 1. Pydantic Models for Collections
class User(BaseModel):
  id: str
  name: str
  email: str
  role: str

class Objective(BaseModel):
  id: str
  userId: str
  title: str
  description: str
  complexity: str # 'Low' | 'Medium' | 'High'
  status: str # 'Draft' | 'Active' | 'Blocked' | 'Waiting' | 'Monitoring' | 'Completed' | 'Archived'
  milestones: List[str] = []
  blockers: List[str] = []
  dependencies: List[str] = []
  createdAt: str
  updatedAt: str
  progressScore: Optional[int] = 0
  momentumScore: Optional[int] = 0
  stallScore: Optional[int] = 0
  riskScore: Optional[int] = 0
  completionProbability: Optional[int] = 0
  intentStrength: Optional[int] = 50
  recoveryPriority: Optional[int] = 0

class Task(BaseModel):
  id: str
  objectiveId: str
  title: str
  description: str
  status: str # 'Pending' | 'InProgress' | 'Completed' | 'Blocked' | 'Failed'
  priority: str # 'Low' | 'Medium' | 'High'
  order: int
  dependencies: List[str] = []
  milestoneId: Optional[str] = None
  createdAt: str
  updatedAt: str

class Subtask(BaseModel):
  id: str
  taskId: str
  title: str
  status: str # 'Pending' | 'Completed'
  createdAt: str

class AgentRun(BaseModel):
  id: str
  objectiveId: str
  agentName: str
  status: str # 'Running' | 'Success' | 'Failed' | 'Paused'
  startedAt: str
  endedAt: Optional[str] = None
  logs: List[str] = []

class AgentMessage(BaseModel):
  id: str
  agentRunId: str
  fromAgent: str
  toAgent: str
  content: str
  timestamp: str

class Memory(BaseModel):
  id: str
  type: str # 'episodic' | 'semantic' | 'procedural' | 'objective' | 'intent' | 'behavior'
  content: str
  tags: List[str] = []
  timestamp: str

class Document(BaseModel):
  id: str
  title: str
  content: str
  url: Optional[str] = None
  blobUrl: Optional[str] = None
  fileType: str
  sizeBytes: int
  createdAt: str

class KnowledgeNode(BaseModel):
  id: str
  type: str # 'objective' | 'task' | 'document' | 'insight' ...
  label: str
  properties: Dict[str, Any] = {}
  createdAt: str

class KnowledgeEdge(BaseModel):
  id: str
  sourceNodeId: str
  targetNodeId: str
  type: str # 'depends_on' | 'related_to' ...
  label: str
  createdAt: str

class Opportunity(BaseModel):
  id: str
  title: str
  description: str
  type: str # 'job' | 'event' | 'certification' ...
  url: str
  metadata: Dict[str, Any] = {}
  relevanceScore: int
  status: str # 'discovered' | 'applied' | 'ignored'
  createdAt: str

class Approval(BaseModel):
  id: str
  objectiveId: str
  taskId: str
  actionType: str # 'payment' | 'application' | 'external-communication' ...
  requestDetails: str
  status: str # 'pending' | 'approved' | 'rejected'
  requestedBy: str
  resolvedBy: Optional[str] = None
  resolvedAt: Optional[str] = None
  createdAt: str

class Execution(BaseModel):
  id: str
  taskId: str
  status: str
  logs: List[str] = []
  startedAt: str
  completedAt: Optional[str] = None

class BrowserCapture(BaseModel):
  id: str
  url: str
  screenshotUrl: Optional[str] = None
  parsedText: str
  title: str
  timestamp: str

class ToolRegistryModel(BaseModel):
  id: str
  name: str
  description: str
  permissions: List[str] = []
  capabilities: List[str] = []
  executionEndpoint: str

class AuditLog(BaseModel):
  id: str
  userId: str
  action: str
  details: Dict[str, Any] = {}
  timestamp: str

class Notification(BaseModel):
  id: str
  userId: str
  title: str
  message: str
  type: str # 'info' | 'warning' | 'success' | 'approval_required'
  read: bool
  createdAt: str

class IntentSignal(BaseModel):
  id: str
  inferredObjective: str
  sourceWebsites: List[str] = []
  confidenceScore: int
  timestamp: str

class IntentRecovery(BaseModel):
  id: str
  title: str
  description: str
  status: str # 'pending' | 'resurrected' | 'ignored'
  originalContextSnippet: str
  suggestedNextAction: str
  createdAt: str

class WeeklyReflection(BaseModel):
  id: str
  dateRange: str
  objectivesAdvanced: List[str] = []
  objectivesStalled: List[str] = []
  researchAbandoned: List[str] = []
  missedOpportunities: List[str] = []
  suggestedRecoveries: List[str] = []
  recommendedActions: List[str] = []
  createdAt: str


# 2. Dual-Adapter DB Client
class Collection:
  def __init__(self, key: str, db_instance: 'Database'):
    self.key = key
    self.db = db_instance

  def list(self) -> List[Dict[str, Any]]:
    if self.db.is_cosmos_active():
      container = self.db.get_cosmos_container(self.key)
      try:
        items = list(container.read_all_items())
        return items
      except Exception as e:
        print(f"[Cosmos DB] list error on {self.key}: {e}")
        return []
    return self.db.read_raw().get(self.key, [])

  def get(self, item_id: str) -> Optional[Dict[str, Any]]:
    if self.db.is_cosmos_active():
      container = self.db.get_cosmos_container(self.key)
      try:
        item = container.read_item(item=item_id, partition_key=item_id)
        return item
      except Exception as e:
        return None
    items = self.list()
    for item in items:
      if item.get('id') == item_id:
        return item
    return None

  def create(self, item: Dict[str, Any]) -> Dict[str, Any]:
    if self.db.is_cosmos_active():
      container = self.db.get_cosmos_container(self.key)
      try:
        res = container.create_item(body=item)
        return res
      except Exception as e:
        print(f"[Cosmos DB] create error on {self.key}: {e}")
        raise e
    raw = self.db.read_raw()
    items = raw.setdefault(self.key, [])
    for existing in items:
      if existing.get('id') == item.get('id'):
        raise ValueError(f"Item with id {item.get('id')} already exists in {self.key}")
    items.append(item)
    self.db.write_raw(raw)
    return item

  def update(self, item_id: str, updated_fields: Dict[str, Any]) -> Dict[str, Any]:
    if self.db.is_cosmos_active():
      container = self.db.get_cosmos_container(self.key)
      try:
        current = container.read_item(item=item_id, partition_key=item_id)
        current.update(updated_fields)
        res = container.replace_item(item=item_id, body=current)
        return res
      except Exception as e:
        print(f"[Cosmos DB] update error on {self.key}: {e}")
        raise e
    raw = self.db.read_raw()
    items = raw.get(self.key, [])
    found_idx = -1
    for idx, item in enumerate(items):
      if item.get('id') == item_id:
        found_idx = idx
        break
    if found_idx == -1:
      raise ValueError(f"Item with id {item_id} not found in {self.key}")
    items[found_idx].update(updated_fields)
    self.db.write_raw(raw)
    return items[found_idx]

  def delete(self, item_id: str) -> bool:
    if self.db.is_cosmos_active():
      container = self.db.get_cosmos_container(self.key)
      try:
        container.delete_item(item=item_id, partition_key=item_id)
        return True
      except Exception as e:
        return False
    raw = self.db.read_raw()
    items = raw.get(self.key, [])
    initial_len = len(items)
    filtered_items = [i for i in items if i.get('id') != item_id]
    raw[self.key] = filtered_items
    self.db.write_raw(raw)
    return len(filtered_items) < initial_len

  def find(self, predicate) -> List[Dict[str, Any]]:
    return [item for item in self.list() if predicate(item)]


class Database:
  def __init__(self, file_path: str = "db.json"):
    self.file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", file_path))
    self.cosmos_client = None
    self.cosmos_db = None

    cosmos_conn = os.getenv("AZURE_COSMOS_CONNECTION_STRING")
    if cosmos_conn:
      try:
        self.cosmos_client = CosmosClient.from_connection_string(cosmos_conn)
        self.cosmos_db = self.cosmos_client.get_database_client("AjaxAI")
        print("[Cosmos DB] Dynamic connection established in Python.")
      except Exception as e:
        print(f"[Cosmos DB] Connection failed in Python, falling back to local json: {e}")

    self.users = Collection("users", self)
    self.objectives = Collection("objectives", self)
    self.tasks = Collection("tasks", self)
    self.subtasks = Collection("subtasks", self)
    self.agentRuns = Collection("agentRuns", self)
    self.agentMessages = Collection("agentMessages", self)
    self.memories = Collection("memories", self)
    self.documents = Collection("documents", self)
    self.knowledgeNodes = Collection("knowledgeNodes", self)
    self.knowledgeEdges = Collection("knowledgeEdges", self)
    self.opportunities = Collection("opportunities", self)
    self.approvals = Collection("approvals", self)
    self.executions = Collection("executions", self)
    self.browserCaptures = Collection("browserCaptures", self)
    self.toolRegistry = Collection("toolRegistry", self)
    self.auditLogs = Collection("auditLogs", self)
    self.notifications = Collection("notifications", self)
    self.intentSignals = Collection("intentSignals", self)
    self.intentRecoveries = Collection("intentRecoveries", self)
    self.weeklyReflections = Collection("weeklyReflections", self)

    self._ensure_db_file()

  def is_cosmos_active(self) -> bool:
    return self.cosmos_client is not None and self.cosmos_db is not None

  def get_cosmos_container(self, key: str):
    if not self.cosmos_db:
      raise ValueError("Cosmos DB not initialized")
    return self.cosmos_db.get_container_client(key)

  def read_raw(self) -> Dict[str, List[Any]]:
    self._ensure_db_file()
    try:
      with open(self.file_path, 'r', encoding='utf-8') as f:
        return json.load(f)
    except Exception:
      return self._empty_schema()

  def write_raw(self, data: Dict[str, List[Any]]):
    with open(self.file_path, 'w', encoding='utf-8') as f:
      json.dump(data, f, indent=2, ensure_ascii=False)

  def _ensure_db_file(self):
    os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
    if not os.path.exists(self.file_path):
      self.write_raw(self._empty_schema())

  def _empty_schema(self) -> Dict[str, List[Any]]:
    return {
      "users": [],
      "objectives": [],
      "tasks": [],
      "subtasks": [],
      "agentRuns": [],
      "agentMessages": [],
      "memories": [],
      "documents": [],
      "knowledgeNodes": [],
      "knowledgeEdges": [],
      "opportunities": [],
      "approvals": [],
      "executions": [],
      "browserCaptures": [],
      "toolRegistry": [],
      "auditLogs": [],
      "notifications": [],
      "intentSignals": [],
      "intentRecoveries": [],
      "weeklyReflections": []
    }

db = Database()
