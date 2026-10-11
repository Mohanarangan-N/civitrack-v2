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
        <nav className="hidden lg:flex items-center gap-1 min-w-0">
          {/* Role-Specific Primary Home Link */}
          {user?.role === 'NGO' ? (
            <Link
              to="/ngo"
              className={`nav-link text-xs font-bold text-warning border border-warning/30 bg-warning/10 hover:bg-warning/20 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shrink-0 ${
                location.pathname === '/ngo' ? 'ring-2 ring-warning/50 bg-warning/20' : ''
              }`}
            >
              <Shield size={15} className="text-warning" />
              <span>NGO Hub</span>
            </Link>
          ) : user?.role === 'AUTHORITY' ? (
            <Link
              to="/authority"
              className={`nav-link text-xs font-bold text-accent border border-accent/30 bg-accent/10 hover:bg-accent/20 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shrink-0 ${
                location.pathname === '/authority' ? 'ring-2 ring-accent/50 bg-accent/20' : ''
              }`}
            >
              <LayoutDashboard size={15} className="text-accent" />
              <span>Authority DSS</span>
            </Link>
          ) : null}

          <Link to="/feed" className={`nav-link text-xs ${location.pathname === '/feed' ? 'active' : ''}`}>
            {t('nav.feed')}
          </Link>
          <Link to="/map" className={`nav-link text-xs ${location.pathname === '/map' ? 'active' : ''}`}>
            <MapPin size={15} />
            {t('nav.map')}
          </Link>
          <Link to="/leaderboard" className={`nav-link text-xs ${location.pathname === '/leaderboard' ? 'active' : ''}`}>
            <Award size={15} />
            {t('nav.leaderboard')}
          </Link>
          <Link to="/track" className={`nav-link text-xs ${location.pathname === '/track' ? 'active' : ''}`}>
            <Search size={15} />
            Track
          </Link>
          <Link to="/ai" className={`nav-link text-xs text-accent hover:text-accent-hover font-semibold hidden xl:flex items-center gap-1 ${location.pathname === '/ai' ? 'active' : ''}`}>
            <Sparkles size={14} className="text-accent animate-pulse" />
            AI
          </Link>

          <Link to="/developer" className={`nav-link text-xs font-mono text-text-muted hover:text-accent hidden 2xl:flex items-center gap-1 ${location.pathname === '/developer' ? 'active text-accent' : ''}`}>
            <Terminal size={14} />
            Dev
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
          
          {/* Report Button (For Citizens) */}
          {isAuthenticated && user?.role === 'CITIZEN' && (
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 bg-accent hover:bg-primary-light text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-accent/20 active:scale-95 shrink-0"
            >
              <PlusCircle size={15} />
              <span className="hidden sm:inline">{t('nav.report')}</span>
            </Link>
          )}

          {/* Desktop Language Toggle */}
          <div className="hidden sm:flex items-center bg-bg-elevated border border-primary/30 rounded-lg p-0.5 text-[11px] font-semibold shrink-0">
            {(['en', 'ta', 'fr'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-1.5 py-0.5 rounded transition-colors uppercase ${
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
            className="sm:hidden flex items-center gap-1 bg-bg-elevated border border-primary/30 rounded-lg px-2 py-1 text-[11px] font-bold text-accent uppercase shrink-0"
            title="Switch Language"
          >
            <Globe size={12} />
            {language}
          </button>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Notification Icon */}
              <Link
                to="/notifications"
                className="relative p-1.5 text-text-secondary hover:text-text-primary hover:bg-primary/20 rounded-lg transition-colors shrink-0"
                title={t('nav.notifications')}
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>

              {/* Profile Link with Role-Coded Badge */}
              <Link
                to={user?.id ? `/profile/${user.id}` : '/profile'}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-primary/20 transition-colors shrink-0"
                title={`${user?.name} (${user?.role})`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                  user?.role === 'AUTHORITY' 
                    ? 'bg-accent/20 border-accent/50 text-accent' 
                    : user?.role === 'NGO'
                    ? 'bg-warning/20 border-warning/50 text-warning'
                    : 'bg-primary/40 border-primary/50 text-accent'
                }`}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden xl:block text-left text-xs max-w-[90px]">
                  <span className="block font-semibold text-text-primary truncate">{user?.name}</span>
                  <span className={`block text-[9px] font-extrabold uppercase ${
                    user?.role === 'AUTHORITY' ? 'text-accent' : user?.role === 'NGO' ? 'text-warning' : 'text-text-muted'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </Link>

              {/* Explicit, Unmissable Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
                title="Sign out of account"
              >
                <LogOut size={14} className="text-rose-400" />
                <span className="text-[11px] font-bold">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/login"
                className="text-xs font-semibold text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-lg transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="bg-accent hover:bg-primary-light text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-accent/20"
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
