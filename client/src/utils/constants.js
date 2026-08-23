export const AGENT_BADGES = {
  planner: {
    label: 'Planner Agent',
    color: '#6366f1',
    bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    iconName: 'Compass',
  },
  execution: {
    label: 'Execution Agent',
    color: '#06b6d4',
    bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
    iconName: 'Zap',
  },
  validation: {
    label: 'Validation Agent',
    color: '#10b981',
    bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    iconName: 'ShieldCheck',
  },
  recovery: {
    label: 'Recovery Agent',
    color: '#f59e0b',
    bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    iconName: 'LifeBuoy',
  },
  monitoring: {
    label: 'Monitoring Agent',
    color: '#8b5cf6',
    bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    iconName: 'Activity',
  },
  orchestrator: {
    label: 'Orchestrator',
    color: '#3b82f6',
    bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    iconName: 'Cpu',
  },
};

export const PROVIDERS_METADATA = {
  webhook: {
    name: 'Webhook Trigger',
    category: 'trigger',
    icon: 'Radio',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  schedule: {
    name: 'Schedule / Cron',
    category: 'trigger',
    icon: 'Clock',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  gmail: {
    name: 'Gmail',
    category: 'action',
    icon: 'Mail',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  slack: {
    name: 'Slack',
    category: 'action',
    icon: 'MessageSquare',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  discord: {
    name: 'Discord',
    category: 'action',
    icon: 'Bot',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  'google-sheets': {
    name: 'Google Sheets',
    category: 'action',
    icon: 'Table',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  openrouter: {
    name: 'OpenRouter AI',
    category: 'ai',
    icon: 'Brain',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  gemini: {
    name: 'Google Gemini',
    category: 'ai',
    icon: 'Sparkles',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  filter: {
    name: 'Filter / Logic',
    category: 'logic',
    icon: 'GitBranch',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
};
