import React from 'react';
import { Award, Zap, Flame, Shield } from 'lucide-react';
import { getLevelProgress } from '@/utils/helpers';
import { LEVEL_CONFIG } from '@/utils/constants';

interface EcoScoreWidgetProps {
  score: number;
  level: string;
  streak: number;
}

export const EcoScoreWidget: React.FC<EcoScoreWidgetProps> = ({ score, level, streak }) => {
  const { progress, next } = getLevelProgress(score);
  const currentLevelConfig = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.NEWCOMER;

  return (
    <div className="bg-gradient-to-br from-bg-surface to-bg-elevated border border-accent/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-2xl">
            {currentLevelConfig.icon}
          </div>
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">EcoScore Rank</span>
            <h3 className="text-lg font-extrabold text-text-primary">{currentLevelConfig.label}</h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-accent">{score}</span>
          <span className="text-xs text-text-muted block">pts</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1.5 font-semibold">
          <span>Level Progress</span>
          <span>{score} / {next} pts</span>
        </div>
        <div className="w-full h-3 bg-bg border border-primary/30 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-accent to-primary-light rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Streak Badge */}
      <div className="flex items-center justify-between text-xs bg-primary/20 border border-primary/30 rounded-xl p-2.5 text-text-secondary">
        <span className="flex items-center gap-1.5 font-semibold">
          <Flame size={16} className="text-warning fill-warning" />
          Active Streak
        </span>
        <span className="font-extrabold text-warning">{streak} Days 🔥</span>
      </div>
    </div>
  );
};
