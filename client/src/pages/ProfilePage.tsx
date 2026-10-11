import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const { user: currentUser } = useAuthStore();
  const userId = id || currentUser?.id;
  const isOwnProfile = !id || (!!currentUser && id === currentUser.id);

  const [profileUser, setProfileUser] = useState<User | null>(
    isOwnProfile && currentUser ? currentUser : null
  );
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(!currentUser && !profileUser);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        if (currentUser) setProfileUser(currentUser);
        setLoading(false);
        return;
      }
      try {
        const [userData, issuesData] = await Promise.all([
          usersAPI.getProfile(userId).catch(() => null),
          usersAPI.getIssues(userId).catch(() => ({ issues: [] })),
        ]);
        if (userData) {
          setProfileUser(userData);
        } else if (isOwnProfile && currentUser) {
          setProfileUser(currentUser);
        } else if (!profileUser && currentUser) {
          setProfileUser(currentUser);
        }
        setUserIssues(issuesData?.issues || []);
      } catch (err) {
        console.error(err);
        if (isOwnProfile && currentUser) {
          setProfileUser(currentUser);
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId, currentUser, isOwnProfile]);

  if (loading && !profileUser) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">Loading profile...</div>;
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-text-muted">User profile not found.</p>
        {currentUser && (
          <button
            onClick={() => setProfileUser(currentUser)}
            className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold"
          >
            Load My Profile
          </button>
        )}
      </div>
    );
  }

  const allBadgeKeys = Object.keys(ACHIEVEMENT_CONFIG);
  const unlockedBadges = new Set(profileUser.achievements || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="card p-6 border-primary/30 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white shadow-xl ${
          profileUser.role === 'AUTHORITY'
            ? 'bg-gradient-to-br from-accent to-emerald-700 shadow-accent/20'
            : profileUser.role === 'NGO'
            ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
            : 'bg-gradient-to-br from-accent to-primary shadow-accent/20'
        }`}>
          {profileUser.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-text-primary">{profileUser.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              profileUser.role === 'AUTHORITY'
                ? 'bg-accent/20 text-accent border-accent/40'
                : profileUser.role === 'NGO'
                ? 'bg-warning/20 text-warning border-warning/40'
                : 'bg-primary/30 text-accent border-primary/40'
            }`}>
              {profileUser.role === 'AUTHORITY' ? '🏛️ MUNICIPAL AUTHORITY' : profileUser.role === 'NGO' ? '🛡️ WARD NGO INSPECTOR' : '🌿 VERIFIED CITIZEN'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-accent" /> {profileUser.ward || 'Puducherry'} Ward
            </span>
            <span className="flex items-center gap-1">
              <Shield size={14} className="text-accent" /> {profileUser.level || 'PUDUCHERRY DEFENDER'}
            </span>
          </div>

          {/* Role Dedicated Workspace Quick Link */}
          {currentUser?.id === profileUser.id && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              {profileUser.role === 'AUTHORITY' && (
                <Link
                  to="/authority"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 text-xs font-bold transition-all shadow-sm"
                >
                  <span>🏛️ Access Authority Decision Support Center →</span>
                </Link>
              )}
              {profileUser.role === 'NGO' && (
                <Link
                  to="/ngo"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-warning/20 border border-warning/40 text-warning hover:bg-warning/30 text-xs font-bold transition-all shadow-sm"
                >
                  <span>🛡️ Access NGO Field Verification Queue →</span>
                </Link>
              )}
              {profileUser.role === 'CITIZEN' && (
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-primary-light text-white text-xs font-bold transition-all shadow-md shadow-accent/20"
                >
                  <span>+ Report New Issue →</span>
                </Link>
              )}
            </div>
          )}
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
