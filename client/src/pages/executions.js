import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  PlaySquare,
  Activity,
  Filter,
  Eye,
  RefreshCw,
  Pause,
  Play,
  Square,
  Clock,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.js';
import AppShell from '../components/AppShell/AppShell.js';
import ExecutionTimeline from '../components/ExecutionTimeline/ExecutionTimeline.js';
import { useExecutionStore } from '../store/executionStore.js';
import { formatDuration, formatDate, timeAgo, getStatusBadge } from '../utils/formatters.js';

export default function ExecutionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedExecId, setSelectedExecId] = useState(router.query.id || null);

  const {
    executions,
    activeExecution,
    timeline,
    isLoading,
    fetchExecutions,
    fetchExecutionDetails,
    unsubscribe,
  } = useExecutionStore();

  useEffect(() => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    fetchExecutions(params);
  }, [statusFilter, fetchExecutions]);

  useEffect(() => {
    if (router.query.id) {
      setSelectedExecId(router.query.id);
      fetchExecutionDetails(router.query.id);
    }
  }, [router.query.id, fetchExecutionDetails]);

  const handleSelectExecution = (id) => {
    setSelectedExecId(id);
    fetchExecutionDetails(id);
    router.push(`/executions?id=${id}`, undefined, { shallow: true });
  };

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Live Executions</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Multi-agent orchestration audit trail, execution timelines & real-time monitoring
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const params = {};
                if (statusFilter !== 'all') params.status = statusFilter;
                fetchExecutions(params);
                if (selectedExecId) fetchExecutionDetails(selectedExecId);
              }}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh timeline"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Two-Column Execution Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 Cols): Execution Sessions Table */}
          <div className="lg:col-span-5 space-y-4">
            {/* Filter Bar */}
            <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-semibold px-2">Filter Sessions</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="RUNNING">RUNNING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="RETRYING">RETRYING</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>

            {/* List */}
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80 max-h-[640px] overflow-y-auto">
              {executions.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">
                  No execution runs found.
                </div>
              ) : (
                executions.map((exec) => {
                  const id = exec._id || exec.id;
                  const isSelected = selectedExecId === id;
                  const statusBadge = getStatusBadge(exec.status);

                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectExecution(id)}
                      className={`p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/10 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-indigo-300">
                          #{id.slice(-6)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${statusBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-white truncate">
                        {exec.workflowSnapshot?.name || 'Automation Workflow'}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Duration: {formatDuration(exec.durationMs)}</span>
                        <span>{timeAgo(exec.startedAt || exec.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (7 Cols): Active Timeline & Payload Inspector */}
          <div className="lg:col-span-7">
            {selectedExecId && activeExecution ? (
              <ExecutionTimeline execution={activeExecution} timeline={timeline} />
            ) : (
              <div className="glass-panel rounded-2xl border border-slate-800 p-16 text-center text-slate-500 flex flex-col items-center justify-center">
                <Activity className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
                <h3 className="font-bold text-white text-base">Select an Execution Session</h3>
                <p className="text-xs font-mono text-slate-400 mt-1 max-w-sm">
                  Click any execution on the left to stream its live 5-agent timeline events and output payloads.
                </p>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
