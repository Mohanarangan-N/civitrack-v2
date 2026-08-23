import React, { useState } from 'react';
import { issuesAPI } from '@/api';
import { Shield, KeyRound, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export const AnonymousTrackPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await issuesAPI.trackAnonymous(token.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid tracking code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      
      <div className="card p-8 border-warning/40 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning to-accent mx-auto flex items-center justify-center shadow-xl shadow-warning/20 mb-3">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Track Anonymous Report</h1>
          <p className="text-xs text-text-muted mt-1">
            No Login Required • Enter your 6-digit alphanumeric token
          </p>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">
              6-Digit Tracking Code
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="e.g., A7X9K2"
              className="input-field text-center font-mono font-black text-xl tracking-widest uppercase text-warning"
            />
          </div>

          <Button type="submit" disabled={loading || !token} className="w-full py-3 bg-warning text-bg font-extrabold">
            {loading ? 'Verifying Bcrypt Hash...' : 'Track Issue Status'} <Search size={16} />
          </Button>
        </form>

        {/* Error state */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-danger/15 border border-danger/40 text-xs font-bold text-danger text-center">
            {error}
          </div>
        )}

        {/* Success result */}
        {result && (
          <div className="mt-6 p-4 rounded-xl bg-bg-elevated border border-accent/40 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
              <span className="text-xs font-bold text-accent">{result.category}</span>
              <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-xs font-bold">
                {result.status}
              </span>
            </div>

            <h3 className="font-bold text-sm text-text-primary">{result.title}</h3>
            <p className="text-xs text-text-muted">Ward: {result.ward}</p>

            <div className="pt-2 border-t border-primary/10">
              <span className="text-[11px] font-bold text-text-muted block mb-2">Audit History:</span>
              <div className="space-y-1 text-xs">
                {(result.status_history || []).map((h: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-text-secondary">
                    <span>• {h.status}</span>
                    <span className="text-[10px] text-text-muted">{h.note || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
