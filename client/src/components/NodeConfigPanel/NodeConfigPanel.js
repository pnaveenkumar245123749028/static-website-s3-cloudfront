import React from 'react';
import { X, Trash2, Sliders, Info, Code } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';

export default function NodeConfigPanel() {
  const { selectedNode, setSelectedNode, updateNodeData, deleteNode } = useWorkflowStore();

  if (!selectedNode) return null;

  const { id, data = {} } = selectedNode;
  const { label = '', category = 'action', provider = 'system', action = '', config = {} } = data;

  const handleLabelChange = (e) => {
    updateNodeData(id, { label: e.target.value });
  };

  const handleConfigChange = (key, value) => {
    updateNodeData(id, {
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleDelete = () => {
    deleteNode(id);
  };

  return (
    <div className="w-80 glass-panel border-l border-slate-800/80 flex flex-col h-full overflow-hidden shrink-0 animate-in slide-in-from-right-10 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Node Configuration</h3>
            <p className="text-[11px] text-slate-400 font-mono capitalize">
              {provider} ({category})
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Configuration Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node Label */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Step Label</label>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Dynamic Fields Per Provider */}
        {provider === 'webhook' && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Webhook Endpoint Path</label>
              <input
                type="text"
                value={config.path || '/webhook/v1/incoming'}
                onChange={(e) => handleConfigChange('path', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">HTTP Method</label>
              <select
                value={config.method || 'POST'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
          </>
        )}

        {provider === 'schedule' && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cron Expression</label>
              <input
                type="text"
                value={config.cron || '0 9 * * *'}
                onChange={(e) => handleConfigChange('cron', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">Default: Daily at 9:00 AM (0 9 * * *)</span>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Schedule Description</label>
              <input
                type="text"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </>
        )}

        {provider === 'gmail' && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Recipient (To Email)</label>
              <input
                type="text"
                placeholder="ops@company.com"
                value={config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Subject</label>
              <input
                type="text"
                placeholder="Subject line with {{template}}"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Body (HTML / Text)</label>
              <textarea
                rows={4}
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                placeholder="<p>Summary: {{ai.summary}}</p>"
              />
            </div>
          </>
        )}

        {provider === 'slack' && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Channel</label>
              <input
                type="text"
                value={config.channel || '#general-ops'}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Message Text</label>
              <textarea
                rows={3}
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                placeholder="Alert: {{ai.summary || trigger.payload}}"
              />
            </div>
          </>
        )}

        {provider === 'discord' && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Message Content</label>
              <textarea
                rows={3}
                value={config.content || ''}
                onChange={(e) => handleConfigChange('content', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                placeholder="Event triggered: {{ai.text}}"
              />
            </div>
          </>
        )}

        {provider === 'google-sheets' && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Spreadsheet ID</label>
              <input
                type="text"
                value={config.spreadsheetId || 'ops_ledger'}
                onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Sheet Range</label>
              <input
                type="text"
                value={config.range || 'Sheet1!A:E'}
                onChange={(e) => handleConfigChange('range', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
          </>
        )}

        {(provider === 'openrouter' || provider === 'gemini') && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">AI Model</label>
              <input
                type="text"
                value={config.model || (provider === 'gemini' ? 'gemini-1.5-flash' : 'anthropic/claude-3.5-sonnet')}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Prompt / Instructions</label>
              <textarea
                rows={4}
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                placeholder="Analyze the incoming payload..."
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-semibold">Temperature</label>
                <span className="font-mono text-indigo-400">{config.temperature || 0.3}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature || 0.3}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </>
        )}

        {provider === 'filter' && (
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Condition Expression</label>
            <textarea
              rows={3}
              value={config.condition || ''}
              onChange={(e) => handleConfigChange('condition', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
              placeholder='payload.status === "ACTIVE"'
            />
          </div>
        )}

        {/* Template Variables Helper Card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Template Variables Available</span>
          </div>
          <p className="font-mono text-[10px] text-indigo-300">
            {'{{ai.summary}}'}, {'{{trigger.payload}}'}, {'{{workflow.name}}'}
          </p>
        </div>
      </div>

      {/* Delete / Actions Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <button
          onClick={handleDelete}
          className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium flex items-center justify-center gap-2 transition-colors text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Node from Canvas</span>
        </button>
      </div>
    </div>
  );
}
