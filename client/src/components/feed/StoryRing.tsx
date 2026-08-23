import React, { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import type { Story } from '@/types';
import { storiesAPI } from '@/api';
import toast from 'react-hot-toast';

interface StoryRingProps {
  stories: Story[];
  userWard?: string;
  onStoryAdded?: () => void;
}

export const StoryRing: React.FC<StoryRingProps> = ({ stories, userWard, onStoryAdded }) => {
  const [uploading, setUploading] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const handleCreateStory = async () => {
    const mediaUrl = prompt('Enter image URL for 24-hour ward story:');
    if (!mediaUrl) return;
    setUploading(true);
    try {
      await storiesAPI.post({ media_url: mediaUrl, ward: userWard || 'White Town' });
      toast.success('24-hour ward story posted!');
      if (onStoryAdded) onStoryAdded();
    } catch {
      toast.error('Failed to post story');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-primary/20 rounded-2xl p-4 mb-6 shadow-lg">
      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Clock size={14} className="text-accent" />
        24-Hour Ward Alerts
      </h4>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add Story Button */}
        <button
          onClick={handleCreateStory}
          disabled={uploading}
          className="flex flex-col items-center gap-1.5 group flex-shrink-0"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-accent/60 group-hover:border-accent flex items-center justify-center bg-accent/10 transition-colors">
            <Plus size={20} className="text-accent group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] text-text-secondary font-medium truncate max-w-[64px]">Post Alert</span>
        </button>

        {/* Story Items */}
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="story-ring group-hover:scale-105 transition-transform">
              <div className="story-ring-inner">
                <img
                  src={story.media_url || 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=150'}
                  alt={story.ward}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] text-text-primary font-medium truncate max-w-[64px]">
              {story.ward}
            </span>
          </button>
        ))}

        {stories.length === 0 && (
          <span className="text-xs text-text-muted italic py-2">No active ward stories right now</span>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-sm w-full bg-bg-surface border border-primary/40 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-3 right-3 text-white bg-black/50 p-1.5 rounded-full hover:bg-black z-10"
            >
              ✕
            </button>
            <img
              src={activeStory.media_url || 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600'}
              alt={activeStory.ward}
              className="w-full h-80 object-cover"
            />
            <div className="p-4 bg-bg-elevated">
              <span className="text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/20 border border-accent/30 inline-block mb-1">
                {activeStory.ward} Ward
              </span>
              <p className="text-xs text-text-secondary mt-1">Posted by {activeStory.user_name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
