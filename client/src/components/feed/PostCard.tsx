import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Bookmark, MapPin, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/issues/${issue.id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
  };

  return (
    <article className="card hover:border-primary/40 transition-all duration-300 mb-4 overflow-hidden group">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center font-bold text-accent">
            {issue.is_anonymous ? '🎭' : (issue.reporter_name || 'C').charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-text-primary">
                {issue.is_anonymous ? 'Anonymous Citizen 🎭' : (issue.reporter_name || 'Citizen Reporter')}
              </span>
              {issue.is_anonymous && (
                <span className="text-[10px] bg-primary/30 text-text-muted px-1.5 py-0.5 rounded border border-primary/40">
                  Zero-Knowledge
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-accent" />
                {issue.ward} Ward
              </span>
              <span>•</span>
              <span>{timeAgo(issue.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5">
          <span className={status.className}>{status.label}</span>
          <span
            className="badge font-bold"
            style={{ backgroundColor: priority.bg, color: priority.color, border: `1px solid ${priority.color}40` }}
          >
            {priority.label} ({issue.priority_score})
          </span>
        </div>
      </div>

      {/* Title & Category Banner */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{category.emoji}</span>
          <h3 className="font-bold text-base text-text-primary group-hover:text-accent transition-colors">
            <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
          </h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mb-3">
          {issue.description}
        </p>

        {/* AI Classification Tag */}
        {issue.ai_category && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-elevated border border-primary/20 text-[11px] text-text-muted mb-3">
            <Sparkles size={13} className="text-accent" />
            <span>AI Category: <strong className="text-text-primary">{issue.ai_category}</strong></span>
            {issue.ai_confidence && (
              <span className="text-accent">({Math.round(issue.ai_confidence * 100)}% conf)</span>
            )}
          </div>
        )}
      </div>

      {/* Post Actions Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-elevated/50 border-t border-primary/10 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              liked ? 'text-danger' : 'text-text-muted hover:text-danger'
            }`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>

          <Link
            to={`/issues/${issue.id}`}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors font-medium"
          >
            <MessageSquare size={16} />
            <span>{issue.comment_count || 0}</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors font-medium"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className={`p-1 rounded transition-colors ${
            bookmarked ? 'text-accent' : 'text-text-muted hover:text-text-primary'
          }`}
          title="Bookmark"
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
};
