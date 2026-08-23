import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Radio, Clock, Mail, Zap } from 'lucide-react';

const iconMap = {
  webhook: Radio,
  schedule: Clock,
  gmail: Mail,
};

function TriggerNode({ data, selected }) {
  const Icon = iconMap[data.provider] || Zap;

  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-2xl p-4 transition-all duration-200 glass-card border shadow-xl ${
        selected
          ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-900/90'
          : 'border-emerald-500/30 hover:border-emerald-400/60 bg-slate-900/80'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            Trigger
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 capitalize">{data.provider || 'Webhook'}</span>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-sm font-bold text-white tracking-tight">{data.label || 'Workflow Trigger'}</h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono">
          {data.config?.path || data.config?.cron || data.action || 'Awaiting incoming event'}
        </p>
      </div>

      {/* Target & Source Handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-background hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(TriggerNode);
