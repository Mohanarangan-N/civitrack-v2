import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { issuesAPI } from '@/api';
import type { Issue, Comment } from '@/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '@/utils/constants';
import { timeAgo, formatDateTime } from '@/utils/helpers';
import { Sparkles, MapPin, CheckCircle2, MessageSquare, Send, ShieldAlert, Award, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  const loadData = async () => {
    if (!id) return;
    try {
      const [issueData, commentData] = await Promise.all([
        issuesAPI.getById(id),
        issuesAPI.getComments(id),
      ]);
      setIssue(issueData);
      setComments(commentData || []);
    } catch (err: any) {
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    try {
      await issuesAPI.postComment(id, { content: newComment, is_internal: isInternal });
      setNewComment('');
      toast.success('Comment posted!');
      loadData();
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleCitizenConfirmResolved = async () => {
    if (!id) return;
    try {
      await issuesAPI.citizenVerify(id);
      toast.success('Resolution confirmed! +50 EcoScore awarded 🎉');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to confirm resolution');
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">Loading issue details...</div>;
  }

  if (!issue) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">Issue not found</div>;
  }

  const category = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER;
  const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.VERIFIED;

  const isReporter = user && issue.reporter_id && strId(issue.reporter_id) === strId(user.id);

  function strId(val: any): string {
    if (!val) return '';
    return typeof val === 'object' ? String(val.$oid || val) : String(val);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Banner Card */}
      <div className="card p-6 border-primary/30 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{category.emoji}</span>
            <div>
              <span className="text-xs font-bold text-accent uppercase block">{category.label}</span>
              <h1 className="text-xl font-extrabold text-text-primary">{issue.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={status.className}>{status.label}</span>
            <span
              className="badge font-bold"
              style={{ backgroundColor: priority.bg, color: priority.color, border: `1px solid ${priority.color}40` }}
            >
              {priority.label} ({issue.priority_score})
            </span>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-6 whitespace-pre-line">
          {issue.description}
        </p>

        {/* AI Classification & Priority Breakdown Box */}
        <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-bg-elevated border border-primary/20 text-xs mb-4">
          <div>
            <span className="font-bold text-accent flex items-center gap-1 mb-1">
              <Sparkles size={14} /> AI Classification Model
            </span>
            <div className="text-text-secondary">
              Predicted Category: <strong className="text-text-primary">{issue.ai_category || issue.category}</strong>
              <br />
              Confidence Score: <strong className="text-accent">{Math.round((issue.ai_confidence || 0.9) * 100)}%</strong>
            </div>
          </div>

          <div>
            <span className="font-bold text-accent flex items-center gap-1 mb-1">
              <Award size={14} /> Priority Breakdown Formula
            </span>
            <div className="text-text-secondary text-[11px] space-y-0.5">
              <div>• Location Weight ({issue.area_type}): <strong>~25 pts</strong></div>
              <div>• Hectic Density ({issue.hectic_level}): <strong>~22 pts</strong></div>
              <div>• Image Severity Score: <strong>~{issue.priority_score - 40} pts</strong></div>
            </div>
          </div>
        </div>

        {/* Citizen Mandatory Resolution Confirmation */}
        {issue.status === 'RESOLVED' && !issue.citizen_verified_resolved && isReporter && (
          <div className="p-4 rounded-xl bg-accent/20 border-2 border-accent/60 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-accent">Mandatory Resolution Confirmation Required</h4>
              <p className="text-xs text-text-muted">
                Authorities marked this issue as resolved. Please confirm the work was done to earn +50 EcoScore pts!
              </p>
            </div>
            <Button onClick={handleCitizenConfirmResolved} className="shadow-lg shadow-accent/30 flex-shrink-0">
              Confirm Resolution (+50 Pts)
            </Button>
          </div>
        )}
      </div>

      {/* Audit Trail Timeline */}
      <div className="card p-6">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <Clock size={18} className="text-accent" />
          Status History Audit Trail
        </h3>

        <div className="space-y-4">
          {(issue.status_history || []).map((entry, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot" />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-text-primary">{entry.status}</span>
                <span className="text-text-muted">{timeAgo(entry.changed_at)}</span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">{entry.note || 'Status updated'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Thread */}
      <div className="card p-6">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-accent" />
          Discussion Thread ({comments.length})
        </h3>

        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handlePostComment} className="mb-6 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="input-field text-xs"
            />
            <div className="flex items-center justify-between">
              {['NGO', 'AUTHORITY'].includes(user.role) && (
                <label className="flex items-center gap-1.5 text-xs text-warning cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  Internal Note (Visible to NGO/Authority only)
                </label>
              )}
              <Button type="submit" size="sm" className="ml-auto">
                <Send size={14} /> Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-text-muted mb-4 italic">Sign in to participate in the conversation.</p>
        )}

        {/* Comments List */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl border text-xs ${
                c.is_internal
                  ? 'bg-warning/10 border-warning/30'
                  : 'bg-bg-elevated border-primary/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{c.user_name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-primary/30 text-[10px] font-semibold text-accent">
                    {c.user_role}
                  </span>
                  {c.is_internal && (
                    <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.2 rounded font-bold">
                      INTERNAL NOTE
                    </span>
                  )}
                </div>
                <span className="text-text-muted text-[10px]">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-text-secondary leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
