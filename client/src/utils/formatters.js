export function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDuration(ms) {
  if (!ms || ms <= 0) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(2);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const remSec = (seconds % 60).toFixed(1);
  return `${mins}m ${remSec}s`;
}

export function timeAgo(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 5) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getStatusBadge(status) {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'ACTIVE':
    case 'CONNECTED':
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-400',
        label: status,
      };
    case 'RUNNING':
      return {
        bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse',
        dot: 'bg-cyan-400',
        label: 'RUNNING',
      };
    case 'RETRYING':
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse',
        dot: 'bg-amber-400',
        label: 'RETRYING',
      };
    case 'PAUSED':
      return {
        bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        dot: 'bg-yellow-400',
        label: 'PAUSED',
      };
    case 'FAILED':
    case 'ERROR':
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        dot: 'bg-rose-400',
        label: status,
      };
    case 'CANCELLED':
      return {
        bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        dot: 'bg-slate-400',
        label: 'CANCELLED',
      };
    case 'DRAFT':
    case 'DISCONNECTED':
    default:
      return {
        bg: 'bg-slate-800 border-slate-700 text-slate-400',
        dot: 'bg-slate-500',
        label: status || 'PENDING',
      };
  }
}
