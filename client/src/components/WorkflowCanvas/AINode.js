import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain, Sparkles, Cpu } from 'lucide-react';

function AINode({ data, selected }) {
  const isGemini = data.provider === 'gemini';
  const Icon = isGemini ? Sparkles : Brain;

  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-2xl p-4 transition-all duration-200 glass-card border shadow-xl ${
        selected
          ? 'border-purple-400 ring-2 ring-purple-500/30 bg-slate-900/90'
          : 'border-purple-500/30 hover:border-purple-400/60 bg-slate-900/80'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
            AI Agent
          </span>
        </div>
        <span className="text-[10px] font-mono text-purple-300 capitalize">{data.provider || 'OpenRouter'}</span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white tracking-tight">{data.label || 'AI Reasoning Step'}</h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono">
          {data.config?.model || data.config?.prompt || 'Analyzes payload and generates response'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(AINode);
