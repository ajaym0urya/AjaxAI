import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { db, Objective, Task, Opportunity, Approval, Memory, Notification, IntentSignal, IntentRecovery, WeeklyReflection } from '@ajaxai/shared';
import { initSignalR, broadcast } from './signalr.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'AjaxAI Backend Gateway' });
});

// 1. Objectives Endpoints
app.get('/api/objectives', async (req, res) => {
  try {
    const list = await db.objectives.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/objectives', async (req, res) => {
  try {
    const { title, description, complexity } = req.body;
    const objective: Objective = {
      id: `obj_${Date.now()}`,
      userId: 'usr_admin',
      title,
      description,
      complexity: complexity || 'Medium',
      status: 'Draft',
      milestones: [],
      blockers: [],
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progressScore: 0,
      momentumScore: 0,
      stallScore: 0,
      riskScore: 0,
      completionProbability: 0,
      intentStrength: 50,
      recoveryPriority: 0
    };
    await db.objectives.create(objective);
    
    // Broadcast event
    broadcast('objective_created', objective);
    
    res.status(201).json(objective);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/objectives/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await db.objectives.get(id);
    if (!obj) {
      return res.status(404).json({ error: 'Objective not found' });
    }
    
    const updated = await db.objectives.update(id, {
      status: 'Active',
      updatedAt: new Date().toISOString()
    });

    broadcast('objective_activated', updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Tasks Endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    const { objectiveId } = req.query;
    let list = await db.tasks.list();
    if (objectiveId) {
      list = list.filter(t => t.objectiveId === objectiveId);
    }
    // Sort by order
    list.sort((a, b) => a.order - b.order);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Agent Runs & Activity Log
app.get('/api/agent-runs', async (req, res) => {
  try {
    const { objectiveId } = req.query;
    let list = await db.agentRuns.list();
    if (objectiveId) {
      list = list.filter(r => r.objectiveId === objectiveId);
    }
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Opportunities Endpoints
app.get('/api/opportunities', async (req, res) => {
  try {
    const list = await db.opportunities.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/opportunities/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'applied' | 'ignored'
    const opp = await db.opportunities.get(id);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    const updated = await db.opportunities.update(id, { status });
    broadcast('opportunity_updated', updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Approvals Endpoints
app.get('/api/approvals', async (req, res) => {
  try {
    const list = await db.approvals.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'
    const appr = await db.approvals.get(id);
    if (!appr) {
      return res.status(404).json({ error: 'Approval request not found' });
    }
    
    const updatedApproval = await db.approvals.update(id, {
      status,
      resolvedBy: 'Alex Carter',
      resolvedAt: new Date().toISOString()
    });

    // If approved, update objective back to Active and task status to InProgress or Pending
    if (status === 'approved') {
      await db.objectives.update(appr.objectiveId, { status: 'Active', updatedAt: new Date().toISOString() });
      await db.tasks.update(appr.taskId, { status: 'InProgress', updatedAt: new Date().toISOString() });
    } else {
      await db.objectives.update(appr.objectiveId, { status: 'Blocked', updatedAt: new Date().toISOString() });
      await db.tasks.update(appr.taskId, { status: 'Blocked', updatedAt: new Date().toISOString() });
    }

    // Broadcast approval change
    broadcast('approval_resolved', updatedApproval);
    res.json(updatedApproval);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Knowledge Graph Endpoints
app.get('/api/knowledge', async (req, res) => {
  try {
    const nodes = await db.knowledgeNodes.list();
    const edges = await db.knowledgeEdges.list();
    res.json({ nodes, edges });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Memory Endpoints
app.get('/api/memories', async (req, res) => {
  try {
    const list = await db.memories.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memories', async (req, res) => {
  try {
    const { content, type, tags } = req.body;
    const memory: Memory = {
      id: `mem_${Date.now()}`,
      type: type || 'semantic',
      content,
      tags: tags || ['clipped'],
      timestamp: new Date().toISOString()
    };
    await db.memories.create(memory);
    
    // Add a Knowledge Graph Node representing this clipped memory
    const node = await db.knowledgeNodes.create({
      id: `kn_mem_${Date.now()}`,
      type: 'document',
      label: `Clipped: ${content.substring(0, 25)}...`,
      properties: { memoryId: memory.id, source: 'Chrome Extension' },
      createdAt: new Date().toISOString()
    });
    
    broadcast('memory_created', { memory, node });
    res.status(201).json(memory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Notifications Endpoints
app.get('/api/notifications', async (req, res) => {
  try {
    const list = await db.notifications.list();
    // Sort descending by date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/read', async (req, res) => {
  try {
    const list = await db.notifications.list();
    for (const notif of list) {
      if (!notif.read) {
        await db.notifications.update(notif.id, { read: true });
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Tools Registry
app.get('/api/tools', async (req, res) => {
  try {
    const list = await db.toolRegistry.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Intent Recovery Endpoints
app.get('/api/intent-recovery', async (req, res) => {
  try {
    const list = await db.intentRecoveries.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/intent-recovery/:id/resurrect', async (req, res) => {
  try {
    const { id } = req.params;
    const recovery = await db.intentRecoveries.get(id);
    if (!recovery) {
      return res.status(404).json({ error: 'Recovery target not found' });
    }
    
    const updatedRecovery = await db.intentRecoveries.update(id, { status: 'resurrected' });
    
    const normalizedTitle = recovery.title
      .replace('Unfinished ', '')
      .replace('Abandoned ', '')
      .replace('Stalled ', '');
      
    const newObjective: Objective = {
      id: `obj_res_${Date.now()}`,
      userId: 'usr_admin',
      title: normalizedTitle,
      description: `${recovery.description}\n\n[Resurrected Context]: ${recovery.originalContextSnippet}`,
      complexity: 'Medium',
      status: 'Active',
      milestones: ['Analyze Resurrected Context', 'Scaffold Action Plan', 'Execute Task Sequence'],
      blockers: [],
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progressScore: 20,
      momentumScore: 90,
      stallScore: 0,
      riskScore: 10,
      completionProbability: 40,
      intentStrength: 95,
      recoveryPriority: 0
    };
    await db.objectives.create(newObjective);
    
    const task1 = await db.tasks.create({
      id: `tsk_res_${Date.now()}_1`,
      objectiveId: newObjective.id,
      title: `Analyze context: ${recovery.title}`,
      description: `Evaluate original details: "${recovery.originalContextSnippet}"`,
      status: 'InProgress',
      priority: 'High',
      order: 1,
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const task2 = await db.tasks.create({
      id: `tsk_res_${Date.now()}_2`,
      objectiveId: newObjective.id,
      title: `Execute: ${recovery.suggestedNextAction}`,
      description: `Follow through on the resurrected next action step.`,
      status: 'Pending',
      priority: 'High',
      order: 2,
      dependencies: [task1.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await db.memories.create({
      id: `mem_res_${Date.now()}`,
      type: 'intent',
      content: `Resurrected Objective "${newObjective.title}" from recovery database. Action step queued.`,
      tags: ['intent-recovery', 'resurrection'],
      timestamp: new Date().toISOString()
    });
    
    broadcast('context_resurrected', { recovery: updatedRecovery, objective: newObjective });
    res.json({ success: true, objective: newObjective });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Weekly Reflections Endpoints
app.get('/api/weekly-reflections', async (req, res) => {
  try {
    const list = await db.weeklyReflections.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Intent Signals Endpoints
app.get('/api/intent-signals', async (req, res) => {
  try {
    const list = await db.intentSignals.list();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server with WebSocket attachment
const httpServer = createServer(app);
initSignalR(httpServer);

httpServer.listen(port, () => {
  console.log(`[AjaxAI Server] Running on http://localhost:${port}`);
  console.log(`[AjaxAI SignalR] Listening for connections on ws://localhost:${port}/signalr`);
});
