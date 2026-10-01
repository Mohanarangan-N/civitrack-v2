import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { 
  Shield, MapPin, Bell, User as UserIcon, LogOut, 
  PlusCircle, LayoutDashboard, Award, Globe, Search, Sparkles
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
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-text-primary">
              Civi<span className="text-accent">Track</span>
              <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-primary/40 text-accent font-semibold border border-primary/40">V2</span>
            </span>
            <span className="block text-[10px] text-text-muted font-medium tracking-wide">PUDUCHERRY DSS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
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
            Track Anonymous
          </Link>
          <Link to="/ai" className={`nav-link text-accent hover:text-accent-hover font-semibold flex items-center gap-1.5 ${location.pathname === '/ai' ? 'active' : ''}`}>
            <Sparkles size={16} className="text-accent animate-pulse" />
            AI Engine
          </Link>

          {user?.role === 'NGO' && (
            <Link to="/ngo" className={`nav-link text-warning ${location.pathname === '/ngo' ? 'active' : ''}`}>
              <LayoutDashboard size={16} />
              NGO Dashboard
            </Link>
          )}

          {user?.role === 'AUTHORITY' && (
            <Link to="/authority" className={`nav-link text-accent ${location.pathname === '/authority' ? 'active' : ''}`}>
              <LayoutDashboard size={16} />
              Authority DSS
            </Link>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Report Button */}
          {isAuthenticated && (
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center gap-2 bg-accent hover:bg-primary-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-accent/20 active:scale-95"
            >
              <PlusCircle size={18} />
              <span>{t('nav.report')}</span>
            </Link>
          )}

          {/* Language Toggle */}
          <div className="flex items-center bg-bg-elevated border border-primary/30 rounded-lg p-0.5 text-xs font-semibold">
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

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              
              {/* Notification Icon */}
              <Link
                to="/notifications"
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-primary/20 rounded-lg transition-colors"
                title={t('nav.notifications')}
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>

              {/* Profile Link */}
              <Link
                to={`/profile/${user?.id}`}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/40 border border-primary/50 flex items-center justify-center font-bold text-accent text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <span className="block font-semibold text-text-primary truncate max-w-[100px]">{user?.name}</span>
                  <span className="block text-[10px] text-text-muted">{user?.role}</span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title={t('nav.logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="bg-accent hover:bg-primary-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-accent/20"
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
