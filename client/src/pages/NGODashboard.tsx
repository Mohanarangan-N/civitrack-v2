import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ngoAPI, issuesAPI } from '@/api';
import type { Issue } from '@/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/utils/constants';
import { Check, X, AlertTriangle, Shield, Sparkles, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const NGODashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pendingIssues, setPendingIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const { user } = useAuthStore();

  const loadData = async () => {
    try {
      const [pendingData, statsData] = await Promise.all([
        ngoAPI.getPending(),
        ngoAPI.getStats(),
      ]);
      setPendingIssues(pendingData || []);
      setStats(statsData || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (issueId: string, escalate = false) => {
    try {
      await issuesAPI.verify(issueId, { action: 'approve', escalate_to_critical: escalate });
      toast.success(escalate ? 'Issue Approved & Escalated to CRITICAL!' : 'Issue Approved & Published to Feed!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to approve issue');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedIssue || !rejectReason.trim()) {
      toast.error('Mandatory rejection reason is required');
      return;
    }
    try {
      await issuesAPI.verify(selectedIssue.id, { action: 'reject', reason: rejectReason });
      toast.success('Issue Rejected & Citizen Notified');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedIssue(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reject issue');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* NGO Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card p-6 border-warning/30">
        <div>
          <span className="text-xs font-bold text-warning uppercase flex items-center gap-1">
            <Shield size={14} /> Assigned Ward NGO Verification Queue
          </span>
          <h1 className="text-2xl font-extrabold text-text-primary mt-0.5">
            {user?.ward} Ward Command Centre
          </h1>
          <p className="text-xs text-text-muted">
            Strict Ward Scope: You can ONLY verify issues submitted in {user?.ward} Ward
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-bg-elevated px-3 py-2 rounded-xl border border-primary/20">
            <span className="text-text-muted block">Pending Verification</span>
            <span className="text-lg font-bold text-warning">{pendingIssues.length}</span>
          </div>
          <div className="bg-bg-elevated px-3 py-2 rounded-xl border border-primary/20">
            <span className="text-text-muted block">Verified Issues</span>
            <span className="text-lg font-bold text-accent">{stats.VERIFIED || 0}</span>
          </div>
          <Link to="/feed">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-text-secondary hover:text-text-primary border border-primary/20">
              Public Feed →
            </Button>
          </Link>
          <Button
            onClick={() => {
              useAuthStore.getState().logout();
              navigate('/login');
              toast.success('Signed out successfully');
            }}
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30"
          >
            <LogOut size={14} /> Switch / Logout
          </Button>
        </div>
      </div>

      {/* Pending Queue List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Prioritised Verification Queue ({pendingIssues.length})</h2>
        
        {loading ? (
          <div className="card p-8 text-center text-text-muted">Loading pending verification queue...</div>
        ) : pendingIssues.length > 0 ? (
          pendingIssues.map((issue) => {
            const category = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER;
            const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;
            return (
              <div key={issue.id} className="card p-5 border-primary/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.emoji}</span>
                    <div>
                      <span className="text-xs font-bold text-accent uppercase block">{issue.category}</span>
                      <h3 className="font-extrabold text-base text-text-primary">{issue.title}</h3>
                    </div>
                  </div>

                  <span
                    className="badge font-bold text-xs"
                    style={{ backgroundColor: priority.bg, color: priority.color, border: `1px solid ${priority.color}40` }}
                  >
                    AI Priority Score: {issue.priority_score}/100 ({issue.priority})
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">{issue.description}</p>

                <div className="flex items-center gap-4 text-[11px] text-text-muted bg-bg-elevated p-2 rounded-lg">
                  <span>Location: <strong>{issue.ward} Ward</strong></span>
                  <span>Area Weight: <strong>{issue.area_type}</strong></span>
                  <span>Density: <strong>{issue.hectic_level}</strong></span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary/10">
                  <Button size="sm" onClick={() => handleApprove(issue.id)} className="bg-accent">
                    <Check size={14} /> Approve (Make Public)
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setRejectModalOpen(true);
                    }}
                  >
                    <X size={14} /> Reject Issue
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleApprove(issue.id, true)}
                    className="text-warning border-warning/40 hover:bg-warning/10"
                  >
                    <AlertTriangle size={14} /> Escalate to CRITICAL
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-12 text-center text-xs text-text-muted">
            No pending issues in {user?.ward} Ward queue. All caught up! 🎉
          </div>
        )}
      </div>

      {/* Mandatory Reject Reason Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Mandatory Rejection Reason">
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Provide a clear reason for rejecting this issue. The submitting citizen will be notified and allowed to resubmit up to 3 times.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="e.g., Duplicate report / Insufficient location details..."
            className="input-field text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRejectSubmit}>
              Submit Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
