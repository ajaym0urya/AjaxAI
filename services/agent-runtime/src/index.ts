import 'dotenv/config';
import { db } from '@ajaxai/shared';
import { ChiefOrchestratorAgent, IntentRecoveryAgent, ReportingAgent } from './swarm.js';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateObjectiveHealth(objectiveId: string) {
  const objective = await db.objectives.get(objectiveId);
  if (!objective) return;
  const tasks = await db.tasks.find(t => t.objectiveId === objectiveId);
  if (tasks.length === 0) return;
  
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progress = Math.round((completedTasks / tasks.length) * 100);
  
  let momentum = 50;
  let stall = 0;
  let risk = 10;
  let compProb = progress;
  let recoveryPri = 0;
  
  if (objective.status === 'Completed') {
    momentum = 0;
    stall = 0;
    risk = 0;
    compProb = 100;
    recoveryPri = 0;
  } else if (objective.status === 'Blocked') {
    momentum = 15;
    stall = 80;
    risk = 70;
    compProb = Math.max(5, progress - 10);
    recoveryPri = 90;
  } else if (objective.status === 'Active') {
    momentum = 85;
    stall = 10;
    risk = 15;
    compProb = Math.min(95, progress + 15);
    recoveryPri = 10;
  }
  
  await db.objectives.update(objectiveId, {
    progressScore: progress,
    momentumScore: momentum,
    stallScore: stall,
    riskScore: risk,
    completionProbability: compProb,
    intentStrength: objective.intentStrength || 85,
    recoveryPriority: recoveryPri
  });
}

async function main() {
  console.log('==================================================');
  console.log('      AjaxAI Swarm Agent Runtime Service Starting');
  console.log('==================================================');

  const orchestrator = new ChiefOrchestratorAgent();
  const recoveryAgent = new IntentRecoveryAgent();
  const reportingAgent = new ReportingAgent();

  while (true) {
    try {
      // 1. Scan user history and model recoveries
      await recoveryAgent.scanHistoryAndRecover((m) => console.log(m));

      // 2. Generate weekly reflections
      await reportingAgent.generateWeeklyReflection((m) => console.log(m));

      // 3. Find active objectives and coordinate swarm
      const activeObjectives = await db.objectives.find(o => o.status === 'Active');
      
      if (activeObjectives.length > 0) {
        console.log(`[Agent Runtime] Found ${activeObjectives.length} active objectives. Initiating step execution...`);
        
        for (const objective of activeObjectives) {
          // Coordinate execution
          await orchestrator.coordinateSwarm(objective.id);
          // Re-calculate metrics
          await updateObjectiveHealth(objective.id);
        }
      }
      
      // Update metrics for all other objectives
      const allObjectives = await db.objectives.list();
      for (const obj of allObjectives) {
        if (obj.status !== 'Active') {
          await updateObjectiveHealth(obj.id);
        }
      }
    } catch (error) {
      console.error('[Agent Runtime Error] Failed during execution loop step:', error);
    }
    
    // Wait for 6 seconds before checking for active objectives again
    await sleep(6000);
  }
}

main().catch(err => {
  console.error('[Agent Runtime Fatal] Crash:', err);
  process.exit(1);
});

