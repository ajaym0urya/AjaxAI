import * as fs from 'fs';
import * as path from 'path';
import { CosmosClient, Container } from '@azure/cosmos';
import { 
  User, Objective, Task, Subtask, AgentRun, AgentMessage, 
  Memory, Document, KnowledgeNode, KnowledgeEdge, Opportunity, 
  Approval, Execution, BrowserCapture, ToolRegistry, AuditLog, Notification,
  IntentSignal, IntentRecovery, WeeklyReflection
} from './types.js';

interface DatabaseSchema {
  users: User[];
  objectives: Objective[];
  tasks: Task[];
  subtasks: Subtask[];
  agentRuns: AgentRun[];
  agentMessages: AgentMessage[];
  memories: Memory[];
  documents: Document[];
  knowledgeNodes: KnowledgeNode[];
  knowledgeEdges: KnowledgeEdge[];
  opportunities: Opportunity[];
  approvals: Approval[];
  executions: Execution[];
  browserCaptures: BrowserCapture[];
  toolRegistry: ToolRegistry[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  intentSignals: IntentSignal[];
  intentRecoveries: IntentRecovery[];
  weeklyReflections: WeeklyReflection[];
}

class Collection<T extends { id: string }> {
  private key: keyof DatabaseSchema;
  private parent: Database;

  constructor(key: keyof DatabaseSchema, parent: Database) {
    this.key = key;
    this.parent = parent;
  }

  private getData(): T[] {
    const data = this.parent.readRaw();
    return (data[this.key] || []) as unknown as T[];
  }

  private saveData(items: T[]) {
    const data = this.parent.readRaw();
    (data[this.key] as any) = items;
    this.parent.writeRaw(data);
  }

  public async list(): Promise<T[]> {
    if (this.parent.isCosmosActive()) {
      const container = this.parent.getCosmosContainer(this.key);
      const { resources } = await container.items.readAll<T>().fetchAll();
      return resources;
    }
    return this.getData();
  }

  public async get(id: string): Promise<T | null> {
    if (this.parent.isCosmosActive()) {
      const container = this.parent.getCosmosContainer(this.key);
      try {
        const { resource } = await container.item(id, id).read<T>();
        return resource || null;
      } catch (err) {
        return null;
      }
    }
    const items = this.getData();
    return items.find(item => item.id === id) || null;
  }

  public async create(item: T): Promise<T> {
    if (this.parent.isCosmosActive()) {
      const container = this.parent.getCosmosContainer(this.key);
      const { resource } = await container.items.create<T>(item);
      if (!resource) {
        throw new Error(`Failed to create item in Cosmos DB: ${String(this.key)}`);
      }
      return resource as T;
    }
    const items = this.getData();
    if (items.some(i => i.id === item.id)) {
      throw new Error(`Item with id ${item.id} already exists in ${String(this.key)}`);
    }
    items.push(item);
    this.saveData(items);
    return item;
  }

  public async update(id: string, updatedFields: Partial<T>): Promise<T> {
    if (this.parent.isCosmosActive()) {
      const container = this.parent.getCosmosContainer(this.key);
      const { resource: current } = await container.item(id, id).read<T>();
      if (!current) {
        throw new Error(`Item with id ${id} not found in ${String(this.key)}`);
      }
      const updated = { ...current, ...updatedFields };
      const { resource } = await container.item(id, id).replace<T>(updated);
      if (!resource) {
        throw new Error(`Failed to update item in Cosmos DB: ${String(this.key)}`);
      }
      return resource as T;
    }
    const items = this.getData();
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) {
      throw new Error(`Item with id ${id} not found in ${String(this.key)}`);
    }
    items[idx] = { ...items[idx], ...updatedFields };
    this.saveData(items);
    return items[idx];
  }

  public async delete(id: string): Promise<boolean> {
    if (this.parent.isCosmosActive()) {
      const container = this.parent.getCosmosContainer(this.key);
      try {
        await container.item(id, id).delete();
        return true;
      } catch (err) {
        return false;
      }
    }
    const items = this.getData();
    const initialLen = items.length;
    const filtered = items.filter(item => item.id !== id);
    this.saveData(filtered);
    return filtered.length < initialLen;
  }

  public async find(predicate: (item: T) => boolean): Promise<T[]> {
    if (this.parent.isCosmosActive()) {
      const container = this.parent.getCosmosContainer(this.key);
      const { resources } = await container.items.readAll<T>().fetchAll();
      return resources.filter(predicate);
    }
    return this.getData().filter(predicate);
  }
}

