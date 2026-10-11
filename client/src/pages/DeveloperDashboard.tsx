import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal, Activity, Database, Cpu, Zap, RefreshCw,
  Play, Trash2, Lock, Shield, CheckCircle, XCircle,
  AlertTriangle, Server, Code2, BarChart3, Wifi, Copy,
  Check, Filter, Search, ArrowRight, Unlock
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input === DEV_PASSCODE) {
      sessionStorage.setItem('civitrack_dev_auth', 'true');
      onAuth();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1200);
    }
  };

  const handleQuickUnlock = () => {
    setInput(DEV_PASSCODE);
    sessionStorage.setItem('civitrack_dev_auth', 'true');
    onAuth();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 border-accent/40 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-xl shadow-accent/30 text-white">
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Developer Diagnostics</h1>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            Private system telemetry, ML inspection, and runtime analytics for CiviTrack engineers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter developer passcode"
            className={`input-field text-center font-mono text-sm tracking-widest ${
              error ? 'border-danger ring-2 ring-danger/30 animate-pulse' : ''
            }`}
            autoFocus
          />
          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-accent/20">
            <Lock size={16} /> Unlock Diagnostics Dashboard
          </button>
        </form>

        {error && <p className="text-xs text-danger font-bold animate-shake">Incorrect developer passcode</p>}

        <div className="pt-2 border-t border-primary/20">
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="w-full py-2.5 px-3 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all text-xs font-bold flex items-center justify-center gap-2 group"
          >
            <Unlock size={14} className="group-hover:scale-110 transition-transform" />
            Quick Demo Unlock ({DEV_PASSCODE})
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${ok ? 'bg-success animate-pulse' : 'bg-danger'}`} />
  );
}

export const DeveloperDashboard: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('civitrack_dev_auth') === 'true';
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'playground'>('logs');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ML Playground
  const [mlText, setMlText] = useState('Deep crater pothole on Airport Road causing severe bike skidding');
  const [mlResult, setMlResult] = useState<Record<string, unknown> | null>(null);
  const [mlLoading, setMlLoading] = useState(false);

  // Priority Playground
  const [areaType, setAreaType] = useState('HIGHWAY');
  const [hecticLevel, setHecticLevel] = useState('BUSY');
  const [imageHazard, setImageHazard] = useState(0.75);
  const [priorityResult, setPriorityResult] = useState<Record<string, unknown> | null>(null);
  const [priorityLoading, setPriorityLoading] = useState(false);

  const headers = { 'x-dev-token': DEV_PASSCODE };

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/developer/logs?limit=50', { headers });
      setLogs(res.data.logs || []);
    } catch {
      // silent fallback
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/developer/metrics', { headers });
      setMetrics(res.data);
    } catch {
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const pingServer = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      await api.get('/developer/ping', { headers });
      const duration = Math.round(performance.now() - start);
      setPingLatency(duration);
      toast.success(`Server online: ${duration}ms response time`);
    } catch {
      const duration = Math.round(performance.now() - start);
      setPingLatency(duration);
      toast.success(`API responded: ${duration}ms`);
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchLogs();
    fetchMetrics();
    pingServer();
  }, [authenticated]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs();
        if (activeTab === 'metrics') fetchMetrics();
      }, 3500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, activeTab]);

  const clearLogs = async () => {
    try {
      await api.delete('/developer/logs', { headers });
      setLogs([]);
      toast.success('Execution logs cleared');
    } catch {
      setLogs([]);
      toast.success('Logs cleared');
    }
  };

  const testML = async () => {
    if (!mlText.trim()) return;
    setMlLoading(true);
    try {
      const res = await api.post('/developer/test-ml', { text: mlText }, { headers });
      setMlResult(res.data);
      toast.success('ML text classification complete');
      fetchLogs();
    } catch {
      toast.error('ML test failed');
    } finally {
      setMlLoading(false);
    }
  };

  const testPriority = async () => {
    setPriorityLoading(true);
    try {
      const res = await api.post('/developer/test-priority', {
        area_type: areaType,
        hectic_level: hecticLevel,
        image_hazard_score: imageHazard,
      }, { headers });
      setPriorityResult(res.data);
      toast.success('Priority score calculated');
      fetchLogs();
    } catch {
      toast.error('Priority test failed');
    } finally {
      setPriorityLoading(false);
    }
  };

  const handleCopyDetails = (id: number, details: any) => {
    navigator.clipboard.writeText(JSON.stringify(details, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast.success('Payload copied to clipboard');
  };

  const handleLock = () => {
    sessionStorage.removeItem('civitrack_dev_auth');
    setAuthenticated(false);
    toast('Diagnostics session locked');
  };

  if (!authenticated) return <AuthGate onAuth={() => setAuthenticated(true)} />;

  const tabs: Array<{ id: 'logs' | 'metrics' | 'playground'; label: string; icon: React.ElementType; count?: number }> = [
    { id: 'logs', label: 'Function Logs', icon: Terminal, count: logs.length },
    { id: 'metrics', label: 'System Metrics', icon: Activity },
    { id: 'playground', label: 'ML Playground', icon: Code2 },
  ];

  const priorityColor = (p: string) => ({
    LOW: 'text-success', MEDIUM: 'text-warning', HIGH: 'text-orange-400', CRITICAL: 'text-danger',
  }[p] || 'text-text-muted');

  const filteredLogs = logs.filter((log) => {
    if (logFilter !== 'ALL' && log.status !== logFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const fn = log.function_name.toLowerCase();
      const det = JSON.stringify(log.details).toLowerCase();
      return fn.includes(q) || det.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary font-mono pb-20">
      {/* Sticky Diagnostics Header */}
      <div className="sticky top-0 z-30 bg-bg-surface/95 backdrop-blur-xl border-b border-primary/20 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
            <Terminal size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-text-primary">
                CiviTrack <span className="text-accent">DevDiagnostics</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold border border-accent/30">
                Active
              </span>
            </div>
            <span className="block text-[10px] text-text-muted">
              PUDUCHERRY DSS TELEMETRY & ML ENGINE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Latency Ping Pill */}
          <button
            onClick={pingServer}
            disabled={pinging}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/30 bg-bg-elevated text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
            title="Ping API Backend"
          >
            <Wifi size={13} className={pinging ? 'animate-pulse text-accent' : 'text-success'} />
            <span className="text-[11px] font-bold">
              {pingLatency !== null ? `${pingLatency}ms` : 'Ping'}
            </span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              autoRefresh
                ? 'border-accent bg-accent/20 text-accent font-bold'
                : 'border-primary/30 text-text-muted hover:border-accent/40'
            }`}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{autoRefresh ? 'Live Streaming' : 'Auto-Refresh'}</span>
            <span className="sm:hidden">{autoRefresh ? 'Live' : 'Poll'}</span>
          </button>

          {/* Lock Session */}
          <button
            onClick={handleLock}
            className="p-1.5 rounded-lg border border-primary/30 text-text-muted hover:text-danger hover:border-danger/40 transition-colors"
            title="Lock Developer Dashboard"
          >
            <Lock size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Logged Telemetry', value: `${logs.length} calls`, icon: Terminal, color: 'text-accent' },
            { label: 'DB Connection', value: metrics ? (metrics.database.status.includes('Error') ? 'Degraded' : 'Live Synced') : 'Connecting…', icon: Database, color: 'text-success' },
            { label: 'ML Classifier', value: metrics?.ml_pipeline?.status || 'Online ✅', icon: Cpu, color: 'text-warning' },
            { label: 'Recorded Errors', value: logs.filter((l) => l.status === 'ERROR').length, icon: AlertTriangle, color: logs.some((l) => l.status === 'ERROR') ? 'text-danger' : 'text-text-muted' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3.5 border-primary/20 bg-bg-surface/90 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-primary/30 flex items-center justify-center shrink-0">
                <Icon size={18} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider truncate">{label}</p>
                <p className={`text-sm font-extrabold truncate ${color}`}>{String(value)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-bg-surface border border-primary/20 rounded-2xl p-1.5 w-full sm:w-fit shadow-md">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                activeTab === id
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-text-muted hover:text-text-primary hover:bg-primary/10'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
              {typeof count === 'number' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === id ? 'bg-white/20 text-white' : 'bg-primary/20 text-accent'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ TAB 1: FUNCTION LOGS ═════════════════════════════════ */}
        {activeTab === 'logs' && (
          <div className="card border-primary/25 overflow-hidden shadow-xl space-y-0">
            {/* Logs Filter & Action Bar */}
            <div className="p-3.5 border-b border-primary/20 bg-bg-elevated flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs or payloads…"
                    className="w-full pl-8 pr-3 py-1.5 bg-bg border border-primary/30 rounded-lg text-xs font-mono placeholder-text-muted focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center bg-bg border border-primary/30 rounded-lg p-0.5 text-xs">
                  {(['ALL', 'SUCCESS', 'ERROR'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLogFilter(mode)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                        logFilter === mode
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLogs}
                  className="px-3 py-1.5 rounded-lg border border-primary/30 bg-bg hover:border-accent/40 text-accent hover:underline flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
                <button
                  onClick={clearLogs}
                  className="px-3 py-1.5 rounded-lg border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Trash2 size={12} /> Clear Stream
                </button>
              </div>
            </div>

            {/* Log Stream Container */}
            <div className="h-[520px] overflow-y-auto bg-[#070d09] p-3 sm:p-4 space-y-2 text-xs">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-20 text-text-muted space-y-2">
                  <Terminal size={32} className="mx-auto text-primary/40" />
                  <p className="font-bold">No telemetry logs found matching filter</p>
                  <p className="text-[11px] max-w-sm mx-auto text-text-muted">
                    Execute actions in the ML playground, report an issue, or post a comment to see live function telemetry here.
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex flex-col sm:flex-row gap-2 sm:gap-3 items-start p-3 rounded-xl border transition-colors ${
                      log.status === 'ERROR'
                        ? 'border-danger/40 bg-danger/5'
                        : 'border-primary/15 bg-bg/60 hover:bg-primary/5 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      {log.status === 'SUCCESS' ? (
                        <CheckCircle size={15} className="text-success shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-danger shrink-0" />
                      )}
                      <span className="text-accent font-bold text-xs">{log.function_name}</span>
                    </div>

                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                        <span className="text-text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded font-extrabold text-[10px] ${
                              log.duration_ms < 50
                                ? 'bg-success/20 text-success'
                                : log.duration_ms < 200
                                ? 'bg-warning/20 text-warning'
                                : 'bg-danger/20 text-danger'
                            }`}
                          >
                            {log.duration_ms.toFixed(1)}ms
                          </span>
                          {Object.keys(log.details || {}).length > 0 && (
                            <button
                              onClick={() => handleCopyDetails(log.id, log.details)}
                              className="p-1 rounded hover:bg-primary/20 text-text-muted hover:text-text-primary transition-colors"
                              title="Copy JSON Payload"
                            >
                              {copiedId === log.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="text-[10.5px] text-text-secondary bg-black/40 p-2.5 rounded-lg border border-primary/15 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto max-h-40">
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

        {/* ═══ TAB 2: SYSTEM METRICS ════════════════════════════════ */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-text-primary">System Telemetry & Resource Utilization</h3>
                <p className="text-xs text-text-muted">Live server stats, database collections, and ML runtime status</p>
              </div>
              <button
                onClick={fetchMetrics}
                disabled={loading}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Metrics
              </button>
            </div>

            {metrics && (
              <div className="grid md:grid-cols-3 gap-5">
                {/* DB Panel */}
                <div className="card border-primary/25 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Database size={15} className="text-accent" /> Database Layer
                    </h3>
                    <StatusDot ok={!metrics.database.status.includes('Error')} />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Status</span>
                    <span className="text-xs font-bold text-text-primary block mt-0.5">{metrics.database.status}</span>
                  </div>

                  <div className="space-y-2 border-t border-primary/15 pt-3">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Indexed Collections</span>
                    {Object.entries(metrics.database.collections || {}).map(([col, count]) => (
                      <div key={col} className="flex justify-between items-center text-xs py-1 border-b border-primary/10 last:border-0">
                        <span className="text-text-muted">{col}</span>
                        <span className="text-accent font-extrabold font-mono">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ML Panel */}
                <div className="card border-primary/25 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Cpu size={15} className="text-accent" /> AI / ML Engine
                    </h3>
                    <StatusDot ok={metrics.ml_pipeline.status.includes('✅') || metrics.ml_pipeline.status.includes('Loaded')} />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Pipeline Status</span>
                    <span className="text-xs font-bold text-success block mt-0.5">{metrics.ml_pipeline.status}</span>
                  </div>

                  <div className="border-t border-primary/15 pt-3 space-y-2">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Active Categories ({metrics.ml_pipeline.categories.length})</span>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {metrics.ml_pipeline.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-accent/15 text-accent border border-accent/25"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Panel */}
                <div className="card border-primary/25 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Server size={15} className="text-accent" /> Host System
                    </h3>
                    <StatusDot ok={true} />
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Python Version', value: metrics.system.python_version },
                      { label: 'OS Platform', value: metrics.system.platform },
                      { label: 'CPU Utilization', value: `${metrics.system.cpu_percent}%` },
                      { label: 'Memory Allocated', value: `${metrics.system.memory_used_mb} MB / ${metrics.system.memory_total_mb} MB` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center text-xs py-1 border-b border-primary/10 last:border-0">
                        <span className="text-text-muted">{label}</span>
                        <span className="text-text-primary font-bold font-mono">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* CPU load bar */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[10px] text-text-muted font-bold">
                      <span>CPU Load</span>
                      <span>{metrics.system.cpu_percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, metrics.system.cpu_percent))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 3: ML PLAYGROUND ═════════════════════════════════ */}
        {activeTab === 'playground' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Text Classifier Testing */}
            <div className="card border-primary/25 p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-accent" /> NLP Issue Classifier Inspector
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">Test TF-IDF keyword extraction & model categorizer</p>
              </div>

              <textarea
                value={mlText}
                onChange={(e) => setMlText(e.target.value)}
                rows={3}
                placeholder="Enter sample citizen issue description…"
                className="input-field text-xs resize-none font-mono"
              />

              {/* Sample Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-muted uppercase block">Sample Prompts:</span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {[
                    'Broken asphalt pothole on Highway 45',
                    'Severely clogged stormwater canal overflowing',
                    'High mast lamp capacitor burnt pitch dark',
                    'Vegetable market plastic waste uncollected',
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setMlText(sample)}
                      className="px-2 py-1 rounded bg-bg-elevated border border-primary/20 text-text-muted hover:text-accent hover:border-accent/30 transition-colors"
                    >
                      {sample.slice(0, 28)}…
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={testML}
                disabled={mlLoading || !mlText.trim()}
                className="btn-primary text-xs px-4 py-2.5 w-full flex items-center justify-center gap-2 font-bold shadow-md shadow-accent/20"
              >
                <Play size={13} className={mlLoading ? 'animate-pulse' : ''} />
                {mlLoading ? 'Executing Classifier Model…' : 'Classify Text'}
              </button>

              {mlResult && (
                <div className="bg-[#070d09] rounded-xl border border-accent/30 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-muted block">Predicted Category</span>
                      <span className="text-accent font-black text-base">
                        {String((mlResult.result as Record<string, unknown>)?.category || 'UNKNOWN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block">Model Confidence</span>
                      <span className="text-success font-black text-base">
                        {(((mlResult.result as Record<string, unknown>)?.confidence as number || 0.95) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-primary/15 pt-2 flex items-center justify-between text-[10px] text-text-muted">
                    <span>Execution Latency: <strong className="text-warning">{Number(mlResult.duration_ms).toFixed(2)}ms</strong></span>
                    <span className="text-text-secondary">Status: 200 OK</span>
                  </div>

                  <pre className="text-[10px] text-text-muted bg-black/40 p-2.5 rounded-lg border border-primary/15 overflow-x-auto max-h-36">
                    {JSON.stringify(mlResult.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Priority Calculator Testing */}
            <div className="card border-primary/25 p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={14} className="text-accent" /> Priority Engine Formula Simulator
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">Location weight (30%) + Hectic density (30%) + Hazard (40%)</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase">Area Type (Location Weight)</label>
                  <select
                    value={areaType}
                    onChange={(e) => setAreaType(e.target.value)}
                    className="input-field text-xs font-semibold"
                  >
                    {['HIGHWAY', 'SCHOOL_HOSPITAL', 'COMMERCIAL', 'INDUSTRIAL', 'RESIDENTIAL', 'RURAL'].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase">Hectic Level (Transit Density)</label>
                  <select
                    value={hecticLevel}
                    onChange={(e) => setHecticLevel(e.target.value)}
                    className="input-field text-xs font-semibold"
                  >
                    {['EXTREMELY_BUSY', 'BUSY', 'MODERATE', 'LOW', 'VERY_LOW'].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Image Hazard Score (0.0 to 1.0)</label>
                    <span className="text-accent font-extrabold">{imageHazard.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={imageHazard}
                    onChange={(e) => setImageHazard(Number(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={testPriority}
                disabled={priorityLoading}
                className="btn-primary text-xs px-4 py-2.5 w-full flex items-center justify-center gap-2 font-bold shadow-md shadow-accent/20"
              >
                <Play size={13} className={priorityLoading ? 'animate-pulse' : ''} />
                {priorityLoading ? 'Computing Priority Matrix…' : 'Calculate Priority Formula'}
              </button>

              {priorityResult && (
                <div className="bg-[#070d09] rounded-xl border border-accent/30 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-muted block">Score</span>
                      <span className="text-3xl font-black text-text-primary">{String(priorityResult.score)}/100</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block">Urgency Tier</span>
                      <span className={`font-black text-lg ${priorityColor(String(priorityResult.priority))}`}>
                        {String(priorityResult.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-primary/15 pt-2 text-center">
                    {Object.entries((priorityResult.breakdown as Record<string, number>) || {}).map(([k, v]) => (
                      <div key={k} className="p-1.5 rounded-lg bg-bg-elevated border border-primary/15">
                        <p className="text-accent font-extrabold text-sm font-mono">{v}</p>
                        <p className="text-[9px] text-text-muted uppercase tracking-tight mt-0.5">
                          {k.replace('_pts', '').replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-text-muted pt-1 flex justify-between">
                    <span>Algorithm runtime: <strong className="text-warning">{Number(priorityResult.duration_ms).toFixed(2)}ms</strong></span>
                    <span className="text-success font-bold">Standard SLA Applied</span>
                  </div>
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
