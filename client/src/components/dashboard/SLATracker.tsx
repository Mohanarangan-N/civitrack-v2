import React from 'react';
import type { SLAItem } from '@/types';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SLATrackerProps {
  items: SLAItem[];
}

export const SLATracker: React.FC<SLATrackerProps> = ({ items }) => {
  return (
    <div className="bg-bg-surface border border-primary/20 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 bg-bg-elevated border-b border-primary/20 flex items-center justify-between">
        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <Clock size={16} className="text-accent" />
          SLA Resolution SLA Tracking Table
        </h3>
        <span className="text-xs text-text-muted">Target SLAs: Low (14d), Med (7d), High (3d), Critical (1d)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-primary/10 bg-bg/50 text-text-muted">
              <th className="p-3 font-semibold">Issue Title</th>
              <th className="p-3 font-semibold">Ward</th>
              <th className="p-3 font-semibold">Priority</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Age (Days)</th>
              <th className="p-3 font-semibold">SLA Limit</th>
              <th className="p-3 font-semibold">SLA Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-primary/10 transition-colors">
                <td className="p-3 font-medium text-text-primary max-w-xs truncate">{item.title}</td>
                <td className="p-3 text-text-secondary">{item.ward}</td>
                <td className="p-3">
                  <Badge variant={item.priority.toLowerCase() as any}>{item.priority}</Badge>
                </td>
                <td className="p-3">
                  <Badge variant={item.status.toLowerCase() as any}>{item.status}</Badge>
                </td>
                <td className="p-3 font-mono text-text-primary">{item.age_days}d</td>
                <td className="p-3 font-mono text-text-muted">{item.sla_days}d</td>
                <td className="p-3">
                  {item.sla_breached ? (
                    <span className="inline-flex items-center gap-1 text-danger font-bold">
                      <AlertCircle size={14} /> BREACHED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-accent font-medium">
                      <CheckCircle size={14} /> On Track
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
