import React from 'react';
import { ACHIEVEMENT_CONFIG } from '@/utils/constants';

interface BadgeCardProps {
  badgeKey: string;
  unlocked?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badgeKey, unlocked = false }) => {
  const config = ACHIEVEMENT_CONFIG[badgeKey] || {
    icon: '🏆',
    label: badgeKey,
    desc: 'Achievement unlocked',
  };

  return (
    <div
      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
        unlocked
          ? 'bg-bg-elevated border-accent/40 shadow-md shadow-accent/5'
          : 'bg-bg-surface/50 border-primary/10 opacity-50 grayscale'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
        unlocked ? 'bg-accent/20 border border-accent/40' : 'bg-primary/10'
      }`}>
        {config.icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-text-primary">{config.label}</h4>
        <p className="text-[10px] text-text-muted">{config.desc}</p>
      </div>
    </div>
  );
};
