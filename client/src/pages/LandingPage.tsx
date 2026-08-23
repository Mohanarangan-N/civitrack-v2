import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Eye, CheckCircle2, TrendingUp, Cpu, Lock, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold mb-6 animate-fade-in">
            <Sparkles size={14} />
            <span>AI-Powered Urban Decision Support System • Puducherry</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Converting Citizen Data into <br />
            <span className="gradient-text">Actionable Intelligence</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
            CiviTrack V2 is NOT a complaint app. It is a state-of-the-art municipal decision support system that optimizes operational costs, automates issue classification, and enables preventive maintenance for smarter urban governance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="px-8 shadow-xl shadow-accent/25">
                Get Started as Citizen
              </Button>
            </Link>
            <Link to="/map">
              <Button variant="secondary" size="lg" className="px-8">
                Explore Puducherry Map
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 text-left">
            <div className="card p-4">
              <span className="text-xs text-text-muted font-medium block">Puducherry Wards</span>
              <span className="text-2xl font-bold text-accent">10 Wards</span>
              <span className="text-[10px] text-text-muted block mt-1">100% GeoJSON Boundary Mapped</span>
            </div>
            <div className="card p-4">
              <span className="text-xs text-text-muted font-medium block">Auto Classification</span>
              <span className="text-2xl font-bold text-accent">~2 Seconds</span>
              <span className="text-[10px] text-text-muted block mt-1">Random Forest + HOG Severity</span>
            </div>
            <div className="card p-4">
              <span className="text-xs text-text-muted font-medium block">Anonymous Privacy</span>
              <span className="text-2xl font-bold text-accent">Zero Knowledge</span>
              <span className="text-[10px] text-text-muted block mt-1">EXIF Stripped + Bcrypt Hash</span>
            </div>
            <div className="card p-4">
              <span className="text-xs text-text-muted font-medium block">Resolution Guarantee</span>
              <span className="text-2xl font-bold text-accent">Citizen Verified</span>
              <span className="text-[10px] text-text-muted block mt-1">Mandatory Citizen Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Governments Invest Section */}
      <section className="py-20 bg-bg-surface border-y border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Municipalities Choose CiviTrack V2</h2>
            <p className="text-text-secondary text-sm">
              Empowering Puducherry urban planning authorities with automated workflows and data-driven insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 hover:border-accent/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4">
                <Cpu size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">AI Auto-Classification</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Random Forest ML automatically categorizes text into 8 civic domains and computes multi-factor priority scores in under 2 seconds.
              </p>
            </div>

            <div className="card p-6 hover:border-accent/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Hotspot Pattern Analysis</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Heatmaps and ward health scores allow municipal authorities to identify systemic infrastructure weaknesses and conduct preventive maintenance.
              </p>
            </div>

            <div className="card p-6 hover:border-accent/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Zero-Knowledge Anonymity</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                EXIF metadata is stripped from photos before storage. Anonymous reports generate a 6-digit token stored as a bcrypt hash — identity recovery is technically impossible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workflows */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Three-Tier Civic Workflow</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 border-l-4 border-l-accent">
              <span className="text-xs font-bold text-accent block mb-1">ROLE 1</span>
              <h3 className="text-lg font-bold mb-2">Citizen</h3>
              <ul className="text-xs text-text-secondary space-y-2">
                <li>• Report issues with Leaflet map pin & GPS</li>
                <li>• Public or zero-knowledge anonymous mode</li>
                <li>• Instagram-style community feed & stories</li>
                <li>• Earn EcoScore points & unlock badges</li>
                <li>• Confirm resolution before issue closes</li>
              </ul>
            </div>

            <div className="card p-6 border-l-4 border-l-warning">
              <span className="text-xs font-bold text-warning block mb-1">ROLE 2</span>
              <h3 className="text-lg font-bold mb-2">Ward NGO</h3>
              <ul className="text-xs text-text-secondary space-y-2">
                <li>• Exclusive verification queue for assigned ward</li>
                <li>• Approve issues (makes them public on feed)</li>
                <li>• Reject issues with mandatory reason</li>
                <li>• Escalate critical issues directly</li>
                <li>• Add internal notes for field teams</li>
              </ul>
            </div>

            <div className="card p-6 border-l-4 border-l-info">
              <span className="text-xs font-bold text-info block mb-1">ROLE 3</span>
              <h3 className="text-lg font-bold mb-2">Municipal Authority</h3>
              <ul className="text-xs text-text-secondary space-y-2">
                <li>• Command centre with Recharts analytics</li>
                <li>• Assign field teams to verified issues</li>
                <li>• Full SLA tracking & breach alerts</li>
                <li>• CSV report generation for operations</li>
                <li>• Upload photo proof of resolution</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
