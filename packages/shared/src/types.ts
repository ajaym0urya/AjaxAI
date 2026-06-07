export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type ObjectiveStatus = 'Draft' | 'Active' | 'Blocked' | 'Waiting' | 'Monitoring' | 'Completed' | 'Archived';

export interface Objective {
  id: string;
  userId: string;
  title: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
  status: ObjectiveStatus;
  milestones: string[];
  blockers: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  progressScore?: number;
  momentumScore?: number;
  stallScore?: number;
  riskScore?: number;
  completionProbability?: number;
  intentStrength?: number;
  recoveryPriority?: number;
}

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Blocked' | 'Failed';

export interface Task {
  id: string;
  objectiveId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'Low' | 'Medium' | 'High';
  order: number;
  dependencies: string[]; // Task IDs
  milestoneId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export type AgentRunStatus = 'Running' | 'Success' | 'Failed' | 'Paused';

export interface AgentRun {
  id: string;
  objectiveId: string;
  agentName: string;
  status: AgentRunStatus;
  startedAt: string;
  endedAt?: string;
  logs: string[];
}

export interface AgentMessage {
  id: string;
  agentRunId: string;
  fromAgent: string;
  toAgent: string;
  content: string;
  timestamp: string;
}

export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'objective' | 'organizational' | 'intent' | 'behavior';

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  tags: string[];
  embeddings?: number[];
  timestamp: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  url?: string;
  blobUrl?: string;
  fileType: string;
  sizeBytes: number;
  createdAt: string;
}

export type NodeType = 'objective' | 'task' | 'document' | 'insight' | 'decision' | 'person' | 'company' | 'web-resource' | 'opportunity';

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  createdAt: string;
}

export type EdgeType = 'depends_on' | 'related_to' | 'generated_by' | 'validated_by' | 'blocks' | 'supports';

export interface KnowledgeEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  label: string;
  createdAt: string;
}

export type OpportunityType = 'job' | 'event' | 'hackathon' | 'course' | 'certification' | 'scholarship' | 'competitor-activity' | 'price-drop';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  url: string;
  metadata: Record<string, any>;
  relevanceScore: number; // 0 to 100
  status: 'discovered' | 'applied' | 'ignored';
  createdAt: string;
}

export type ApprovalActionType = 'payment' | 'application' | 'external-communication' | 'purchase' | 'account-change' | 'data-deletion';

export interface Approval {
  id: string;
  objectiveId: string;
  taskId: string;
  actionType: ApprovalActionType;
  requestDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string; // Agent name
  resolvedBy?: string; // User ID / Name
  resolvedAt?: string;
  createdAt: string;
}

export interface Execution {
  id: string;
  taskId: string;
  status: 'Pending' | 'Success' | 'Failed';
  logs: string[];
  startedAt: string;
  completedAt?: string;
}

export interface BrowserCapture {
  id: string;
  url: string;
  screenshotUrl?: string;
  parsedText: string;
  title: string;
  timestamp: string;
}

export interface ToolRegistry {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  capabilities: string[];
  executionEndpoint: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'approval_required';
  read: boolean;
  createdAt: string;
}

export interface IntentSignal {
  id: string;
  inferredObjective: string;
  sourceWebsites: string[];
  confidenceScore: number;
  timestamp: string;
}

export interface IntentRecovery {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'resurrected' | 'ignored';
  originalContextSnippet: string;
  suggestedNextAction: string;
  createdAt: string;
}

export interface WeeklyReflection {
  id: string;
  dateRange: string;
  objectivesAdvanced: string[];
  objectivesStalled: string[];
  researchAbandoned: string[];
  missedOpportunities: string[];
  suggestedRecoveries: string[];
  recommendedActions: string[];
  createdAt: string;
}
