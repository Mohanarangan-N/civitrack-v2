import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Sparkles, MapPin, Eye, CheckCircle2, TrendingUp, Cpu, Lock, Award, Users,
  ArrowRight, Zap, Globe, Database, BarChart3, Brain, Layers, Camera, MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

/* ─── Animated Counter Hook ─────────────────────────────────── */
function useCountUp(target: number, duration = 2000, trigger = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

/* ─── Intersection Observer Hook ────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Stat Counter Card ─────────────────────────────────────── */
function StatCounter({ value, suffix = '', label, sublabel, delay = 0 }: {
  value: number; suffix?: string; label: string; sublabel: string; delay?: number;
}) {
  const { ref, inView } = useInView();
  const count = useCountUp(value, 1800, inView);
  return (
    <div ref={ref} className="card-premium p-5 opacity-0 animate-slide-up" style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
      <span className="text-[11px] text-text-muted font-medium block uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-black text-accent mt-1 block">{count}{suffix}</span>
      <span className="text-[10px] text-text-muted block mt-1">{sublabel}</span>
    </div>
  );
}

/* ─── Tech Stack Item ───────────────────────────────────────── */
function TechBadge({ icon: Icon, name, detail }: { icon: React.ElementType; name: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/50 border border-primary/15 hover:border-accent/30 transition-all duration-300 group">
      <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
        <Icon size={18} />
      </div>
      <div>
        <span className="text-xs font-bold text-text-primary block">{name}</span>
        <span className="text-[10px] text-text-muted">{detail}</span>
      </div>
    </div>
  );
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-bg text-text-primary overflow-hidden">

      {/* ═══ HERO SECTION ═══════════════════════════════════════════ */}
      <section className="relative pt-24 pb-28 overflow-hidden">
        {/* Ambient orbs */}
        <div className="ambient-orb ambient-orb-green w-[500px] h-[500px] -top-40 -left-20" />
        <div className="ambient-orb ambient-orb-blue w-[400px] h-[400px] top-20 right-0" />
        <div className="ambient-orb ambient-orb-gold w-[300px] h-[300px] bottom-0 left-1/3" />

        {/* Grid mesh background */}
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-accent text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>AI-Powered Urban Decision Support System</span>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-[10px] font-bold">SIH 2025</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-slide-up">
            Converting Citizen Data into <br />
            <span className="gradient-text">Actionable Intelligence</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary leading-relaxed mb-10 animate-fade-in-slow">
            CiviTrack V2 is NOT a complaint app. It is a state-of-the-art municipal decision support system
            that optimizes operational costs, automates issue classification with <span className="text-accent font-semibold">95.56% accuracy</span>,
            and enables preventive maintenance for smarter urban governance in Puducherry.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {isAuthenticated ? (
              user?.role === 'AUTHORITY' ? (
                <Link to="/authority">
                  <Button size="lg" className="px-8 shadow-xl shadow-accent/25 group bg-accent hover:bg-accent/80 text-white font-bold">
                    Go to Authority Command DSS
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : user?.role === 'NGO' ? (
                <Link to="/ngo">
                  <Button size="lg" className="px-8 shadow-xl shadow-warning/25 group bg-warning hover:bg-warning/80 text-black font-bold">
                    Go to NGO Verification Hub
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/feed">
                  <Button size="lg" className="px-8 shadow-xl shadow-accent/25 group">
                    Explore Citizen Feed
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )
            ) : (
              <Link to="/register">
                <Button size="lg" className="px-8 shadow-xl shadow-accent/25 group">
                  Get Started as Citizen
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
            <Link to="/map">
              <Button variant="secondary" size="lg" className="px-8">
                <MapPin size={18} className="mr-2" />
                Explore Puducherry Map
              </Button>
            </Link>
          </div>

          {/* Animated Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            <StatCounter value={10} label="Puducherry Wards" sublabel="100% GeoJSON Mapped" delay={100} />
            <StatCounter value={95} suffix="%" label="ML Accuracy" sublabel="TF-IDF + Random Forest" delay={200} />
            <StatCounter value={8} label="Issue Categories" sublabel="Auto-Classified by AI" delay={300} />
            <StatCounter value={3} label="User Roles" sublabel="Citizen · NGO · Authority" delay={400} />
          </div>
        </div>
      </section>

      {/* ═══ AI/ML CAPABILITIES ═════════════════════════════════════ */}
      <section className="py-20 bg-bg-surface/50 border-y border-primary/10 relative">
        <div className="ambient-orb ambient-orb-green w-[300px] h-[300px] top-0 right-10 opacity-30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-3 block">AI & ML Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Why Municipalities Choose CiviTrack V2</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Empowering Puducherry urban planning authorities with automated workflows and data-driven insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu, title: 'AI Auto-Classification',
                desc: 'Random Forest ML automatically categorizes text into 8 civic domains and computes multi-factor priority scores — all in under 2 seconds.',
                stat: '95.56%', statLabel: 'Accuracy',
              },
              {
                icon: Camera, title: 'AI Vision Evidence Scoring',
                desc: 'HOG texture analysis, edge density, and luminance scoring automatically verify image evidence against reported category and detect fabricated uploads.',
                stat: '<2s', statLabel: 'Processing',
              },
              {
                icon: Lock, title: 'Zero-Knowledge Anonymity',
                desc: 'EXIF metadata stripped from photos. Anonymous reports generate a 6-digit token stored as a bcrypt hash — identity recovery is technically impossible.',
                stat: '100%', statLabel: 'Untraceable',
              },
            ].map((item, i) => (
              <div key={i} className="card-premium p-6 group opacity-0 animate-slide-up" style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}>
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">{item.desc}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-primary/15">
                  <span className="text-xl font-black text-accent">{item.stat}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — HORIZONTAL TIMELINE ════════════════════ */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-3 block">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold">How CiviTrack V2 Works</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: 1, icon: Users, title: 'Citizen Reports', desc: 'Photo, GPS pin, description' },
              { step: 2, icon: Camera, title: 'AI Vision Scan', desc: 'HOG + luminance analysis' },
              { step: 3, icon: Brain, title: 'ML Classification', desc: 'TF-IDF + Random Forest' },
              { step: 4, icon: Shield, title: 'NGO Verification', desc: 'Ward-level approval' },
              { step: 5, icon: BarChart3, title: 'Priority Scoring', desc: 'Multi-factor formula' },
              { step: 6, icon: CheckCircle2, title: 'Resolution', desc: 'Citizen-verified close' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-primary/30 border border-accent/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-accent/10">
                  <item.icon size={22} className="text-accent" />
                </div>
                <span className="text-[10px] font-bold text-accent block mb-1">STEP {item.step}</span>
                <h4 className="text-xs font-bold text-text-primary mb-0.5">{item.title}</h4>
                <p className="text-[10px] text-text-muted">{item.desc}</p>
                {i < 5 && (
                  <ChevronRight size={14} className="absolute top-6 -right-2 text-primary/40 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THREE-TIER ROLE WORKFLOW ═══════════════════════════════ */}
      <section className="py-20 bg-bg-surface/50 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-12">Three-Tier Civic Workflow</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-premium p-6 border-l-4 border-l-accent">
              <span className="text-xs font-bold text-accent block mb-1">ROLE 1</span>
              <h3 className="text-lg font-bold mb-3">Citizen</h3>
              <ul className="text-xs text-text-secondary space-y-2.5">
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" /> Report issues with Leaflet map pin & GPS</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" /> Public or zero-knowledge anonymous mode</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" /> Instagram-style community feed & stories</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" /> Earn EcoScore points & unlock badges</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" /> Confirm resolution before issue closes</li>
              </ul>
            </div>

            <div className="card-premium p-6 border-l-4 border-l-warning">
              <span className="text-xs font-bold text-warning block mb-1">ROLE 2</span>
              <h3 className="text-lg font-bold mb-3">Ward NGO</h3>
              <ul className="text-xs text-text-secondary space-y-2.5">
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-warning shrink-0 mt-0.5" /> Exclusive verification queue for assigned ward</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-warning shrink-0 mt-0.5" /> Approve issues (makes them public on feed)</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-warning shrink-0 mt-0.5" /> Reject issues with mandatory reason</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-warning shrink-0 mt-0.5" /> Escalate critical issues directly</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-warning shrink-0 mt-0.5" /> Add internal notes for field teams</li>
              </ul>
            </div>

            <div className="card-premium p-6 border-l-4 border-l-info">
              <span className="text-xs font-bold text-info block mb-1">ROLE 3</span>
              <h3 className="text-lg font-bold mb-3">Municipal Authority</h3>
              <ul className="text-xs text-text-secondary space-y-2.5">
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-info shrink-0 mt-0.5" /> Command centre with Recharts analytics</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-info shrink-0 mt-0.5" /> Assign field teams to verified issues</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-info shrink-0 mt-0.5" /> Full SLA tracking & breach alerts</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-info shrink-0 mt-0.5" /> CSV report generation for operations</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-info shrink-0 mt-0.5" /> Upload photo proof of resolution</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ════════════════════════════════════════════ */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-3 block">Architecture</span>
            <h2 className="text-3xl font-extrabold">Complete Tech Stack</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <TechBadge icon={Layers} name="React 18 + TypeScript" detail="Frontend Framework" />
            <TechBadge icon={Zap} name="FastAPI (Python)" detail="Async Backend" />
            <TechBadge icon={Database} name="MongoDB Atlas" detail="2dsphere Geospatial" />
            <TechBadge icon={Brain} name="Scikit-Learn" detail="TF-IDF + Random Forest" />
            <TechBadge icon={MapPin} name="Leaflet Maps" detail="Ward GeoJSON + Heatmap" />
            <TechBadge icon={BarChart3} name="Recharts" detail="Analytics Dashboard" />
            <TechBadge icon={MessageSquare} name="Socket.IO" detail="Real-time WebSockets" />
            <TechBadge icon={Lock} name="JWT + bcrypt" detail="RBAC Security" />
          </div>
        </div>
      </section>

      {/* ═══ DEMO CREDENTIALS + FOOTER CTA ═════════════════════════ */}
      <section className="py-20 bg-bg-surface/50 border-t border-primary/10 relative">
        <div className="ambient-orb ambient-orb-green w-[400px] h-[400px] bottom-0 left-0 opacity-20" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-extrabold mb-4">Try CiviTrack V2 Now</h2>
          <p className="text-sm text-text-secondary mb-8">
            Use the demo credentials below to explore the full platform as any role.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <Link to="/login" className="demo-chip-citizen justify-center">
              <Users size={16} />
              <div className="text-left">
                <span className="block font-bold">Citizen</span>
                <span className="text-[10px] opacity-70">citizen@civitrack.in</span>
              </div>
            </Link>
            <Link to="/login" className="demo-chip-ngo justify-center">
              <Shield size={16} />
              <div className="text-left">
                <span className="block font-bold">Ward NGO</span>
                <span className="text-[10px] opacity-70">ngo.whitetown@civitrack.in</span>
              </div>
            </Link>
            <Link to="/login" className="demo-chip-authority justify-center">
              <BarChart3 size={16} />
              <div className="text-left">
                <span className="block font-bold">Authority</span>
                <span className="text-[10px] opacity-70">authority@civitrack.in</span>
              </div>
            </Link>
          </div>

          <Link to="/register">
            <Button size="lg" className="px-10 shadow-xl shadow-accent/25">
              Get Started — Create Account <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>

          <p className="text-[10px] text-text-muted mt-8">
            All demo accounts use password: <code className="px-1.5 py-0.5 bg-bg-elevated rounded text-accent font-mono">citizen123</code> / <code className="px-1.5 py-0.5 bg-bg-elevated rounded text-accent font-mono">ngo123</code> / <code className="px-1.5 py-0.5 bg-bg-elevated rounded text-accent font-mono">authority123</code>
          </p>
        </div>
      </section>
    </div>
  );
};
