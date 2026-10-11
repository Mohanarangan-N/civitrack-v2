import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, ExternalLink, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-surface border-t border-primary/20 mt-16 pt-8 pb-24 md:pb-8 text-text-muted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="font-bold text-text-primary">CiviTrack V2</span>
            <span className="text-xs block text-text-muted">AI-Powered Urban Decision Support System</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-accent" />
            Puducherry Municipal Region, India
          </span>
          <Link to="/developer" className="hover:text-accent text-text-secondary transition-colors flex items-center gap-1 font-mono">
            <Terminal size={12} className="text-accent" />
            Developer Diagnostics
          </Link>
          <a href="#" className="hover:text-text-primary transition-colors flex items-center gap-1">
            Open Governance Protocol <ExternalLink size={12} />
          </a>
          <a href="#" className="hover:text-text-primary transition-colors">
            Privacy Policy
          </a>
        </div>

        <div className="text-xs text-text-muted flex items-center gap-1 text-center md:text-right">
          Designed for Puducherry Urban Development & Operations
        </div>
      </div>
    </footer>
  );
};

export default Footer;
