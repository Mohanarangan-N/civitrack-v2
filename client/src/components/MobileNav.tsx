import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Award, Bell, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { unreadNotifications } = useUIStore();

  const isNGO = user?.role === 'NGO';
  const isAuthority = user?.role === 'AUTHORITY';

  const navItems = [
    { to: '/feed', icon: Home, label: 'Feed' },
    { to: '/map', icon: MapPin, label: 'Map' },
    { to: isNGO ? '/ngo' : isAuthority ? '/authority' : '/report', icon: Award, label: isNGO ? 'Verify' : isAuthority ? 'DSS' : 'Report' },
    { to: '/notifications', icon: Bell, label: 'Alerts', badge: unreadNotifications },
    { to: isAuthenticated ? (user?.id ? `/profile/${user.id}` : '/profile') : '/login', icon: User, label: 'Profile' },
  ];

  // Hide on auth pages
  const hiddenRoutes = ['/login', '/register', '/developer'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <>
      {/* Bottom safe-area spacer */}
      <div className="md:hidden h-20" />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Glassmorphism bar */}
        <div className="relative mx-3 mb-3 bg-bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Subtle top glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

          <div className="flex items-center px-2 py-1.5">
            {navItems.map(({ to, icon: Icon, label, badge }, idx) => {
              const isMid = idx === 2; // center slot — role-specific action button
              const isActive = location.pathname === to || (to.startsWith('/profile') && location.pathname.startsWith('/profile'));

              if (isMid) {
                // Central elevated Role FAB
                if (isNGO) {
                  return (
                    <div key="fab-ngo" className="flex-1 flex flex-col items-center justify-center -mt-6">
                      <Link to="/ngo" className="group relative" title="NGO Verification Hub">
                        <div className="absolute inset-0 rounded-full bg-warning blur-md opacity-60 group-hover:opacity-90 transition-opacity scale-110" />
                        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/40 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                          <span className="text-xl">🛡️</span>
                        </div>
                      </Link>
                      <span className="text-[9px] font-extrabold text-warning mt-1">Verify</span>
                    </div>
                  );
                }

                if (isAuthority) {
                  return (
                    <div key="fab-auth" className="flex-1 flex flex-col items-center justify-center -mt-6">
                      <Link to="/authority" className="group relative" title="Municipal DSS">
                        <div className="absolute inset-0 rounded-full bg-accent blur-md opacity-60 group-hover:opacity-90 transition-opacity scale-110" />
                        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center shadow-xl shadow-accent/40 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                          <span className="text-xl">🏛️</span>
                        </div>
                      </Link>
                      <span className="text-[9px] font-extrabold text-accent mt-1">DSS</span>
                    </div>
                  );
                }

                return (
                  <div key="fab-citizen" className="flex-1 flex flex-col items-center justify-center -mt-6">
                    <Link
                      to={isAuthenticated ? '/report' : '/login'}
                      className="group relative"
                      title="Report Civic Issue"
                    >
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-emerald-400 blur-md opacity-60 group-hover:opacity-90 transition-opacity scale-110" />
                      {/* Button */}
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-accent via-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-accent/40 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                        <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </Link>
                    <span className="text-[9px] font-extrabold text-accent mt-1">Report</span>
                  </div>
                );
              }

              return (
                <Link
                  key={to}
                  to={to}
                  className="flex-1 flex flex-col items-center gap-1 py-1.5 group relative"
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent shadow-sm shadow-accent/60" />
                  )}
                  <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-accent/15' : 'group-hover:bg-primary/10'}`}>
                    <Icon
                      size={20}
                      className={`transition-all duration-200 ${isActive ? 'text-accent stroke-[2.5px]' : 'text-text-muted group-hover:text-text-primary'}`}
                    />
                    {badge && badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-black flex items-center justify-center shadow-md animate-bounce">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold transition-colors ${isActive ? 'text-accent' : 'text-text-muted'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
