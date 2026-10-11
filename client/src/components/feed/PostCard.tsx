import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MessageSquare, Share2, Bookmark, MapPin, Sparkles,
  AlertTriangle, ShieldCheck, CheckCircle2
} from 'lucide-react';
import type { Issue } from '@/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '@/utils/constants';
import { timeAgo } from '@/utils/helpers';
import { issuesAPI } from '@/api';
import toast from 'react-hot-toast';

interface PostCardProps {
  issue: Issue;
  onLikeToggle?: (id: string, newLikedState: boolean) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ issue, onLikeToggle }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(issue.like_count || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const category = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER;
  const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.VERIFIED;

  const handleLike = async () => {
    try {
      const res = await issuesAPI.toggleLike(issue.id);
      setLiked(res.liked);
      setLikeCount((prev) => (res.liked ? prev + 1 : prev - 1));
      if (onLikeToggle) onLikeToggle(issue.id, res.liked);
    } catch {
      toast.error('Please sign in to like issues');
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/issues/${issue.id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
  };

  const aiVision = (issue as any).ai_vision_analysis;

  return (
    <article className="card hover:border-primary/40 transition-all duration-300 mb-5 overflow-hidden group shadow-xl bg-bg-surface/95 border border-primary/20 rounded-3xl">
      {/* Post Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 pb-3 border-b border-primary/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/40 border border-primary/40 flex items-center justify-center font-black text-accent text-base shadow-sm shrink-0">
            {issue.is_anonymous ? '🎭' : (issue.reporter_name || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-sm text-text-primary truncate">
                {issue.is_anonymous ? 'Anonymous Citizen 🎭' : (issue.reporter_name || 'Citizen Reporter')}
              </span>
              {issue.is_anonymous && (
                <span className="text-[9px] bg-primary/20 text-accent font-bold px-1.5 py-0.5 rounded-full border border-primary/30 shrink-0">
                  Zero-Knowledge
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              <span className="flex items-center gap-1 font-semibold text-text-secondary truncate">
                <MapPin size={11} className="text-accent shrink-0" />
                {issue.ward} Ward
              </span>
              <span>•</span>
              <span className="font-mono text-[11px] text-accent/90 shrink-0">{timeAgo(issue.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
          <span className={status.className}>{status.label}</span>
          <span
            className="badge font-black text-[11px]"
            style={{ backgroundColor: priority.bg, color: priority.color, border: `1px solid ${priority.color}40` }}
          >
            {priority.label} ({issue.priority_score})
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pt-3.5 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{category.emoji}</span>
            <h3 className="font-black text-base text-text-primary group-hover:text-accent transition-colors leading-snug">
              <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
            </h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
            {issue.description}
          </p>
        </div>

        {/* Image Display with Double-Tap to Like */}
        {issue.attachments && issue.attachments.length > 0 && (
          <div
            onDoubleClick={handleDoubleTap}
            className="relative my-2 rounded-2xl overflow-hidden border border-primary/20 bg-black/60 cursor-pointer select-none group/img"
          >
            <img
              src={issue.attachments[0]}
              alt={issue.title}
              className="w-full max-h-96 object-cover group-hover/img:scale-[1.02] transition-transform duration-500"
            />
            {showHeartAnim && (
              <div className="absolute inset-0 flex items-center justify-center animate-ping pointer-events-none">
                <Heart size={72} className="text-danger fill-danger drop-shadow-2xl" />
              </div>
            )}
            {issue.attachments.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                +{issue.attachments.length - 1} more
              </span>
            )}
          </div>
        )}

        {/* AI Multimodal Badges: NLP Category + Vision Consistency Check */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {issue.ai_category && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bg-elevated border border-primary/30 text-[11px] text-text-muted">
              <Sparkles size={12} className="text-accent" />
              <span>AI Category: <strong className="text-text-primary">{issue.ai_category}</strong></span>
            </div>
          )}

          {aiVision && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
              aiVision.valid ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning'
            }`}>
              {aiVision.valid ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
              <span>{aiVision.badge} ({aiVision.scene_detected})</span>
            </div>
          )}
        </div>
      </div>

      {/* Post Actions Footer (Instagram / Threads Style) */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-elevated/40 border-t border-primary/10 text-xs">
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-bold transition-transform active:scale-125 ${
              liked ? 'text-danger' : 'text-text-muted hover:text-danger'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} className="transition-colors" />
            <span>{likeCount}</span>
          </button>

          <Link
            to={`/issues/${issue.id}`}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors font-bold"
          >
            <MessageSquare size={18} />
            <span>{issue.comment_count || 0}</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors font-bold"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className={`p-1.5 rounded-xl transition-colors ${
            bookmarked ? 'text-accent bg-accent/15' : 'text-text-muted hover:text-text-primary'
          }`}
          title="Bookmark"
        >
          <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
};