class Database {
  private filePath: string;
  private cosmosClient: CosmosClient | null = null;
  private cosmosDb: any = null;

  public users: Collection<User>;
  public objectives: Collection<Objective>;
  public tasks: Collection<Task>;
  public subtasks: Collection<Subtask>;
  public agentRuns: Collection<AgentRun>;
  public agentMessages: Collection<AgentMessage>;
  public memories: Collection<Memory>;
  public documents: Collection<Document>;
  public knowledgeNodes: Collection<KnowledgeNode>;
  public knowledgeEdges: Collection<KnowledgeEdge>;
  public opportunities: Collection<Opportunity>;
  public approvals: Collection<Approval>;
  public executions: Collection<Execution>;
  public browserCaptures: Collection<BrowserCapture>;
  public toolRegistry: Collection<ToolRegistry>;
  public auditLogs: Collection<AuditLog>;
  public notifications: Collection<Notification>;
  public intentSignals: Collection<IntentSignal>;
  public intentRecoveries: Collection<IntentRecovery>;
  public weeklyReflections: Collection<WeeklyReflection>;

  constructor() {
    let rootPath = process.cwd();
    if (rootPath.includes('packages') || rootPath.includes('services') || rootPath.includes('apps')) {
      this.filePath = path.resolve(rootPath, '../../db.json');
    } else {
      this.filePath = path.resolve(rootPath, 'db.json');
    }

    const cosmosConn = process.env.AZURE_COSMOS_CONNECTION_STRING;
    if (cosmosConn) {
      try {
        this.cosmosClient = new CosmosClient(cosmosConn);
        this.cosmosDb = this.cosmosClient.database("AjaxAI");
        console.log(`[Cosmos DB] Dynamic connection established.`);
      } catch (err) {
        console.error(`[Cosmos DB] Connection failed, falling back to db.json:`, err);
      }
    }

    this.users = new Collection<User>('users', this);
    this.objectives = new Collection<Objective>('objectives', this);
    this.tasks = new Collection<Task>('tasks', this);
    this.subtasks = new Collection<Subtask>('subtasks', this);
    this.agentRuns = new Collection<AgentRun>('agentRuns', this);
    this.agentMessages = new Collection<AgentMessage>('agentMessages', this);
    this.memories = new Collection<Memory>('memories', this);
    this.documents = new Collection<Document>('documents', this);
    this.knowledgeNodes = new Collection<KnowledgeNode>('knowledgeNodes', this);
    this.knowledgeEdges = new Collection<KnowledgeEdge>('knowledgeEdges', this);
    this.opportunities = new Collection<Opportunity>('opportunities', this);
    this.approvals = new Collection<Approval>('approvals', this);
    this.executions = new Collection<Execution>('executions', this);
    this.browserCaptures = new Collection<BrowserCapture>('browserCaptures', this);
    this.toolRegistry = new Collection<ToolRegistry>('toolRegistry', this);
    this.auditLogs = new Collection<AuditLog>('auditLogs', this);
    this.notifications = new Collection<Notification>('notifications', this);
    this.intentSignals = new Collection<IntentSignal>('intentSignals', this);
    this.intentRecoveries = new Collection<IntentRecovery>('intentRecoveries', this);
    this.weeklyReflections = new Collection<WeeklyReflection>('weeklyReflections', this);

    this.ensureDbFile();
  }

  public isCosmosActive(): boolean {
    return this.cosmosClient !== null && this.cosmosDb !== null;
  }

  public getCosmosContainer(key: keyof DatabaseSchema): Container {
    if (!this.cosmosDb) throw new Error("Cosmos DB not initialized");
    return this.cosmosDb.container(String(key));
  }

  public readRaw(): DatabaseSchema {
    this.ensureDbFile();
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content) as DatabaseSchema;
    } catch (e) {
      return this.emptySchema();
    }
  }

  public writeRaw(data: DatabaseSchema) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private ensureDbFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      this.writeRaw(this.emptySchema());
    }
  }

  private emptySchema(): DatabaseSchema {
    return {
      users: [],
      objectives: [],
      tasks: [],
      subtasks: [],
      agentRuns: [],
      agentMessages: [],
      memories: [],
      documents: [],
      knowledgeNodes: [],
      knowledgeEdges: [],
      opportunities: [],
      approvals: [],
      executions: [],
      browserCaptures: [],
      toolRegistry: [],
      auditLogs: [],
      notifications: [],
      intentSignals: [],
      intentRecoveries: [],
      weeklyReflections: []
    };
  }
}

export const db = new Database();
export * from './types.js';
