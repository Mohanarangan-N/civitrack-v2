import React from 'react';
import { Card } from '@/components/ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = '#22A66A',
}) => {
  return (
    <Card className="flex items-center gap-4 p-5 hover:border-primary/50 transition-all">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40`, color }}
      >
        {icon}
      </div>
      <div>
        <span className="text-xs text-text-muted font-medium block">{title}</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-extrabold text-text-primary">{value}</span>
          {trend && (
            <span className="text-[11px] font-semibold text-accent">{trend}</span>
          )}
        </div>
        {subtitle && <span className="text-[10px] text-text-muted block mt-0.5">{subtitle}</span>}
      </div>
    </Card>
  );
};
