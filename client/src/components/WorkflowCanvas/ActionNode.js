import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, MessageSquare, Bot, Table, Send } from 'lucide-react';

const iconMap = {
  gmail: Mail,
  slack: MessageSquare,
  discord: Bot,
  'google-sheets': Table,
};

function ActionNode({ data, selected }) {
  const Icon = iconMap[data.provider] || Send;

  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-2xl p-4 transition-all duration-200 glass-card border shadow-xl ${
        selected
          ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-slate-900/90'
          : 'border-cyan-500/30 hover:border-cyan-400/60 bg-slate-900/80'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
            Action
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 capitalize">{data.provider || 'Integration'}</span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white tracking-tight">{data.label || 'Execute Action'}</h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono">
          {data.config?.channel || data.config?.to || data.config?.spreadsheetId || data.action || 'Performs task'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(ActionNode);
