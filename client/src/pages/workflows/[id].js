import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Play,
  Copy,
  Trash2,
  Sliders,
  Activity,
  Layers,
  CheckCircle2,
  RefreshCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute.js';
import AppShell from '../../components/AppShell/AppShell.js';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas.js';
import NodePalette from '../../components/NodePalette/NodePalette.js';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel.js';
import ExecutionTimeline from '../../components/ExecutionTimeline/ExecutionTimeline.js';
import { useWorkflowStore } from '../../store/workflowStore.js';
import { useExecutionStore } from '../../store/executionStore.js';
import { api } from '../../utils/api.js';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTimelineDrawer, setShowTimelineDrawer] = useState(false);
  const [activeExecId, setActiveExecId] = useState(null);

  const {
    workflow,
    nodes,
    edges,
    setWorkflow,
    saveWorkflow,
    selectedNode,
    isSaving,
  } = useWorkflowStore();

  const {
    activeExecution,
    timeline,
    fetchExecutionDetails,
    unsubscribe,
  } = useExecutionStore();

  // Load workflow
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const loadWorkflow = async () => {
      try {
        const res = await api.get(`/api/workflows/${id}`);
        setWorkflow(res.data.data.workflow);
        setIsLoading(false);
      } catch (err) {
        alert(`Failed to load workflow: ${err.message}`);
        router.push('/workflows');
      }
    };

    loadWorkflow();

    return () => {
      unsubscribe();
    };
  }, [id, setWorkflow, router, unsubscribe]);

  const handleSave = async () => {
    try {
      await saveWorkflow();
      setSaveStatus('Workflow saved!');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleExecute = async () => {
    if (!id) return;
    setIsExecuting(true);
    try {
      // First save any unsaved canvas edits
      await saveWorkflow();

      const res = await api.post(`/api/workflows/${id}/execute`, {
        input: { triggerSource: 'editor_run', triggeredAt: new Date().toISOString() },
      });

      const exec = res.data.data.execution;
      const execId = exec._id || exec.id;
      setActiveExecId(execId);
      setShowTimelineDrawer(true);

      await fetchExecutionDetails(execId);
    } catch (err) {
      alert(`Execution trigger failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    try {
      const res = await api.post(`/api/workflows/${id}/duplicate`);
      const cloned = res.data.data.workflow;
      router.push(`/workflows/${cloned._id || cloned.id}`);
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/api/workflows/${id}`);
      router.push('/workflows');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (isLoading || !workflow) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 font-mono text-sm">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <span>Loading Workflow Canvas...</span>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex flex-col h-[calc(100vh-6.5rem)]">
          {/* Top Workflow Studio Toolbar */}
          <div className="glass-panel rounded-2xl p-3.5 sm:p-4 border border-slate-800 mb-4 shrink-0 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/workflows"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Back to workflows"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={workflow.name}
                    onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                    className="font-extrabold text-white text-base bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1"
                  />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    v{workflow.version || 1}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono px-1">
                  {nodes.length} Nodes • {edges.length} Connections
                </p>
              </div>
            </div>

            {/* Actions: Duplicate, Delete, Timeline drawer toggle, Save, Run */}
            <div className="flex items-center gap-2">
              {saveStatus && <span className="text-xs font-mono text-emerald-400 font-semibold mr-2">{saveStatus}</span>}

              {activeExecId && (
                <button
                  onClick={() => setShowTimelineDrawer(!showTimelineDrawer)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    showTimelineDrawer
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Live Stream</span>
                </button>
              )}

              <button
                onClick={handleDuplicate}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Duplicate workflow"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleDelete}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                title="Delete workflow"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>

              <button
                onClick={handleExecute}
                disabled={isExecuting || nodes.length === 0}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Starting...' : 'Execute Agent Chain'}</span>
              </button>
            </div>
          </div>

          {/* Main 3-Column Visual Studio Canvas Area */}
          <div className="flex-1 flex overflow-hidden rounded-2xl border border-slate-800 relative bg-surface-300">
            {/* Left Node Palette */}
            <NodePalette />

            {/* Center Canvas */}
            <div className="flex-1 h-full relative">
              <WorkflowCanvas />
            </div>

            {/* Right Node Config Panel */}
            {selectedNode && <NodeConfigPanel />}
          </div>

          {/* Live Agent Timeline Overlay Drawer */}
          {showTimelineDrawer && activeExecId && (
            <div className="mt-4 animate-in slide-in-from-bottom duration-200">
              <ExecutionTimeline execution={activeExecution} timeline={timeline} />
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
