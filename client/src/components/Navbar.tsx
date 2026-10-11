import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { 
  Shield, MapPin, Bell, User as UserIcon, LogOut, 
  PlusCircle, LayoutDashboard, Award, Globe, Search, Sparkles, Terminal
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage, unreadNotifications } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (lang: 'en' | 'ta' | 'fr') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('civitrack-lang', lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-bg-surface/90 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform shrink-0">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-text-primary whitespace-nowrap">
              Civi<span className="text-accent">Track</span>
              <span className="text-[10px] sm:text-xs ml-1 px-1 sm:px-1.5 py-0.5 rounded bg-primary/40 text-accent font-semibold border border-primary/40">V2</span>
            </span>
            <span className="hidden sm:block text-[10px] text-text-muted font-medium tracking-wide">PUDUCHERRY DSS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Role-Specific Primary Home Link */}
          {user?.role === 'NGO' ? (
            <Link
              to="/ngo"
              className={`nav-link font-bold text-warning border border-warning/30 bg-warning/10 hover:bg-warning/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5 ${
                location.pathname === '/ngo' ? 'ring-2 ring-warning/50 bg-warning/20' : ''
              }`}
            >
              <Shield size={16} className="text-warning" />
              <span>NGO Verification Hub</span>
            </Link>
          ) : user?.role === 'AUTHORITY' ? (
            <Link
              to="/authority"
              className={`nav-link font-bold text-accent border border-accent/30 bg-accent/10 hover:bg-accent/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5 ${
                location.pathname === '/authority' ? 'ring-2 ring-accent/50 bg-accent/20' : ''
              }`}
            >
              <LayoutDashboard size={16} className="text-accent" />
              <span>Authority DSS Command</span>
            </Link>
          ) : null}

          <Link to="/feed" className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`}>
            {t('nav.feed')}
          </Link>
          <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>
            <MapPin size={16} />
            {t('nav.map')}
          </Link>
          <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>
            <Award size={16} />
            {t('nav.leaderboard')}
          </Link>
          <Link to="/track" className={`nav-link ${location.pathname === '/track' ? 'active' : ''}`}>
            <Search size={16} />
            Track
          </Link>
          <Link to="/ai" className={`nav-link text-accent hover:text-accent-hover font-semibold flex items-center gap-1.5 ${location.pathname === '/ai' ? 'active' : ''}`}>
            <Sparkles size={16} className="text-accent animate-pulse" />
            AI Engine
          </Link>

          <Link to="/developer" className={`nav-link text-xs font-mono text-text-muted hover:text-accent flex items-center gap-1 ${location.pathname === '/developer' ? 'active text-accent' : ''}`}>
            <Terminal size={14} />
            Diagnostics
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Report Button (For Citizens and General Use) */}
          {isAuthenticated && user?.role === 'CITIZEN' && (
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center gap-2 bg-accent hover:bg-primary-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-accent/20 active:scale-95"
            >
              <PlusCircle size={18} />
              <span>{t('nav.report')}</span>
            </Link>
          )}

          {/* Quick Action for NGO / Authority */}
          {isAuthenticated && user?.role === 'NGO' && (
            <Link
              to="/ngo"
              className="hidden sm:inline-flex items-center gap-1.5 bg-warning/20 border border-warning/40 text-warning hover:bg-warning/30 text-xs font-bold px-3 py-2 rounded-lg transition-all"
            >
              <Shield size={15} />
              <span>Verify Issues</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'AUTHORITY' && (
            <Link
              to="/authority"
              className="hidden sm:inline-flex items-center gap-1.5 bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 text-xs font-bold px-3 py-2 rounded-lg transition-all"
            >
              <LayoutDashboard size={15} />
              <span>DSS Overview</span>
            </Link>
          )}

          {/* Desktop Language Toggle */}
          <div className="hidden sm:flex items-center bg-bg-elevated border border-primary/30 rounded-lg p-0.5 text-xs font-semibold">
            {(['en', 'ta', 'fr'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-1 rounded transition-colors uppercase ${
                  language === lang
                    ? 'bg-accent text-white shadow'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Mobile Single Tap Language Cycle Button */}
          <button
            onClick={() => {
              const nextLang = language === 'en' ? 'ta' : language === 'ta' ? 'fr' : 'en';
              handleLanguageChange(nextLang);
            }}
            className="sm:hidden flex items-center gap-1 bg-bg-elevated border border-primary/30 rounded-lg px-2 py-1 text-[11px] font-bold text-accent uppercase"
            title="Switch Language"
          >
            <Globe size={12} />
            {language}
          </button>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-2">
              
              {/* Notification Icon */}
              <Link
                to="/notifications"
                className="relative p-1.5 sm:p-2 text-text-secondary hover:text-text-primary hover:bg-primary/20 rounded-lg transition-colors"
                title={t('nav.notifications')}
              >
                <Bell size={18} className="sm:w-5 sm:h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-danger text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>

              {/* Profile Link with Role-Coded Badge */}
              <Link
                to={user?.id ? `/profile/${user.id}` : '/profile'}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold text-xs sm:text-sm ${
                  user?.role === 'AUTHORITY' 
                    ? 'bg-accent/20 border-accent/50 text-accent' 
                    : user?.role === 'NGO'
                    ? 'bg-warning/20 border-warning/50 text-warning'
                    : 'bg-primary/40 border-primary/50 text-accent'
                }`}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <span className="block font-semibold text-text-primary truncate max-w-[110px]">{user?.name}</span>
                  <span className={`block text-[10px] font-extrabold uppercase ${
                    user?.role === 'AUTHORITY' ? 'text-accent' : user?.role === 'NGO' ? 'text-warning' : 'text-text-muted'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title={t('nav.logout')}
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="bg-accent hover:bg-primary-light text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all shadow-md shadow-accent/20"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
