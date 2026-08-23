import React, { useState, useEffect } from 'react';
import { issuesAPI, storiesAPI } from '@/api';
import type { Issue, Story } from '@/types';
import { PostCard } from '@/components/feed/PostCard';
import { StoryRing } from '@/components/feed/StoryRing';
import { WARDS, CATEGORY_CONFIG } from '@/utils/constants';
import { Filter, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const FeedPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { user } = useAuthStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedWard) params.ward = selectedWard;
      if (selectedCategory) params.category = selectedCategory;

      const [issueRes, storyRes] = await Promise.all([
        issuesAPI.getAll(params),
        storiesAPI.getAll(),
      ]);
      setIssues(issueRes.issues || []);
      setStories(storyRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWard, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
            Verified Community Feed
            <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold border border-accent/30">
              Live
            </span>
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Only issues verified by ward NGOs are published to the public feed
          </p>
        </div>
      </div>

      {/* 24-Hour Ward Stories Ring */}
      <StoryRing stories={stories} userWard={user?.ward} onStoryAdded={loadData} />

      {/* Filter Bar */}
      <div className="card p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-text-muted">
          <Filter size={14} className="text-accent" />
          Filter Feed:
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ward Select */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-bg border border-primary/30 rounded-lg px-2.5 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Wards ({WARDS.length})</option>
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w} Ward
              </option>
            ))}
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-bg border border-primary/30 rounded-lg px-2.5 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.emoji} {cfg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Feed List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 h-48 animate-pulse bg-primary/10" />
          ))}
        </div>
      ) : issues.length > 0 ? (
        <div className="space-y-4">
          {issues.map((issue) => (
            <PostCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary">No verified issues found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Issues appear here after verification by the respective ward NGO officer.
          </p>
        </div>
      )}
    </div>
  );
};
