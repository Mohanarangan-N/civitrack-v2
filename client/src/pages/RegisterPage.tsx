import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Mail, Lock, MapPin, Globe, Award } from 'lucide-react';
import { authAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { WARDS } from '@/utils/constants';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CITIZEN',
    ward: WARDS[0],
    language: 'en',
  });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authAPI.register(form);
      setAuth(data.user, data.access_token);
      toast.success('Registration successful! +25 EcoScore Welcome Bonus awarded 🎉');
      navigate('/feed');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 shadow-2xl border-primary/30">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-primary mx-auto flex items-center justify-center shadow-lg shadow-accent/20 mb-2">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary">Join CiviTrack V2</h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 mt-1">
            <Award size={12} /> Earn +25 EcoScore Bonus
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ravi Kumar"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="ravi@example.com"
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Puducherry Ward</label>
              <select
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
                className="input-field"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="fr">Français (French)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-field font-semibold text-accent"
            >
              <option value="CITIZEN">Citizen Reporter 🎭</option>
              <option value="NGO">Ward NGO Officer 🛡️</option>
              <option value="AUTHORITY">Municipal Authority 🏛️</option>
            </select>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 mt-2">
            {loading ? 'Creating account...' : 'Create Account & Claim +25 Pts'}
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
