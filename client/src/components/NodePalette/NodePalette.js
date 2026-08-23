import { useState } from 'react';
import {
  Radio,
  Clock,
  Mail,
  MessageSquare,
  Bot,
  Table,
  Brain,
  Sparkles,
  GitBranch,
  Search,
  Plus,
  GripVertical,
} from 'lucide-react';
import { PALETTE_CATEGORIES } from './paletteConfig.js';
import { useWorkflowStore } from '../../store/workflowStore.js';

const iconMap = {
  webhook: Radio,
  schedule: Clock,
  gmail: Mail,
  slack: MessageSquare,
  discord: Bot,
  'google-sheets': Table,
  openrouter: Brain,
  gemini: Sparkles,
  filter: GitBranch,
};

export default function NodePalette() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addNode } = useWorkflowStore();

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData('application/agentflow-node', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddClick = (item) => {
    addNode(item.category, item.category, item.provider, item.name, item.defaultAction, item.defaultConfig);
  };

  return (
    <div className="w-72 glass-panel border-r border-slate-800/80 flex flex-col h-full overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80">
        <h3 className="font-bold text-white text-sm">Node Palette</h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Drag to canvas or click + to add</p>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Palette Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {PALETTE_CATEGORIES.map((categoryGroup) => {
          const filteredItems = categoryGroup.items.filter(
            (i) =>
              i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              i.provider.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={categoryGroup.category}>
              <h4 className="text-[11px] font-mono font-semibold uppercase text-slate-400 px-2 mb-2 tracking-wider">
                {categoryGroup.title}
              </h4>

              <div className="space-y-1.5">
                {filteredItems.map((item) => {
                  const Icon = iconMap[item.provider] || Brain;
                  return (
                    <div
                      key={item.provider}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing group shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                        <div
                          className={`p-1.5 rounded-lg border shrink-0 ${
                            item.category === 'trigger'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : item.category === 'ai'
                              ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                              : item.category === 'action'
                              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                              : 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{item.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddClick(item)}
                        className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-indigo-600/30 hover:text-indigo-300 transition-colors shrink-0 ml-1"
                        title="Add to canvas"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
