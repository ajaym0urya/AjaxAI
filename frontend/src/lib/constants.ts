// API and WebSocket base URLs
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/ws';

// Agent definitions for the swarm center
export const AGENT_DEFINITIONS = [
  { id: 'chief-orchestrator', name: 'Chief Orchestrator', icon: '🧠', color: '#3b82f6', role: 'Coordinates all agents and manages swarm intelligence' },
  { id: 'planner', name: 'Planner Agent', icon: '📋', color: '#8b5cf6', role: 'Generates roadmaps and task sequences' },
  { id: 'research', name: 'Research Agent', icon: '🔍', color: '#06b6d4', role: 'Web research and market analysis' },
  { id: 'memory', name: 'Memory Agent', icon: '💾', color: '#10b981', role: 'Stores and retrieves context memories' },
  { id: 'browser', name: 'Browser Agent', icon: '🌐', color: '#f59e0b', role: 'Automated web browsing and form submission' },
  { id: 'knowledge', name: 'Knowledge Agent', icon: '🕸', color: '#ec4899', role: 'Builds and queries the knowledge graph' },
  { id: 'opportunity', name: 'Opportunity Agent', icon: '💡', color: '#a78bfa', role: 'Discovers jobs, events, and certifications' },
  { id: 'validator', name: 'Validator Agent', icon: '✅', color: '#34d399', role: 'Quality checks and approval gating' },
  { id: 'reporting', name: 'Reporting Agent', icon: '📊', color: '#fb923c', role: 'Weekly reflections and progress reports' },
  { id: 'recovery', name: 'Recovery Agent', icon: '🔄', color: '#f87171', role: 'Intent recovery and stalled objective resurrection' },
  { id: 'communication', name: 'Communication Agent', icon: '✉️', color: '#60a5fa', role: 'Drafts emails and professional messages' },
  { id: 'security', name: 'Security Agent', icon: '🔒', color: '#94a3b8', role: 'Monitors approvals and enforces policies' },
];

// Color palette
export const COLORS = {
  bg: '#0A0A0A',
  surface: '#111111',
  surfaceHover: '#161616',
  border: '#252525',
  borderLight: '#2e2e2e',
  accent: '#0078D4',   // Azure Blue
  accentLight: '#1a8fe3',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  purple: '#7c3aed',
  cyan: '#0891b2',
  pink: '#db2777',
};

// Status badge colors
export const STATUS_COLORS: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Running: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Working: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Completed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Draft: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  Pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  InProgress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Blocked: 'text-red-400 bg-red-400/10 border-red-400/20',
  Failed: 'text-red-400 bg-red-400/10 border-red-400/20',
  Paused: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Idle: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  Monitoring: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  Waiting: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  discovered: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  applied: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  ignored: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  approved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
};
