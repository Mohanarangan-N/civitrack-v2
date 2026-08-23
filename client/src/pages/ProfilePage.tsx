import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI } from '@/api';
import type { User, Issue } from '@/types';
import { EcoScoreWidget } from '@/components/gamification/EcoScoreWidget';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { PostCard } from '@/components/feed/PostCard';
import { ACHIEVEMENT_CONFIG } from '@/utils/constants';
import { User as UserIcon, Shield, Award, Calendar, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuthStore();
  const userId = id || currentUser?.id;

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      try {
        const [userData, issuesData] = await Promise.all([
          usersAPI.getProfile(userId),
          usersAPI.getIssues(userId),
        ]);
        setProfileUser(userData);
        setUserIssues(issuesData.issues || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">Loading profile...</div>;
  }

  if (!profileUser) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">User not found</div>;
  }

  const allBadgeKeys = Object.keys(ACHIEVEMENT_CONFIG);
  const unlockedBadges = new Set(profileUser.achievements || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="card p-6 border-primary/30 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-accent/20">
          {profileUser.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-text-primary">{profileUser.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold border border-accent/30">
              {profileUser.role}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-accent" /> {profileUser.ward} Ward
            </span>
            <span className="flex items-center gap-1">
              <Shield size={14} className="text-accent" /> {profileUser.level}
            </span>
          </div>
        </div>
      </div>

      {/* EcoScore Widget */}
      <EcoScoreWidget
        score={profileUser.eco_score || 0}
        level={profileUser.level || 'NEWCOMER'}
        streak={profileUser.streak || 0}
      />

      {/* Achievements Badges Showcase */}
      <div>
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <Award size={18} className="text-accent" />
          Achievement Badges Showcase ({unlockedBadges.size} / {allBadgeKeys.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadgeKeys.map((key) => (
            <BadgeCard key={key} badgeKey={key} unlocked={unlockedBadges.has(key)} />
          ))}
        </div>
      </div>

      {/* User Issue History */}
      <div>
        <h3 className="text-base font-bold mb-4">Reported Issues ({userIssues.length})</h3>
        {userIssues.length > 0 ? (
          <div className="space-y-4">
            {userIssues.map((issue) => (
              <PostCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-xs text-text-muted">
            No issues reported yet.
          </div>
        )}
      </div>
    </div>
  );
};
