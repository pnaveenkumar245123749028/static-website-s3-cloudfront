import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  GitFork,
  Sparkles,
  Plus,
  Search,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  Layers,
  Clock,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute.js';
import AppShell from '../../components/AppShell/AppShell.js';
import { api } from '../../utils/api.js';
import { timeAgo, getStatusBadge } from '../../utils/formatters.js';

export default function WorkflowsListPage() {
  const [workflows, setWorkflows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchWorkflows = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/api/workflows', { params });
      setWorkflows(res.data.data.workflows || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [searchTerm, statusFilter]);

  const handleCreateBlank = async () => {
    try {
      const res = await api.post('/api/workflows', {
        name: 'Untitled Automation Pipeline',
        description: 'Custom visual workflow pipeline',
        nodes: [
          {
            id: 'node-1',
            type: 'trigger',
            position: { x: 100, y: 150 },
            data: {
              label: 'Webhook Trigger',
              category: 'trigger',
              provider: 'webhook',
              action: 'trigger_webhook',
              config: { path: '/webhook/v1/incoming' },
            },
          },
        ],
        edges: [],
      });
      const wf = res.data.data.workflow;
      router.push(`/workflows/${wf._id || wf.id}`);
    } catch (err) {
      alert(`Failed to create workflow: ${err.message}`);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/api/workflows/${id}/duplicate`);
      await fetchWorkflows();
    } catch (err) {
      alert(`Failed to duplicate: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/api/workflows/${id}`);
      await fetchWorkflows();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleExecute = async (id) => {
    try {
      const res = await api.post(`/api/workflows/${id}/execute`, {
        input: { triggerSource: 'list_direct_run', timestamp: new Date().toISOString() },
      });
      const execId = res.data.data.execution._id || res.data.data.execution.id;
      router.push(`/executions?id=${execId}`);
    } catch (err) {
      alert(`Execution trigger failed: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Workflows Studio</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Create, edit, version, and orchestrate visual graph automations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateBlank}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Blank Canvas</span>
            </button>

            <Link
              href="/workflows/builder"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Prompt Generator</span>
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search workflows by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Workflows Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs">
              Loading workflows...
            </div>
          ) : workflows.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs glass-panel rounded-2xl">
              No workflows matching your filter. Click "AI Prompt Generator" to generate your first automation!
            </div>
          ) : (
            workflows.map((wf) => {
              const id = wf._id || wf.id;
              const statusBadge = getStatusBadge(wf.status);
              return (
                <div
                  key={id}
                  className="glass-card rounded-2xl p-5 border flex flex-col justify-between group hover:border-indigo-500/40 relative"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                        {wf.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">v{wf.version || 1}</span>
                    </div>

                    <Link href={`/workflows/${id}`}>
                      <h3 className="font-bold text-white text-base tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {wf.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>

                    {/* Tags */}
                    {wf.tags && wf.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {wf.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Metrics & Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-slate-500">
                      <span>{wf.nodes?.length || 0} Nodes</span>
                      <span className="mx-1.5">•</span>
                      <span>{wf.executionCount || 0} Runs</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleExecute(id)}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                        title="Execute Workflow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
