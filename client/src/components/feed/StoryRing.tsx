import React, { useState } from 'react';
import { Plus, Clock, Camera, Upload, X, MapPin } from 'lucide-react';
import type { Story } from '@/types';
import { storiesAPI } from '@/api';
import { WARDS } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { CameraCaptureModal } from '@/components/common/CameraCaptureModal';
import toast from 'react-hot-toast';

interface StoryRingProps {
  stories: Story[];
  userWard?: string;
  onStoryAdded?: () => void;
}

export const StoryRing: React.FC<StoryRingProps> = ({ stories, userWard, onStoryAdded }) => {
  const [uploading, setUploading] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState(userWard || WARDS[0]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostStory = async () => {
    if (!imagePreview) {
      toast.error('Please upload or snap a photo for your story');
      return;
    }

    setUploading(true);
    try {
      await storiesAPI.post({ media_url: imagePreview, ward: selectedWard });
      toast.success(`24-hour alert posted for ${selectedWard} Ward! 🎉`);
      setIsModalOpen(false);
      setImagePreview(null);
      if (onStoryAdded) onStoryAdded();
    } catch {
      toast.error('Failed to post ward story');
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
          onClick={() => setIsModalOpen(true)}
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

      {/* Story Creation Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 shadow-2xl border-accent/40 bg-bg-elevated relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <h3 className="font-extrabold text-base text-text-primary flex items-center gap-2">
                <Clock className="text-accent" size={18} /> Post 24-Hour Ward Story
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Select Ward Location</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="input-field font-semibold text-accent text-xs"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w} Ward
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="p-4 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 transition-all flex flex-col items-center gap-1.5 text-center"
              >
                <Camera size={20} className="text-accent" />
                <span className="text-xs font-bold text-text-primary">Snap Camera</span>
              </button>

              <label className="p-4 rounded-xl border border-primary/30 bg-bg hover:border-primary/50 transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer">
                <Upload size={20} className="text-text-muted" />
                <span className="text-xs font-bold text-text-primary">Upload File</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-accent/50 h-44 bg-black">
                <img src={imagePreview} alt="Story Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <Button onClick={handlePostStory} disabled={uploading || !imagePreview} className="w-full py-2.5">
              {uploading ? 'Posting Story...' : 'Publish 24-Hour Alert'}
            </Button>
          </div>
        </div>
      )}

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setImagePreview(img);
          setIsCameraOpen(false);
        }}
        locationName={`${selectedWard} Ward`}
      />
    </div>
  );
};
