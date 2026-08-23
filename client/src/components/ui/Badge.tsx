import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'low' | 'medium' | 'high' | 'critical' | 'pending' | 'verified' | 'progress' | 'resolved' | 'rejected' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    critical: 'badge-critical',
    pending: 'badge-pending',
    verified: 'badge-verified',
    progress: 'badge-progress',
    resolved: 'badge-resolved',
    rejected: 'badge-rejected',
    default: 'bg-primary/20 text-text-secondary border border-primary/30 badge',
  };

  return <span className={`${variantClasses[variant]} ${className}`}>{children}</span>;
};
