import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { authAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'AUTHORITY') navigate('/authority');
      else if (data.user.role === 'NGO') navigate('/ngo');
      else navigate('/feed');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword(roleEmail.startsWith('authority') ? 'authority123' : roleEmail.startsWith('ngo') ? 'ngo123' : 'citizen123');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 shadow-2xl border-primary/30">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary mx-auto flex items-center justify-center shadow-lg shadow-accent/20 mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary">Sign In to CiviTrack</h2>
          <p className="text-xs text-text-muted mt-1">Urban Decision Support System for Puducherry</p>
        </div>

        {/* Demo Quick Logins */}
        <div className="mb-6 p-3 bg-bg-elevated border border-primary/20 rounded-xl text-xs">
          <span className="font-bold text-accent block mb-1">Quick Demo Accounts:</span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              onClick={() => handleDemoLogin('citizen@civitrack.in')}
              className="p-1.5 rounded bg-primary/20 hover:bg-primary/40 text-text-primary text-center font-medium"
            >
              Citizen 🎭
            </button>
            <button
              onClick={() => handleDemoLogin('ngo.whitetown@civitrack.in')}
              className="p-1.5 rounded bg-warning/20 hover:bg-warning/30 text-warning text-center font-medium"
            >
              NGO 🛡️
            </button>
            <button
              onClick={() => handleDemoLogin('authority@civitrack.in')}
              className="p-1.5 rounded bg-accent/20 hover:bg-accent/30 text-accent text-center font-medium"
            >
              Authority 🏛️
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="citizen@civitrack.in"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 mt-2">
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">
            Register now (+25 EcoScore pts)
          </Link>
        </p>
      </div>
    </div>
  );
};
