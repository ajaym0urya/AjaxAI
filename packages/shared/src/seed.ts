import { db } from './db.js';

async function main() {
  console.log('Seeding AjaxAI Database...');

  // Reset database raw content
  const schema = db.readRaw();
  
  // Clear collections
  schema.users = [];
  schema.objectives = [];
  schema.tasks = [];
  schema.subtasks = [];
  schema.agentRuns = [];
  schema.agentMessages = [];
  schema.memories = [];
  schema.documents = [];
  schema.knowledgeNodes = [];
  schema.knowledgeEdges = [];
  schema.opportunities = [];
  schema.approvals = [];
  schema.executions = [];
  schema.browserCaptures = [];
  schema.toolRegistry = [];
  schema.auditLogs = [];
  schema.notifications = [];
  schema.intentSignals = [];
  schema.intentRecoveries = [];
  schema.weeklyReflections = [];
  db.writeRaw(schema);

  // 1. Users
  const user = await db.users.create({
    id: 'usr_admin',
    name: 'Alex Carter',
    email: 'alex.carter@enterprise.com',
    role: 'Principal Engineer'
  });

  // 2. Objectives
  const obj1 = await db.objectives.create({
    id: 'obj_pm',
    userId: user.id,
    title: 'Become a Product Manager',
    description: 'Decompose current skills, identify PM gaps, create a portfolio, and secure an AI Product Manager job.',
    complexity: 'High',
    status: 'Active',
    milestones: ['Skill Gap Analysis', 'Portfolio Launch', 'Job Applications', 'Interview Preparation'],
    blockers: ['Lack of formal PM credentials'],
    dependencies: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    progressScore: 60,
    momentumScore: 85,
    stallScore: 15,
    riskScore: 20,
    completionProbability: 78,
    intentStrength: 92,
    recoveryPriority: 10
  });

  const obj2 = await db.objectives.create({
    id: 'obj_startup',
    userId: user.id,
    title: 'Launch a SaaS Startup',
    description: 'Design the micro-SaaS concept, build a landing page, implement payment gateways, and recruit initial beta testers.',
    complexity: 'High',
    status: 'Draft',
    milestones: ['Niche Research', 'MVP Build', 'Payment Setup', 'Beta Launch'],
    blockers: [],
    dependencies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progressScore: 10,
    momentumScore: 30,
    stallScore: 70,
    riskScore: 60,
    completionProbability: 25,
    intentStrength: 80,
    recoveryPriority: 85
  });

  const obj3 = await db.objectives.create({
    id: 'obj_azure',
    userId: user.id,
    title: 'Learn Azure AI Solutions',
    description: 'Complete Microsoft Azure AI training modules, build 3 demo apps, and obtain the AI-102 certification.',
    complexity: 'Medium',
    status: 'Completed',
    milestones: ['Azure AI Fundamentals', 'Demo App Portfolio', 'AI-102 Exam'],
    blockers: [],
    dependencies: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    progressScore: 100,
    momentumScore: 0,
    stallScore: 0,
    riskScore: 0,
    completionProbability: 100,
    intentStrength: 95,
    recoveryPriority: 0
  });

  // 3. Tasks for obj_pm
  const t1 = await db.tasks.create({
    id: 'tsk_1',
    objectiveId: obj1.id,
    title: 'Analyze Resume & Identify Skill Gaps',
    description: 'Chief Orchestrator assigns Research Agent to scan standard PM requirements and evaluate current CV.',
    status: 'Completed',
    priority: 'High',
    order: 1,
    dependencies: [],
    milestoneId: 'Skill Gap Analysis',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString()
  });

  const t2 = await db.tasks.create({
    id: 'tsk_2',
    objectiveId: obj1.id,
    title: 'Create PM Learning Roadmap',
    description: 'Planner Agent generates a targeted curriculum of courses, books, and frameworks based on gaps.',
    status: 'Completed',
    priority: 'High',
    order: 2,
    dependencies: ['tsk_1'],
    milestoneId: 'Skill Gap Analysis',
    createdAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
  });

  const t3 = await db.tasks.create({
    id: 'tsk_3',
    objectiveId: obj1.id,
    title: 'Build PM Portfolio Site',
    description: 'Develop a modern, static portfolio showcasing product specs, PRDs, and wireframes.',
    status: 'InProgress',
    priority: 'High',
    order: 3,
    dependencies: ['tsk_2'],
    milestoneId: 'Portfolio Launch',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  });

  const t4 = await db.tasks.create({
    id: 'tsk_4',
    objectiveId: obj1.id,
    title: 'Apply to Selected PM Job Listings',
    description: 'Browser Agent automatically fills job application portals using compiled resume data.',
    status: 'Pending',
    priority: 'Medium',
    order: 4,
    dependencies: ['tsk_3'],
    milestoneId: 'Job Applications',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  });

  const t5 = await db.tasks.create({
    id: 'tsk_5',
    objectiveId: obj1.id,
    title: 'Prepare PM Case Studies',
    description: 'Run simulations using Validator and reflection agents to practice metrics and product design scenarios.',
    status: 'Blocked',
    priority: 'High',
    order: 5,
    dependencies: ['tsk_4'],
    milestoneId: 'Interview Preparation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Subtasks for tsk_1
  await db.subtasks.create({
    id: 'sub_1_1',
    taskId: t1.id,
    title: 'Import current CV text file',
    status: 'Completed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  });
  await db.subtasks.create({
    id: 'sub_1_2',
    taskId: t1.id,
    title: 'Evaluate metrics, product strategy and agile experience',
    status: 'Completed',
    createdAt: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000).toISOString()
  });

  // Subtasks for tsk_3
  await db.subtasks.create({
    id: 'sub_3_1',
    taskId: t3.id,
    title: 'Create draft spec sheets for project portfolios',
    status: 'Completed',
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
  });
  await db.subtasks.create({
    id: 'sub_3_2',
    taskId: t3.id,
    title: 'Deploy Next.js template to Azure Static Web Apps',
    status: 'Pending',
    createdAt: new Date().toISOString()
  });

  // 4. Tool Registry
  await db.toolRegistry.create({
    id: 'tool_search',
    name: 'Bing Web Search',
    description: 'Queries the internet for current job postings, market trends, and learning resources.',
    permissions: ['network'],
    capabilities: ['search', 'url_discovery'],
    executionEndpoint: '/api/tools/execute/search'
  });

  await db.toolRegistry.create({
    id: 'tool_browser',
    name: 'Playwright Browser',
    description: 'Automates browser actions to crawl sites, download PDFs, and fill application forms.',
    permissions: ['network', 'browser_execution'],
    capabilities: ['scraping', 'screenshots', 'form_interaction'],
    executionEndpoint: '/api/tools/execute/browser'
  });

  await db.toolRegistry.create({
    id: 'tool_docintel',
    name: 'Azure Document Intelligence',
    description: 'Extracts tabular and structured textual information from PDF CVs or specifications.',
    permissions: ['read_file'],
    capabilities: ['ocr', 'document_extraction'],
    executionEndpoint: '/api/tools/execute/docintel'
  });

  await db.toolRegistry.create({
    id: 'tool_email',
    name: 'Outlook Client',
    description: 'Sends updates, files reports, and coordinates with external recruitment contacts.',
    permissions: ['email_send', 'email_read'],
    capabilities: ['email_delivery', 'inbox_scan'],
    executionEndpoint: '/api/tools/execute/email'
  });

  // 5. Agent Runs
  const run1 = await db.agentRuns.create({
    id: 'run_pm_1',
    objectiveId: obj1.id,
    agentName: 'Chief Orchestrator',
    status: 'Running',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    logs: [
      '[Chief Orchestrator] Booted swarm for Objective: Become a Product Manager',
      '[Chief Orchestrator] Invoking Planner Agent to inspect completed milestones...',
      '[Planner] Milestones verified. Initializing Task 3: Build PM Portfolio Site.',
      '[Chief Orchestrator] Routing task to Research Agent for template suggestions.',
      '[Research] Found 3 modern UI templates on GitHub. Forwarding to Browser Agent...',
      '[Browser] Initialized headless session. Navigating to template demo sites...',
      '[Security] Scanned website script scripts/styles. Safe to proceed.'
    ]
  });

  // 6. Agent Messages
  await db.agentMessages.create({
    id: 'msg_1',
    agentRunId: run1.id,
    fromAgent: 'Chief Orchestrator',
    toAgent: 'Planner Agent',
    content: 'Decompose the objective "Become a Product Manager" and verify the active subtask requirements.',
    timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString()
  });

  await db.agentMessages.create({
    id: 'msg_2',
    agentRunId: run1.id,
    fromAgent: 'Planner Agent',
    toAgent: 'Chief Orchestrator',
    content: 'Resume scanning complete. Task 1 and 2 are fully solved. Task 3 is active and requires portfolio build.',
    timestamp: new Date(Date.now() - 1.7 * 60 * 60 * 1000).toISOString()
  });

  // 7. Memories
  await db.memories.create({
    id: 'mem_1',
    type: 'episodic',
    content: 'Analyzed resume "Alex_Carter_CV.pdf". Identified 3 primary gap areas: A/B testing implementation, SQL querying, and pricing metrics optimization.',
    tags: ['cv-analysis', 'gaps'],
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  });

  await db.memories.create({
    id: 'mem_2',
    type: 'semantic',
    content: 'Top 3 Product Management frameworks requested in jobs: CIRCLES Method (design), RICE Framework (prioritization), and Kano Model (satisfaction).',
    tags: ['frameworks', 'study-material'],
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
  });

  await db.memories.create({
    id: 'mem_3',
    type: 'procedural',
    content: 'How to deploy Next.js apps to Azure Static Web Apps: Initialize Azure SWA CLI, configure GitHub workflow configuration, and deploy using API tokens.',
    tags: ['deployment', 'azure-swa'],
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  });

  // 8. Opportunities
  await db.opportunities.create({
    id: 'opp_1',
    title: 'Technical Product Manager, Azure AI',
    description: 'Microsoft Redmond / Remote. Lead core engineering cohorts building next-gen developer APIs for AI model orchestrations.',
    type: 'job',
    url: 'https://careers.microsoft.com/jobs/azure-ai-pm',
    metadata: { company: 'Microsoft', salary: '$140k - $210k', matchesGaps: ['Azure AI Services'] },
    relevanceScore: 96,
    status: 'discovered',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  });

  await db.opportunities.create({
    id: 'opp_2',
    title: 'Certified Product Manager (CPM)',
    description: 'AIPMM Official certification program focusing on core product lifecycle management.',
    type: 'certification',
    url: 'https://aipmm.com/certified-product-manager',
    metadata: { provider: 'AIPMM', duration: '6 weeks', cost: '$795' },
    relevanceScore: 88,
    status: 'discovered',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  });

  // 9. Approvals
  await db.approvals.create({
    id: 'app_1',
    objectiveId: obj1.id,
    taskId: t4.id,
    actionType: 'application',
    requestDetails: 'Browser Agent seeks permission to submit applicant profile and pre-filled responses to "Technical Product Manager - Azure AI" (Job ID: Azure-10928) on Microsoft Careers Portal.',
    status: 'pending',
    requestedBy: 'Browser Agent',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  });

  // 10. Notifications
  await db.notifications.create({
    id: 'not_1',
    userId: user.id,
    title: 'New High-Relevance Job Discovered',
    message: 'Opportunity Agent found "Technical Product Manager, Azure AI" matching your PM roadmap (96% Match score).',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
  });

  await db.notifications.create({
    id: 'not_2',
    userId: user.id,
    title: 'Approval Required',
    message: 'Browser Agent is ready to submit application for Azure AI TPM. Review details and approve.',
    type: 'approval_required',
    read: false,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  });

  // 11. Knowledge Graph (Nodes and Edges)
  await db.knowledgeNodes.create({ id: 'kn_user', type: 'person', label: 'Alex Carter', properties: { role: 'Admin' }, createdAt: new Date().toISOString() });
  await db.knowledgeNodes.create({ id: 'kn_obj', type: 'objective', label: 'Become a Product Manager', properties: { complexity: 'High' }, createdAt: new Date().toISOString() });
  await db.knowledgeNodes.create({ id: 'kn_tsk3', type: 'task', label: 'Build PM Portfolio Site', properties: { status: 'InProgress' }, createdAt: new Date().toISOString() });
  await db.knowledgeNodes.create({ id: 'kn_opp1', type: 'opportunity', label: 'Technical Product Manager, Azure AI', properties: { company: 'Microsoft', relevance: '96%' }, createdAt: new Date().toISOString() });
  await db.knowledgeNodes.create({ id: 'kn_doc', type: 'document', label: 'Alex_Carter_CV.pdf', properties: { type: 'Resume' }, createdAt: new Date().toISOString() });
  await db.knowledgeNodes.create({ id: 'kn_insight', type: 'insight', label: 'Skill Gap: A/B Testing & SQL', properties: { confidence: '92%' }, createdAt: new Date().toISOString() });

  await db.knowledgeEdges.create({ id: 'ke_1', sourceNodeId: 'kn_user', targetNodeId: 'kn_obj', type: 'supports', label: 'owns', createdAt: new Date().toISOString() });
  await db.knowledgeEdges.create({ id: 'ke_2', sourceNodeId: 'kn_obj', targetNodeId: 'kn_tsk3', type: 'depends_on', label: 'requires', createdAt: new Date().toISOString() });
  await db.knowledgeEdges.create({ id: 'ke_3', sourceNodeId: 'kn_tsk3', targetNodeId: 'kn_doc', type: 'related_to', label: 'references', createdAt: new Date().toISOString() });
  await db.knowledgeEdges.create({ id: 'ke_4', sourceNodeId: 'kn_obj', targetNodeId: 'kn_opp1', type: 'related_to', label: 'unlocks', createdAt: new Date().toISOString() });
  await db.knowledgeEdges.create({ id: 'ke_5', sourceNodeId: 'kn_doc', targetNodeId: 'kn_insight', type: 'generated_by', label: 'revealed', createdAt: new Date().toISOString() });
  await db.knowledgeEdges.create({ id: 'ke_6', sourceNodeId: 'kn_insight', targetNodeId: 'kn_obj', type: 'blocks', label: 'obstructs', createdAt: new Date().toISOString() });

  // 12. Intent Signals
  await db.intentSignals.create({
    id: 'is_1',
    inferredObjective: 'Pivot Careers to AI Product Management',
    sourceWebsites: ['careers.microsoft.com', 'productschool.com'],
    confidenceScore: 88,
    timestamp: new Date().toISOString()
  });

  await db.intentSignals.create({
    id: 'is_2',
    inferredObjective: 'Build AI Product Swarm with Semantic Kernel',
    sourceWebsites: ['github.com/microsoft/semantic-kernel', 'learn.microsoft.com'],
    confidenceScore: 92,
    timestamp: new Date().toISOString()
  });

  // 14. Intent Recoveries
  await db.intentRecoveries.create({
    id: 'ir_1',
    title: 'Unfinished Job Application: Azure AI PM',
    description: 'You visited the Azure AI PM job application page 4 times today but have not submitted your profile.',
    status: 'pending',
    originalContextSnippet: 'Careers at Microsoft - Job ID: Azure-10928. Pre-requisites include Cosmos DB and LLM orchestrator skills.',
    suggestedNextAction: 'Authorize the Browser Agent to sync your portfolio and submit the application package.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  });

  await db.intentRecoveries.create({
    id: 'ir_2',
    title: 'Abandoned Research: Semantic Kernel Orchestrator',
    description: 'You completed extensive reading on Semantic Kernel but did not initialize a local project or test workspace.',
    status: 'pending',
    originalContextSnippet: 'GitHub documentation on C# and TypeScript Semantic Kernel setup, memory stores, and planners.',
    suggestedNextAction: 'Resurrect research context. Generate a Node.js project scaffold with Semantic Kernel dependencies configured.',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  });

  await db.intentRecoveries.create({
    id: 'ir_3',
    title: 'Stalled Course: Product Metrics & Analytics',
    description: 'You visited ProductSchool metrics tutorials 2 days ago but did not finish the RICE framework calculation exercise.',
    status: 'pending',
    originalContextSnippet: 'RICE scoring: Reach * Impact * Confidence / Effort. Essential module for PM case study preparation.',
    suggestedNextAction: 'Review RICE methodology cheat sheet and complete the quiz.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  });

  // 15. Weekly Reflections
  await db.weeklyReflections.create({
    id: 'wr_1',
    dateRange: 'May 31 - June 6, 2026',
    objectivesAdvanced: ['Become a Product Manager: Completed skill gap analysis and generated learning roadmap.'],
    objectivesStalled: ['Launch a SaaS Startup: 0 tasks completed this week. Recommend allocation of 2 focus hours.'],
    researchAbandoned: ['Semantic Kernel Orchestrator setup (3 references analyzed, no code artifacts built).'],
    missedOpportunities: ['Technical Product Manager role at Azure AI. Relevance rating matches 96% of your experience.'],
    suggestedRecoveries: ['Resurrect Semantic Kernel integration details and scaffold demo project.', 'Submit application for Azure AI PM.'],
    recommendedActions: [
      'Approve the Browser Agent submission for Azure AI PM.',
      'Initialize Semantic Kernel project template using packages workspace.',
      'Spend 30 minutes on SaaS concept specification document.'
    ],
    createdAt: new Date().toISOString()
  });

  console.log('Seeding Completed successfully! Total users: %d, objectives: %d, tasks: %d', 
    (await db.users.list()).length, 
    (await db.objectives.list()).length, 
    (await db.tasks.list()).length
  );
}

main().catch(e => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
