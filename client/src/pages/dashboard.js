import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  GitFork,
  Play,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.js';
import AppShell from '../components/AppShell/AppShell.js';
import MetricGrid from '../components/MetricGrid/MetricGrid.js';
import { api } from '../utils/api.js';
import { formatDuration, timeAgo, getStatusBadge } from '../utils/formatters.js';
import { AGENT_BADGES } from '../utils/constants.js';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecutingWfId, setIsExecutingWfId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/workflows/dashboard');
      setDashboardData(res.data.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerRun = async (workflowId) => {
    setIsExecutingWfId(workflowId);
    try {
      await api.post(`/api/workflows/${workflowId}/execute`, {
        input: { triggerSource: 'dashboard_one_click', timestamp: new Date().toISOString() },
      });
      await fetchDashboard();
    } catch (err) {
      alert(`Trigger failed: ${err.message}`);
    } finally {
      setIsExecutingWfId(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Top Header & Fast Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Operator Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Autonomous orchestration metrics, active workflows & live AI event feed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/workflows/builder"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Prompt AI Builder</span>
            </Link>
          </div>
        </div>

        {/* Metric Grid Component */}
        <MetricGrid metrics={dashboardData?.metrics || {}} />

        {/* Two-Column Analytics Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Workflows Summary & Executions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Workflows Panel */}
            <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Active Workflows</h3>
                    <p className="text-xs text-slate-400 font-mono">Visual graph pipelines ready for execution</p>
                  </div>
                </div>
                <Link
                  href="/workflows"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {!dashboardData?.recentWorkflows || dashboardData.recentWorkflows.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-mono">
                    No workflows created yet. Click Prompt AI Builder above to generate your first visual automation!
                  </div>
                ) : (
                  dashboardData.recentWorkflows.slice(0, 4).map((wf) => {
                    const id = wf._id || wf.id;
                    const statusBadge = getStatusBadge(wf.status);
                    return (
                      <div
                        key={id}
                        className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                              {wf.name}
                            </h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                              {wf.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {wf.description || 'No description provided.'}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-slate-500">
                            <span>{wf.nodes?.length || 0} Nodes</span>
                            <span>•</span>
                            <span>{wf.executionCount || 0} Runs</span>
                            <span>•</span>
                            <span>Last active {timeAgo(wf.lastExecution || wf.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTriggerRun(id)}
                            disabled={isExecutingWfId === id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isExecutingWfId === id ? 'Starting...' : 'Run'}</span>
                          </button>
                          <Link
                            href={`/workflows/${id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                          >
                            Open Canvas
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Executions Panel */}
            <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Recent Orchestrations</h3>
                    <p className="text-xs text-slate-400 font-mono">Latest background queue jobs and agent outputs</p>
                  </div>
                </div>
                <Link
                  href="/executions"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 hover:underline"
                >
                  <span>All Executions</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="pb-3 font-semibold">Execution ID</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Duration</th>
                      <th className="pb-3 font-semibold">Started</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {!dashboardData?.recentExecutions || dashboardData.recentExecutions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No execution sessions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      dashboardData.recentExecutions.slice(0, 5).map((exec) => {
                        const id = exec._id || exec.id;
                        const statusBadge = getStatusBadge(exec.status);
                        return (
                          <tr key={id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 font-bold text-indigo-300">#{id.slice(-6)}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${statusBadge.bg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                                <span>{statusBadge.label}</span>
                              </span>
                            </td>
                            <td className="py-3 text-slate-300">{formatDuration(exec.durationMs)}</td>
                            <td className="py-3 text-slate-400">{timeAgo(exec.startedAt || exec.createdAt)}</td>
                            <td className="py-3 text-right">
                              <Link
                                href={`/executions?id=${id}`}
                                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 hover:underline"
                              >
                                <span>Inspect</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Col: AI Reasoning Activity Feed */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">AI Reasoning Feed</h3>
                <p className="text-xs text-slate-400 font-mono">Live multi-agent decision trace</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[640px]">
              {!dashboardData?.recentAiLogs || dashboardData.recentAiLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">
                  No reasoning steps emitted yet. Trigger a workflow to observe the 5 agents in action!
                </div>
              ) : (
                dashboardData.recentAiLogs.map((log, idx) => {
                  const agentMeta = AGENT_BADGES[log.agent] || AGENT_BADGES.monitoring;
                  return (
                    <div
                      key={log._id || log.id || idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${agentMeta.color}15`,
                            borderColor: `${agentMeta.color}30`,
                            color: agentMeta.color,
                          }}
                        >
                          {agentMeta.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{timeAgo(log.timestamp)}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed font-sans">{log.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
