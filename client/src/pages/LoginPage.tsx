import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Sparkles, Users, Shield, Building2 } from 'lucide-react';
import { authAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      setAuth(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.name}! 🌿`);
      if (data.user.role === 'AUTHORITY') navigate('/authority');
      else if (data.user.role === 'NGO') navigate('/ngo');
      else navigate('/feed');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Citizen', email: 'citizen@civitrack.in', password: 'citizen123', icon: Users, color: 'from-emerald-500 to-teal-600' },
    { label: 'NGO', email: 'ngo.whitetown@civitrack.in', password: 'ngo123', icon: Shield, color: 'from-amber-500 to-orange-600' },
    { label: 'Authority', email: 'authority@civitrack.in', password: 'authority123', icon: Building2, color: 'from-blue-500 to-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-orb ambient-orb-green w-[400px] h-[400px] -top-32 -left-32" />
        <div className="ambient-orb ambient-orb-blue w-[300px] h-[300px] top-1/2 -right-32" />
        <div className="ambient-orb ambient-orb-gold w-[250px] h-[250px] -bottom-20 left-1/3" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-10 max-w-sm mx-auto w-full relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent via-emerald-400 to-primary flex items-center justify-center shadow-2xl shadow-accent/40">
              <span className="text-3xl">🏛️</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Civi<span className="text-accent">Track</span>
            <span className="text-xs ml-2 px-1.5 py-0.5 rounded-md bg-accent/20 text-accent font-bold border border-accent/30">V2</span>
          </h1>
          <p className="text-sm text-text-muted mt-1 font-medium">Puducherry Civic Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-6 shadow-2xl shadow-black/30 animate-scale-in">
          <h2 className="text-xl font-extrabold text-text-primary mb-1">Welcome back 👋</h2>
          <p className="text-xs text-text-muted mb-6">Sign in to continue your civic journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-bg/60 border border-primary/30 rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-bg/60 border border-primary/30 rounded-2xl px-4 py-3.5 pr-12 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3.5 top-3.5 text-text-muted hover:text-accent transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-emerald-500 text-white font-extrabold text-base shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-primary/20" />
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Quick Demo</span>
              <div className="flex-1 h-px bg-primary/20" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(({ label, email: dEmail, password: dPwd, icon: Icon, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setEmail(dEmail); setPassword(dPwd); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-primary/20 bg-bg/40 hover:border-accent/40 hover:bg-accent/5 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted group-hover:text-text-primary">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          New here?{' '}
          <Link to="/register" className="text-accent font-extrabold hover:underline">
            Create account → +25 pts
          </Link>
        </p>
      </div>
    </div>
  );
};
