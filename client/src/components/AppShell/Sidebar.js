import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Sparkles,
  GitFork,
  PlaySquare,
  PlugZap,
  Settings,
  Bot,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Workflow Builder', path: '/workflows/builder', icon: Sparkles, badge: 'AI' },
  { label: 'Workflows', path: '/workflows', icon: GitFork },
  { label: 'Live Executions', path: '/executions', icon: PlaySquare },
  { label: 'Integrations Hub', path: '/integrations', icon: PlugZap },
  { label: 'Settings & Security', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter();

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 w-64 glass-panel border-r border-slate-800/80 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-tight text-base">Agentflow</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-semibold border border-indigo-500/30">
              AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Agentic Automation</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
          Operations Console
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            router.pathname === item.path ||
            (item.path === '/workflows' && router.pathname.startsWith('/workflows') && router.pathname !== '/workflows/builder');

          return (
            <Link
              key={item.path}
              href={item.path}
              prefetch={false}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono font-semibold border border-indigo-500/40">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Orchestrator Status Pill in Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">5-Agent Engine</span>
            <span className="text-[10px] font-mono text-emerald-400">All Agents Healthy</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
