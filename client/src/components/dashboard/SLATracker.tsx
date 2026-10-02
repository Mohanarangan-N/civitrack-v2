import React from 'react';
import type { SLAItem } from '@/types';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SLATrackerProps {
  items: SLAItem[];
}

export const SLATracker: React.FC<SLATrackerProps> = ({ items = [] }) => {
  return (
    <div className="bg-bg-surface border border-primary/20 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 bg-bg-elevated border-b border-primary/20 flex items-center justify-between">
        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
          <Clock size={16} className="text-accent" />
          SLA Resolution & Performance Tracker
        </h3>
        <span className="text-xs text-text-muted hidden sm:inline">Target SLAs: Low (14d), Med (7d), High (3d), Critical (1d)</span>
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-text-muted">
                  No active SLA tracking items currently recorded.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const priority = item?.priority || 'MEDIUM';
                const status = item?.status || 'VERIFIED';
                const id = item?._id || `sla-${idx}`;
                const title = item?.title || 'Civic Grievance';
                const ward = item?.ward || 'Puducherry';
                const ageDays = typeof item?.age_days === 'number' ? item.age_days : 1;
                const slaDays = typeof item?.sla_days === 'number' ? item.sla_days : 3;
                const isBreached = !!item?.sla_breached;

                return (
                  <tr key={id} className="hover:bg-primary/10 transition-colors">
                    <td className="p-3 font-medium text-text-primary max-w-xs truncate">{title}</td>
                    <td className="p-3 text-text-secondary">{ward}</td>
                    <td className="p-3">
                      <Badge variant={priority.toLowerCase() as any}>{priority}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={status.toLowerCase() as any}>{status}</Badge>
                    </td>
                    <td className="p-3 font-mono text-text-primary">{ageDays}d</td>
                    <td className="p-3 font-mono text-text-muted">{slaDays}d</td>
                    <td className="p-3">
                      {isBreached ? (
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
