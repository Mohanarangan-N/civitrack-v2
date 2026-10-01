import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal, Activity, Database, Cpu, Zap, RefreshCw,
  Play, Trash2, Lock, Shield, CheckCircle, XCircle,
  AlertTriangle, Server, Code2, BarChart3,
} from 'lucide-react';
import api from '@/api/client';
import toast from 'react-hot-toast';

const DEV_PASSCODE = 'civitrack-dev';

interface LogEntry {
  id: number;
  timestamp: string;
  function_name: string;
  duration_ms: number;
  status: 'SUCCESS' | 'ERROR';
  details: Record<string, unknown>;
}

interface Metrics {
  database: { status: string; collections: Record<string, number> };
  ml_pipeline: { status: string; categories: string[] };
  system: { python_version: string; platform: string; cpu_percent: number; memory_used_mb: number; memory_total_mb: number };
}

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === DEV_PASSCODE) {
      onAuth();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="card max-w-sm w-full p-8 border-accent/30 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-xl shadow-accent/30">
          <Shield size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">Developer Access</h1>
          <p className="text-xs text-text-muted mt-1">Private — Not for end users</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter developer passcode"
            className={`input-field text-center font-mono ${error ? 'border-danger ring-2 ring-danger/30 animate-pulse' : ''}`}
            autoFocus
          />
          <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            <Lock size={16} /> Unlock Dashboard
          </button>
        </form>
        {error && <p className="text-xs text-danger font-semibold">Incorrect passcode</p>}
      </div>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${ok ? 'bg-success animate-pulse' : 'bg-danger'}`} />
  );
}

export const DeveloperDashboard: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'playground'>('logs');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ML Playground
  const [mlText, setMlText] = useState('Large pothole near school road causing accidents');
  const [mlResult, setMlResult] = useState<Record<string, unknown> | null>(null);
  const [mlLoading, setMlLoading] = useState(false);

  // Priority Playground
  const [areaType, setAreaType] = useState('HIGHWAY');
  const [hecticLevel, setHecticLevel] = useState('BUSY');
  const [imageHazard, setImageHazard] = useState(0.7);
  const [priorityResult, setPriorityResult] = useState<Record<string, unknown> | null>(null);
  const [priorityLoading, setPriorityLoading] = useState(false);

  const headers = { 'x-dev-token': DEV_PASSCODE };

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/api/developer/logs?limit=50', { headers });
      setLogs(res.data.logs || []);
    } catch {
      // silent
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/developer/metrics', { headers });
      setMetrics(res.data);
    } catch (err) {
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchLogs();
    fetchMetrics();
  }, [authenticated]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs();
        if (activeTab === 'metrics') fetchMetrics();
      }, 3000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, activeTab]);

  const clearLogs = async () => {
    await api.delete('/api/developer/logs', { headers });
    setLogs([]);
    toast.success('Logs cleared');
  };

  const testML = async () => {
    setMlLoading(true);
    try {
      const res = await api.post('/api/developer/test-ml', { text: mlText }, { headers });
      setMlResult(res.data);
    } catch {
      toast.error('ML test failed');
    } finally {
      setMlLoading(false);
    }
  };

  const testPriority = async () => {
    setPriorityLoading(true);
    try {
      const res = await api.post('/api/developer/test-priority', {
        area_type: areaType,
        hectic_level: hecticLevel,
        image_hazard_score: imageHazard,
      }, { headers });
      setPriorityResult(res.data);
    } catch {
      toast.error('Priority test failed');
    } finally {
      setPriorityLoading(false);
    }
  };

  if (!authenticated) return <AuthGate onAuth={() => setAuthenticated(true)} />;

  const tabs = [
    { id: 'logs', label: 'Function Logs', icon: Terminal },
    { id: 'metrics', label: 'System Metrics', icon: Activity },
    { id: 'playground', label: 'ML Playground', icon: Code2 },
  ] as const;

  const priorityColor = (p: string) => ({
    LOW: 'text-success', MEDIUM: 'text-warning', HIGH: 'text-orange-400', CRITICAL: 'text-danger',
  }[p] || 'text-text-muted');

  return (
    <div className="min-h-screen bg-bg text-text-primary font-mono">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-surface/95 backdrop-blur-md border-b border-accent/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/30">
            <Terminal size={16} className="text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-text-primary">CiviTrack <span className="text-accent">DevTools</span></span>
            <span className="block text-[10px] text-text-muted">PRIVATE — DEVELOPER ONLY</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              autoRefresh ? 'border-accent bg-accent/20 text-accent' : 'border-primary/30 text-text-muted hover:border-accent/40'
            }`}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? 'Live ●' : 'Auto-Refresh'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Log Entries', value: logs.length, icon: Terminal, color: 'text-accent' },
            { label: 'DB Status', value: metrics ? 'Connected' : '…', icon: Database, color: 'text-success' },
            { label: 'ML Pipeline', value: metrics?.ml_pipeline?.status || '…', icon: Cpu, color: 'text-warning' },
            { label: 'Errors', value: logs.filter(l => l.status === 'ERROR').length, icon: AlertTriangle, color: 'text-danger' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3 border-primary/20">
              <Icon size={18} className={color} />
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">{label}</p>
                <p className={`text-sm font-extrabold ${color}`}>{String(value)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-bg-surface border border-primary/20 rounded-xl p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                activeTab === id ? 'bg-accent text-white shadow-md shadow-accent/30' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Logs */}
        {activeTab === 'logs' && (
          <div className="card border-primary/20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-bg-elevated">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Terminal size={13} /> Execution Log Stream
              </span>
              <div className="flex gap-2">
                <button onClick={fetchLogs} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <RefreshCw size={11} /> Refresh
                </button>
                <button onClick={clearLogs} className="text-xs text-danger hover:underline flex items-center gap-1">
                  <Trash2 size={11} /> Clear
                </button>
              </div>
            </div>

            <div className="h-[480px] overflow-y-auto bg-[#080e0b] p-4 space-y-1.5 text-xs">
              {logs.length === 0 ? (
                <p className="text-text-muted italic text-center py-12">
                  No logs yet. Perform actions (report issue, classify text, etc.) to see entries here.
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className={`flex gap-3 items-start p-2 rounded-lg border ${
                    log.status === 'ERROR' ? 'border-danger/30 bg-danger/5' : 'border-primary/10 hover:bg-primary/5'
                  }`}>
                    {log.status === 'SUCCESS'
                      ? <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                      : <XCircle size={13} className="text-danger shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-accent font-bold">{log.function_name}</span>
                        <span className="text-text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          log.duration_ms < 50 ? 'bg-success/20 text-success' :
                          log.duration_ms < 200 ? 'bg-warning/20 text-warning' :
                          'bg-danger/20 text-danger'
                        }`}>
                          {log.duration_ms.toFixed(1)}ms
                        </span>
                      </div>
                      {Object.keys(log.details).length > 0 && (
                        <pre className="text-[10px] text-text-muted mt-0.5 whitespace-pre-wrap break-all leading-relaxed">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <button onClick={fetchMetrics} disabled={loading} className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Metrics
            </button>

            {metrics && (
              <div className="grid md:grid-cols-3 gap-4">
                {/* DB Panel */}
                <div className="card border-primary/20 p-5 space-y-3">
                  <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <Database size={13} className="text-accent" /> Database
                  </h3>
                  <p className="text-xs">
                    <StatusDot ok={!metrics.database.status.includes('Error')} />
                    {metrics.database.status}
                  </p>
                  <div className="space-y-1.5 border-t border-primary/20 pt-3">
                    {Object.entries(metrics.database.collections).map(([col, count]) => (
                      <div key={col} className="flex justify-between text-xs">
                        <span className="text-text-muted">{col}</span>
                        <span className="text-accent font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ML Panel */}
                <div className="card border-primary/20 p-5 space-y-3">
                  <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <Cpu size={13} className="text-accent" /> ML Pipeline
                  </h3>
                  <p className="text-xs">
                    <StatusDot ok={metrics.ml_pipeline.status.includes('✅')} />
                    {metrics.ml_pipeline.status}
                  </p>
                  <div className="flex flex-wrap gap-1.5 border-t border-primary/20 pt-3">
                    {metrics.ml_pipeline.categories.map(cat => (
                      <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* System Panel */}
                <div className="card border-primary/20 p-5 space-y-3">
                  <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <Server size={13} className="text-accent" /> System
                  </h3>
                  {[
                    { label: 'Python', value: metrics.system.python_version },
                    { label: 'Platform', value: metrics.system.platform },
                    { label: 'CPU', value: `${metrics.system.cpu_percent}%` },
                    { label: 'Memory', value: `${metrics.system.memory_used_mb} / ${metrics.system.memory_total_mb} MB` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-text-muted">{label}</span>
                      <span className="text-text-primary font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: ML Playground */}
        {activeTab === 'playground' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* ML Classifier */}
            <div className="card border-primary/20 p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={13} className="text-accent" /> Text Classifier Inspector
              </h3>
              <textarea
                value={mlText}
                onChange={e => setMlText(e.target.value)}
                rows={3}
                placeholder="Enter issue description to test ML classifier…"
                className="input-field text-xs resize-none font-mono"
              />
              <button onClick={testML} disabled={mlLoading || !mlText.trim()} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <Play size={12} className={mlLoading ? 'animate-pulse' : ''} />
                {mlLoading ? 'Classifying…' : 'Run Classifier'}
              </button>
              {mlResult && (
                <div className="bg-[#080e0b] rounded-xl border border-accent/20 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Category:</span>
                    <span className="text-accent font-extrabold text-sm">{String((mlResult.result as Record<string, unknown>)?.category)}</span>
                    <span className="text-xs text-text-muted ml-auto">
                      Confidence: <span className="text-success font-bold">
                        {(((mlResult.result as Record<string, unknown>)?.confidence as number) * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted">
                    Duration: <span className="text-warning font-bold">{Number(mlResult.duration_ms).toFixed(2)}ms</span>
                  </p>
                  <pre className="text-[10px] text-text-muted overflow-auto max-h-40">
                    {JSON.stringify(mlResult.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Priority Engine */}
            <div className="card border-primary/20 p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 size={13} className="text-accent" /> Priority Formula Calculator
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Area Type</label>
                  <select value={areaType} onChange={e => setAreaType(e.target.value)} className="input-field text-xs">
                    {['HIGHWAY', 'SCHOOL_HOSPITAL', 'COMMERCIAL', 'INDUSTRIAL', 'RESIDENTIAL', 'RURAL'].map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Hectic Level</label>
                  <select value={hecticLevel} onChange={e => setHecticLevel(e.target.value)} className="input-field text-xs">
                    {['EXTREMELY_BUSY', 'BUSY', 'MODERATE', 'LOW', 'VERY_LOW'].map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">
                    Image Hazard Severity: <span className="text-accent font-bold">{imageHazard.toFixed(1)}</span>
                  </label>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={imageHazard} onChange={e => setImageHazard(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>
              <button onClick={testPriority} disabled={priorityLoading} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <Play size={12} className={priorityLoading ? 'animate-pulse' : ''} />
                {priorityLoading ? 'Calculating…' : 'Calculate Priority'}
              </button>
              {priorityResult && (
                <div className="bg-[#080e0b] rounded-xl border border-accent/20 p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-text-primary">{String(priorityResult.score)}</span>
                    <span className={`font-extrabold text-lg ${priorityColor(String(priorityResult.priority))}`}>
                      {String(priorityResult.priority)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-primary/20 pt-2">
                    {Object.entries((priorityResult.breakdown as Record<string, number>) || {}).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <p className="text-accent font-extrabold text-sm">{v}</p>
                        <p className="text-[10px] text-text-muted leading-tight">{k.replace('_pts', '').replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    Duration: <span className="text-warning font-bold">{Number(priorityResult.duration_ms).toFixed(2)}ms</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;
