import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Sparkles,
  Save,
  Play,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertCircle,
  Brain,
  RefreshCw,
  Sliders,
  Compass,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute.js';
import AppShell from '../../components/AppShell/AppShell.js';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas.js';
import NodePalette from '../../components/NodePalette/NodePalette.js';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel.js';
import { useWorkflowStore } from '../../store/workflowStore.js';
import { api } from '../../utils/api.js';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(
    'When a new invoice arrives via Webhook, analyze it with AI, send a summary to Slack #finance, and log a row to Google Sheets'
  );
  const [generationMeta, setGenerationMeta] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'preview'

  const { workflow, nodes, edges, generateFromPrompt, saveWorkflow, isGenerating, isSaving, error, selectedNode } =
    useWorkflowStore();

  useEffect(() => {
    if (router.query.prompt) {
      const initialPrompt = String(router.query.prompt);
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt);
    } else if (nodes.length === 0) {
      handleGenerate(prompt);
    }
  }, [router.query.prompt]);

  const handleGenerate = async (targetPrompt) => {
    const text = targetPrompt || prompt;
    if (!text.trim()) return;
    try {
      const generated = await generateFromPrompt(text);
      setGenerationMeta(generated.metadata);
      setSaveSuccess(false);
    } catch (err) {
      console.error('Generation error:', err);
    }
  };

  const handleSaveAndOpen = async () => {
    try {
      const saved = await saveWorkflow();
      setSaveSuccess(true);
      const id = saved._id || saved.id;
      setTimeout(() => {
        router.push(`/workflows/${id}`);
      }, 800);
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  const handleQuickExecute = async () => {
    try {
      const saved = await saveWorkflow();
      const id = saved._id || saved.id;
      const res = await api.post(`/api/workflows/${id}/execute`, {
        input: { promptSource: prompt, timestamp: new Date().toISOString() },
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
        <div className="flex flex-col h-[calc(100vh-6.5rem)]">
          {/* Header & Prompt Bar (PromptInputPanel) */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 mb-4 shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="font-extrabold text-white text-base">Prompt-to-Workflow Architect</h2>
                  {generationMeta && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Generated via {generationMeta.providerUsed}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate(prompt)}
                    placeholder="Describe your automation in natural language..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    onClick={() => handleGenerate(prompt)}
                    disabled={isGenerating}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 shrink-0"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Regenerate Graph</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Workflow Toolbar Actions */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                <button
                  onClick={handleSaveAndOpen}
                  disabled={isSaving || nodes.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-indigo-400" />
                  <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to Studio'}</span>
                </button>

                <button
                  onClick={handleQuickExecute}
                  disabled={isSaving || nodes.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Save & Run Live</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Visual Canvas Area */}
          <div className="flex-1 flex overflow-hidden rounded-2xl border border-slate-800 relative bg-surface-300">
            {/* Left Node Palette */}
            <NodePalette />

            {/* Center Canvas */}
            <div className="flex-1 h-full relative">
              <WorkflowCanvas />
            </div>

            {/* Right Node Config Panel when selected */}
            {selectedNode && <NodeConfigPanel />}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
