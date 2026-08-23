import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  User,
  Shield,
  Key,
  Lock,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.js';
import AppShell from '../components/AppShell/AppShell.js';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../utils/api.js';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [healthData, setHealthData] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const router = useRouter();

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await api.get('/api/health');
      setHealthData(res.data);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Platform Settings</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Operator profile, system security diagnostics & encryption health check
            </p>
          </div>

          <button
            onClick={fetchHealth}
            className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors self-start"
            title="Refresh system diagnostics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Operator Profile</h3>
                <p className="text-xs text-slate-400 font-mono">Authentication & Session details</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-sans font-medium">Full Name</span>
                <span className="text-white font-bold">{user?.name}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-sans font-medium">Work Email</span>
                <span className="text-indigo-300 font-bold">{user?.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-sans font-medium">Assigned Role</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase font-bold text-[10px]">
                  {user?.role || 'operator'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-sans font-medium">Session ID</span>
                <span className="text-slate-400 text-[11px]">#{user?.id || user?._id}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Session</span>
              </button>
            </div>
          </div>

          {/* System Security & Encryption Diagnostics */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Security & Health Diagnostics</h3>
                <p className="text-xs text-slate-400 font-mono">Real-time backend heartbeat & subsystems</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 font-sans font-medium">AES-256 Encryption</span>
                </div>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {healthData?.checks?.credentialEncryption || 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 font-sans font-medium">Database Layer</span>
                </div>
                <span className="text-cyan-300 font-semibold">
                  {healthData?.checks?.database || 'Connected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300 font-sans font-medium">Background Job Queue</span>
                </div>
                <span className="text-purple-300 font-semibold">
                  {healthData?.checks?.redis || 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300 font-sans font-medium">LangGraph Substrate</span>
                </div>
                <span className="text-indigo-300 font-semibold">
                  {healthData?.checks?.langGraph || 'Available'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 font-sans font-medium">Node Environment</span>
                </div>
                <span className="text-slate-400">
                  {healthData?.system?.nodeVersion || process.version} ({healthData?.environment || 'development'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
