import { useEffect } from 'react';
import Link from 'next/link';
import { X, CheckCheck, Bell, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore.js';
import { timeAgo } from '../../utils/formatters.js';

export default function NotificationsDrawer() {
  const { notifications, isOpen, setIsOpen, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'error':
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface-200 border-l border-slate-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
              <Bell className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Execution Notifications</h3>
              <p className="text-xs text-slate-400 font-mono">Real-time alerts & agent milestones</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded hover:bg-indigo-500/10 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Bell className="w-10 h-10 mb-3 text-slate-600 stroke-[1.5]" />
              <p className="font-medium text-slate-400">No notifications yet</p>
              <p className="text-xs mt-1">Agent events and execution milestones will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const id = item._id || item.id;
              return (
                <div
                  key={id}
                  onClick={() => !item.read && markAsRead(id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-850/90 border-indigo-500/30 text-slate-200 shadow-sm shadow-indigo-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-semibold truncate ${item.read ? 'text-slate-300' : 'text-white'}`}>
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.message}</p>
                      {item.executionId && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <Link
                            href={`/executions?id=${item.executionId}`}
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 hover:underline"
                          >
                            <span>Inspect Timeline</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
