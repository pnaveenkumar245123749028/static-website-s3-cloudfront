import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  PlugZap,
  Mail,
  MessageSquare,
  Bot,
  Table,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Lock,
  Key,
  Power,
  ShieldCheck,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.js';
import AppShell from '../components/AppShell/AppShell.js';
import { api } from '../utils/api.js';

const PROVIDERS_CONFIG = [
  {
    provider: 'gmail',
    name: 'Gmail Integration',
    category: 'action',
    icon: Mail,
    color: 'text-red-400',
    bg: 'from-red-500/10 to-red-600/5 border-red-500/20',
    desc: 'Send HTML emails, monitor incoming customer messages, and read email metadata over OAuth.',
    scopes: ['gmail.send', 'gmail.readonly'],
    hasOAuth: true,
  },
  {
    provider: 'slack',
    name: 'Slack Workspaces',
    category: 'action',
    icon: MessageSquare,
    color: 'text-amber-400',
    bg: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    desc: 'Post incident alerts, send interactive agent reports, and dispatch messages to channels.',
    scopes: ['chat:write', 'channels:read'],
    hasOAuth: true,
  },
  {
    provider: 'discord',
    name: 'Discord Bot & Webhooks',
    category: 'action',
    icon: Bot,
    color: 'text-indigo-400',
    bg: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
    desc: 'Post alerts and rich embeds to Discord guild channels via bot integration or incoming webhooks.',
    scopes: ['bot', 'webhook.incoming'],
    hasOAuth: true,
  },
  {
    provider: 'google-sheets',
    name: 'Google Sheets',
    category: 'action',
    icon: Table,
    color: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    desc: 'Append transaction records, sync pipeline events, and read spreadsheet ranges.',
    scopes: ['spreadsheets', 'drive.file'],
    hasOAuth: true,
  },
  {
    provider: 'openrouter',
    name: 'OpenRouter AI Models',
    category: 'ai',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    desc: 'Access Claude 3.5 Sonnet, GPT-4o, and DeepSeek for intelligent reasoning & decision agents.',
    hasApiKey: true,
  },
  {
    provider: 'gemini',
    name: 'Google Gemini AI',
    category: 'ai',
    icon: Sparkles,
    color: 'text-cyan-400',
    bg: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
    desc: 'High-speed multimodal reasoning and workflow step execution via Gemini 1.5 Flash.',
    hasApiKey: true,
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrationsList, setIntegrationsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState({});
  const [apiKeyModal, setApiKeyModal] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState({});

  const fetchIntegrations = async () => {
    try {
      const res = await api.get('/api/integrations');
      setIntegrationsList(res.data.data.integrations || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load integrations:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    if (router.query.connected) {
      alert(`Integration "${router.query.connected}" connected successfully!`);
    }
  }, [router.query.connected]);

  const handleOAuthConnect = async (provider) => {
    try {
      const res = await api.get(`/api/integrations/oauth/${provider}/start`);
      if (res.data.data?.authUrl) {
        window.location.href = res.data.data.authUrl;
      }
    } catch (err) {
      alert(`OAuth initiation failed: ${err.message}`);
    }
  };

  const handleTestConnection = async (provider) => {
    setIsTesting((prev) => ({ ...prev, [provider]: true }));
    try {
      const res = await api.post(`/api/integrations/${provider}/test`);
      setTestResults((prev) => ({ ...prev, [provider]: res.data.data }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { ok: false, message: err.response?.data?.error || err.message },
      }));
    } finally {
      setIsTesting((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyModal || !apiKeyInput) return;
    try {
      await api.post('/api/integrations', {
        provider: apiKeyModal,
        apiKey: apiKeyInput,
      });
      setApiKeyModal(null);
      setApiKeyInput('');
      await fetchIntegrations();
      alert(`Saved API key for ${apiKeyModal}`);
    } catch (err) {
      alert(`Failed to save key: ${err.message}`);
    }
  };

  const handleToggle = async (provider, currentEnabled) => {
    try {
      await api.post('/api/integrations', {
        provider,
        enabled: !currentEnabled,
      });
      await fetchIntegrations();
    } catch (err) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Disconnect ${provider}?`)) return;
    try {
      await api.delete(`/api/integrations/${provider}`);
      await fetchIntegrations();
    } catch (err) {
      alert(`Disconnect failed: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Integrations Hub</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Connect external services, OAuth providers, and AI reasoning models with encrypted keys
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>AES-256 Encrypted at Rest</span>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROVIDERS_CONFIG.map((config) => {
            const Icon = config.icon;
            const currentRecord = integrationsList.find((i) => i.provider === config.provider);
            const isConnected = currentRecord?.status === 'connected' || currentRecord?.isEnvConfigured;
            const isEnabled = currentRecord?.enabled !== false;
            const testResult = testResults[config.provider];

            return (
              <div
                key={config.provider}
                className="glass-card rounded-2xl p-6 border flex flex-col justify-between group hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Top Status Row */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.bg} border`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isConnected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base tracking-tight">{config.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{config.desc}</p>

                  {/* Scopes */}
                  {config.scopes && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {config.scopes.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Test Result Message */}
                  {testResult && (
                    <div
                      className={`mt-3 p-2.5 rounded-xl text-xs font-mono flex items-start gap-2 border ${
                        testResult.ok
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      {testResult.ok ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      )}
                      <span className="break-all">{testResult.message}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestConnection(config.provider)}
                    disabled={isTesting[config.provider]}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isTesting[config.provider] ? 'animate-spin text-indigo-400' : ''}`}
                    />
                    <span>{isTesting[config.provider] ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {config.hasOAuth && (
                      <button
                        onClick={() => handleOAuthConnect(config.provider)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
                      >
                        {isConnected ? 'Reconnect' : 'Connect OAuth'}
                      </button>
                    )}

                    {config.hasApiKey && (
                      <button
                        onClick={() => {
                          setApiKeyModal(config.provider);
                          setApiKeyInput('');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1"
                      >
                        <Key className="w-3 h-3" />
                        <span>{isConnected ? 'Update Key' : 'Add API Key'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* API Key Modal Dialog */}
        {apiKeyModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface-100 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <h3 className="font-bold text-white text-base mb-1">
                Configure {apiKeyModal === 'gemini' ? 'Google Gemini' : 'OpenRouter'} Key
              </h3>
              <p className="text-xs text-slate-400 font-mono mb-4">
                Keys will be encrypted using AES-256 before persisting to storage.
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">API Secret Key</label>
                  <input
                    type="password"
                    required
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setApiKeyModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Save Encrypted Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
