import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Bot,
  Sparkles,
  ArrowRight,
  Compass,
  Zap,
  ShieldCheck,
  LifeBuoy,
  Activity,
  Layers,
  Cpu,
  Mail,
  MessageSquare,
  Table,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function LandingPage() {
  const { user } = useAuthStore();
  const [demoPrompt, setDemoPrompt] = useState(
    'When a new invoice arrives via Webhook, analyze it with AI, notify the team on Slack, and log to Google Sheets'
  );
  const router = useRouter();

  const handleTryDemo = () => {
    if (user) {
      router.push(`/workflows/builder?prompt=${encodeURIComponent(demoPrompt)}`);
    } else {
      router.push(`/register?redirect=/workflows/builder&prompt=${encodeURIComponent(demoPrompt)}`);
    }
  };

  const agents = [
    {
      name: 'Planner Agent',
      icon: Compass,
      color: '#6366f1',
      desc: 'Performs DAG topological ordering, resolves dependencies, and calculates plan confidence score.',
    },
    {
      name: 'Execution Agent',
      icon: Zap,
      color: '#06b6d4',
      desc: 'Executes individual node steps against third-party OAuth APIs (Gmail, Slack, Sheets) and AI models.',
    },
    {
      name: 'Validation Agent',
      icon: ShieldCheck,
      color: '#10b981',
      desc: 'Verifies output schema integrity, required fields, and non-empty responses per step.',
    },
    {
      name: 'Recovery Agent',
      icon: LifeBuoy,
      color: '#f59e0b',
      desc: 'Classifies failure signatures and triggers automated exponential backoff retries or smart escalation.',
    },
    {
      name: 'Monitoring Agent',
      icon: Activity,
      color: '#8b5cf6',
      desc: 'Streams real-time event logs to connected browsers and records a full execution audit timeline.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-indigo-500">
      {/* Navigation Bar */}
      <nav className="h-20 border-b border-slate-800/80 glass-panel sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">Agentflow</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-bold border border-indigo-500/30">
                AI
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Agentic Automation Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
            >
              <span>Open Operator Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Multi-Agent Operations Automation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl leading-[1.1]">
          Turn natural language into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            executable visual workflows
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl leading-relaxed">
          Describe any business automation in plain English. Agentflow_AI instantly generates a visual graph, deploys
          it to a drag-and-drop canvas, and executes it through a cooperating 5-agent reasoning engine.
        </p>

        {/* Interactive Prompt Showcase Box */}
        <div className="mt-12 w-full max-w-3xl glass-panel-glow rounded-3xl p-4 sm:p-6 border text-left shadow-2xl">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Prompt to Visual Workflow Generator</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={demoPrompt}
              onChange={(e) => setDemoPrompt(e.target.value)}
              placeholder="e.g. When customer asks for refund on Discord, check status and email receipt..."
              className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              onClick={handleTryDemo}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Generate Workflow</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-slate-500">Quick ideas:</span>
            <button
              onClick={() =>
                setDemoPrompt('Schedule daily 9 AM AI summary of Gmail inbox and post to Slack #leadership')
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              Daily Email Digest
            </button>
            <button
              onClick={() =>
                setDemoPrompt('When invoice webhook triggers, classify urgency with Claude and log to Google Sheets')
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              Invoice Routing
            </button>
            <button
              onClick={() =>
                setDemoPrompt('Listen to Discord bot commands, run Gemini AI reasoning, and send Slack alert')
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              Discord Ops Alert
            </button>
          </div>
        </div>
      </section>

      {/* 5-Agent Architecture Section */}
      <section className="py-20 px-6 lg:px-12 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-3">
              Cooperating Multi-Agent Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A 5-Agent chain powering resilient execution
            </h3>
            <p className="text-slate-400 mt-4 text-base">
              Every single node is orchestrated by specialized AI agents that plan, validate, recover, and monitor runs
              with zero silent failures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="glass-card rounded-2xl p-5 border flex flex-col justify-between relative group hover:border-indigo-500/40"
                >
                  <div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
                      style={{
                        backgroundColor: `${agent.color}20`,
                        borderColor: `${agent.color}40`,
                        color: agent.color,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mb-1">Phase 0{i + 1}</div>
                    <h4 className="font-bold text-white text-base tracking-tight mb-2">{agent.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active in Orchestrator</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Third-Party Integrations & Security Grid */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Integrations & Security
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Real OAuth connections with AES-256 encrypted credentials
            </h3>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Connect your Gmail, Slack, Discord, Google Sheets, OpenRouter, and Gemini accounts securely. Tokens are
              encrypted at rest using application-level cryptographic keys.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic OAuth token exchange & refresh cycles</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Explicit AUTH_EXPIRED errors instead of silent drops</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live Socket.IO event streaming to your operator dashboard</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <span>Launch Agentflow Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 flex flex-col items-center text-center">
              <Mail className="w-8 h-8 text-red-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Gmail API</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">Send & Read Mail</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 flex flex-col items-center text-center">
              <MessageSquare className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Slack API</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">Channels & Alerts</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 flex flex-col items-center text-center">
              <Bot className="w-8 h-8 text-indigo-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Discord Bot</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">Webhooks & Messages</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-100 border border-slate-800 flex flex-col items-center text-center">
              <Table className="w-8 h-8 text-emerald-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Google Sheets</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">Append Rows & Ranges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 lg:px-12 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        Agentflow_AI • Agentic AI Operations Platform • Next.js & Node.js
      </footer>
    </div>
  );
}
