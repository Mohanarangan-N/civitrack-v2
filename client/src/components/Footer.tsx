import React from 'react';
import { Shield, Heart, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-surface border-t border-primary/20 mt-16 py-8 text-text-muted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="font-bold text-text-primary">CiviTrack V2</span>
            <span className="text-xs block">AI-Powered Urban Decision Support System</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-accent" />
            Puducherry Municipal Region, India
          </span>
          <a href="#" className="hover:text-text-primary transition-colors flex items-center gap-1">
            Open Governance Protocol <ExternalLink size={12} />
          </a>
          <a href="#" className="hover:text-text-primary transition-colors">
            Privacy Policy
          </a>
        </div>

        <div className="text-xs flex items-center gap-1">
          Designed for Puducherry Urban Development & Operations
        </div>
      </div>
    </footer>
  );
};
