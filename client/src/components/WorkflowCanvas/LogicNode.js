import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Filter, Clock } from 'lucide-react';

function LogicNode({ data, selected }) {
  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-2xl p-4 transition-all duration-200 glass-card border shadow-xl ${
        selected
          ? 'border-yellow-400 ring-2 ring-yellow-500/30 bg-slate-900/90'
          : 'border-yellow-500/30 hover:border-yellow-400/60 bg-slate-900/80'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-yellow-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <GitBranch className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400 px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
            Logic
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 capitalize">{data.provider || 'Filter'}</span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white tracking-tight">{data.label || 'Condition & Filter'}</h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono">
          {data.config?.condition || 'Evaluates context expression'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-yellow-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(LogicNode);
