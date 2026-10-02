import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, Users, Building2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

interface AccessDeniedPageProps {
  requiredRole?: string;
  pageTitle?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  requiredRole = 'AUTHORITY',
  pageTitle = 'Restricted Municipal Portal',
}) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const getRoleHome = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'AUTHORITY') return '/authority';
    if (user?.role === 'NGO') return '/ngo';
    return '/feed';
  };

  const getRoleLabel = (r?: string) => {
    if (r === 'AUTHORITY') return 'Municipal Authority (PMC / PWD)';
    if (r === 'NGO') return 'Verified Ward NGO Inspector';
    if (r === 'CITIZEN') return 'Registered Citizen';
    return 'Authorized Personnel';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="ambient-orb ambient-orb-red w-[400px] h-[400px] -top-20 -left-20 opacity-40" />
        <div className="ambient-orb ambient-orb-gold w-[300px] h-[300px] bottom-10 right-10 opacity-30" />
      </div>

      <div className="card max-w-lg w-full p-8 md:p-10 border-2 border-danger/40 shadow-2xl shadow-danger/10 text-center relative z-10 space-y-6 animate-scale-in">
        
        {/* Shield Icon */}
        <div className="relative inline-flex mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-danger/30 via-danger/20 to-bg-surface border-2 border-danger/50 flex items-center justify-center shadow-xl shadow-danger/20">
            <ShieldAlert size={40} className="text-danger animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-bg-surface border-2 border-danger flex items-center justify-center">
            <Lock size={14} className="text-danger" />
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-danger px-3 py-1 rounded-full bg-danger/10 border border-danger/30 inline-block">
            Security Clearance Required
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary">
            Access Restricted
          </h1>
          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            The page <strong className="text-text-primary">"{pageTitle}"</strong> is restricted to <span className="text-danger font-bold">{getRoleLabel(requiredRole)}</span> credentials.
          </p>
        </div>

        {/* Identity Comparison Box */}
        <div className="p-4 rounded-2xl bg-bg-elevated border border-primary/20 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-primary/10">
            <span className="text-text-muted font-medium">Your Current Account</span>
            <span className="font-extrabold text-accent flex items-center gap-1">
              <Users size={12} /> {user?.name || 'Guest / Unauthenticated'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted font-medium">Your Active Role</span>
            <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-primary/20 text-text-primary">
              {user?.role || 'NONE'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted font-medium">Required Clearance</span>
            <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-danger/20 text-danger">
              {requiredRole}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => navigate(getRoleHome())}
            className="flex-1 text-xs font-bold py-3"
          >
            <ArrowLeft size={14} /> Back to My Dashboard
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex-1 text-xs font-bold py-3 border-danger/30 text-danger hover:bg-danger/10"
          >
            Switch Account
          </Button>
        </div>

        {/* Help hint */}
        <p className="text-[11px] text-text-muted pt-2 border-t border-primary/10">
          Need access? Sign in with a demo role account (<Link to="/login" className="text-accent underline font-semibold">NGO</Link> or <Link to="/login" className="text-accent underline font-semibold">Authority</Link>) from the login screen.
        </p>

      </div>
    </div>
  );
};
