import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Award, ChevronDown } from 'lucide-react';
import { authAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { WARDS } from '@/utils/constants';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'CITIZEN', label: 'Citizen Reporter', emoji: '🏙️', desc: 'Report civic issues in your ward' },
  { value: 'NGO', label: 'NGO Officer', emoji: '🛡️', desc: 'Verify and escalate reports' },
  { value: 'AUTHORITY', label: 'Municipal Authority', emoji: '🏛️', desc: 'Manage and resolve issues' },
];

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CITIZEN', ward: WARDS[0], language: 'en' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    try {
      const data = await authAPI.register(form);
      setAuth(data.user, data.access_token);
      toast.success('Welcome to CiviTrack! +25 EcoScore awarded 🎉');
      navigate('/feed');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-orb ambient-orb-green w-[350px] h-[350px] -top-24 -right-24" />
        <div className="ambient-orb ambient-orb-blue w-[300px] h-[300px] bottom-10 -left-24" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-sm mx-auto w-full relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent to-primary mx-auto flex items-center justify-center shadow-2xl shadow-accent/30 mb-3">
            <span className="text-2xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-black text-text-primary">
            Join Civi<span className="text-accent">Track</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30">
            <Award size={12} className="text-accent" />
            <span className="text-xs font-extrabold text-accent">+25 EcoScore Welcome Bonus</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5 px-1">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 flex-1 ${step >= s ? 'text-accent' : 'text-text-muted'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all ${step >= s ? 'bg-accent text-white shadow-md shadow-accent/40' : 'bg-bg-elevated border border-primary/30 text-text-muted'}`}>
                  {s}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">{s === 1 ? 'Your Info' : 'Your Role'}</span>
              </div>
              {s < 2 && <div className={`flex-shrink-0 w-8 h-px transition-colors ${step > s ? 'bg-accent' : 'bg-primary/30'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-2xl shadow-black/30 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Ravi Kumar"
                    className="w-full bg-bg/60 border border-primary/30 rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="ravi@example.com"
                    className="w-full bg-bg/60 border border-primary/30 rounded-2xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      className="w-full bg-bg/60 border border-primary/30 rounded-2xl px-4 py-3.5 pr-12 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3.5 top-3.5 text-text-muted hover:text-accent transition-colors">
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-emerald-500 text-white font-extrabold text-base shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <>
                {/* Role Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">I am a…</label>
                  {ROLES.map(({ value, label, emoji, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        form.role === value
                          ? 'border-accent bg-accent/10 shadow-md shadow-accent/20'
                          : 'border-primary/20 bg-bg/40 hover:border-primary/40'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${form.role === value ? 'bg-accent/20' : 'bg-bg-elevated'}`}>
                        {emoji}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-text-primary">{label}</p>
                        <p className="text-[11px] text-text-muted">{desc}</p>
                      </div>
                      {form.role === value && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Ward & Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Ward</label>
                    <div className="relative">
                      <select
                        value={form.ward}
                        onChange={(e) => setForm({ ...form, ward: e.target.value })}
                        className="w-full appearance-none bg-bg/60 border border-primary/30 rounded-2xl px-3 py-3 pr-8 text-xs text-text-primary focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                      >
                        {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Language</label>
                    <div className="relative">
                      <select
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                        className="w-full appearance-none bg-bg/60 border border-primary/30 rounded-2xl px-3 py-3 pr-8 text-xs text-text-primary focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                      >
                        <option value="en">English</option>
                        <option value="ta">தமிழ்</option>
                        <option value="fr">Français</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-2xl border border-primary/30 text-text-secondary text-sm font-bold hover:border-primary/50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-accent to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <> 🎉 Create Account </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-extrabold hover:underline">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};
