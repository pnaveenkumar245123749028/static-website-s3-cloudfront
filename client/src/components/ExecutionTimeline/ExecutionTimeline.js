import { useState } from 'react';
import {
  Compass,
  Zap,
  ShieldCheck,
  LifeBuoy,
  Activity,
  Cpu,
  Clock,
  Pause,
  Play,
  Square,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { AGENT_BADGES } from '../../utils/constants.js';
import { formatDuration, formatDate, getStatusBadge } from '../../utils/formatters.js';
import LogPayloadModal from './LogPayloadModal.js';
import { useExecutionStore } from '../../store/executionStore.js';

const iconMap = {
  planner: Compass,
  execution: Zap,
  validation: ShieldCheck,
  recovery: LifeBuoy,
  monitoring: Activity,
  orchestrator: Cpu,
};

export default function ExecutionTimeline({ execution, timeline = [] }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const { pauseExecution, resumeExecution, cancelExecution } = useExecutionStore();

  if (!execution) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 glass-panel rounded-2xl">
        <Activity className="w-8 h-8 mb-2 animate-pulse text-slate-600" />
        <p className="text-sm font-mono">Select or trigger an execution to stream live agent events.</p>
      </div>
    );
  }

  const executionId = execution._id || execution.id;
  const statusInfo = getStatusBadge(execution.status);
  const isRunning = execution.status === 'RUNNING' || execution.status === 'RETRYING';
  const isPaused = execution.status === 'PAUSED';

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
      {/* Execution Top Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${statusInfo.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
            <span>{statusInfo.label}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base">
                Execution <span className="font-mono text-indigo-400">#{executionId?.slice(-6)}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                ({execution.orchestrationMetadata?.langGraph ? 'LangGraph Active' : 'Native Chain'})
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Started {formatDate(execution.startedAt)} • Duration: {formatDuration(execution.durationMs)}
            </p>
          </div>
        </div>

        {/* Play / Pause / Cancel Controls */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              onClick={() => pauseExecution(executionId)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={() => resumeExecution(executionId)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          {(isRunning || isPaused) && (
            <button
              onClick={() => cancelExecution(executionId)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {timeline.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-600" />
            Initializing multi-agent execution pipeline...
          </div>
        ) : (
          timeline.map((event, idx) => {
            const agentMeta = AGENT_BADGES[event.agent] || AGENT_BADGES.monitoring;
            const Icon = iconMap[event.agent] || Activity;
            const hasPayload = event.payload && Object.keys(event.payload).length > 0;

            return (
              <div key={event.id || event._id || idx} className="flex items-start gap-3.5 group">
                {/* Agent Icon Badge */}
                <div
                  className="p-2 rounded-xl border shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${agentMeta.color}15`,
                    borderColor: `${agentMeta.color}35`,
                    color: agentMeta.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Event Message and Card */}
                <div className="flex-1 bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-3.5 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${agentMeta.color}20`,
                          borderColor: `${agentMeta.color}40`,
                          color: agentMeta.color,
                        }}
                      >
                        {agentMeta.label}
                      </span>
                      {event.nodeLabel && (
                        <span className="text-[11px] font-semibold text-slate-300">
                          [{event.nodeLabel}]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {formatDate(event.timestamp)}
                      </span>
                      {hasPayload && (
                        <button
                          onClick={() => setSelectedLog(event)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 p-1 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1 font-mono"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="text-[10px]">Inspect</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-xs leading-relaxed mt-1 ${
                      event.level === 'error'
                        ? 'text-rose-400 font-medium'
                        : event.level === 'warning'
                        ? 'text-amber-300'
                        : event.level === 'success'
                        ? 'text-emerald-300 font-medium'
                        : 'text-slate-300'
                    }`}
                  >
                    {event.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payload Modal */}
      {selectedLog && <LogPayloadModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
