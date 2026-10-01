import { IssueCategory, IssuePriority, IssueStatus } from '@/types';

export const CATEGORY_CONFIG: Record<IssueCategory, { emoji: string; label: string; color: string }> = {
  ROADS:           { emoji: '🚧', label: 'Roads',           color: '#E85038' },
  WATER:           { emoji: '💧', label: 'Water',           color: '#3B9ED4' },
  WASTE:           { emoji: '🗑️', label: 'Waste',           color: '#E8901A' },
  LIGHTING:        { emoji: '💡', label: 'Lighting',        color: '#E8D61A' },
  AIR_QUALITY:     { emoji: '💨', label: 'Air Quality',     color: '#9B59B6' },
  PARKS:           { emoji: '🌳', label: 'Parks',           color: '#22A66A' },
  PUBLIC_PROPERTY: { emoji: '🏛️', label: 'Public Property', color: '#1ABC9C' },
  OTHER:           { emoji: '📌', label: 'Other',           color: '#95A5A6' },
};

export const PRIORITY_CONFIG: Record<IssuePriority, { color: string; bg: string; glow: string; label: string }> = {
  LOW:      { color: '#22A66A', bg: 'rgba(34,166,106,0.15)',   glow: '0 0 8px rgba(34,166,106,0.4)',   label: 'Low' },
  MEDIUM:   { color: '#E8D61A', bg: 'rgba(232,214,26,0.15)',   glow: '0 0 8px rgba(232,214,26,0.4)',   label: 'Medium' },
  HIGH:     { color: '#E8901A', bg: 'rgba(232,144,26,0.15)',   glow: '0 0 12px rgba(232,144,26,0.5)', label: 'High' },
  CRITICAL: { color: '#E85038', bg: 'rgba(232,80,56,0.15)',    glow: '0 0 16px rgba(232,80,56,0.7)',  label: 'Critical' },
};

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; className: string }> = {
  PENDING_VERIFICATION: { label: '⏳ Pending Verification', color: '#E8D61A',  className: 'badge-pending' },
  VERIFIED:             { label: 'Verified',             color: '#3B9ED4',  className: 'badge-verified' },
  IN_PROGRESS:          { label: 'In Progress',          color: '#E8901A',  className: 'badge-progress' },
  RESOLVED:             { label: 'Resolved',             color: '#22A66A',  className: 'badge-resolved' },
  REJECTED:             { label: 'Rejected',             color: '#E85038',  className: 'badge-rejected' },
};

export const LEVEL_CONFIG = {
  NEWCOMER:     { label: 'Newcomer',     icon: '🌱', min: 0,    max: 100  },
  OBSERVER:     { label: 'Observer',     icon: '👁️', min: 101,  max: 500  },
  REPORTER:     { label: 'Reporter',     icon: '📋', min: 501,  max: 1500 },
  GUARDIAN:     { label: 'Guardian',     icon: '🛡️', min: 1501, max: 3000 },
  ECO_CHAMPION: { label: 'Eco Champion', icon: '🏆', min: 3001, max: 9999 },
};

export const ACHIEVEMENT_CONFIG: Record<string, { icon: string; label: string; desc: string }> = {
  FIRST_REPORT:  { icon: '📍', label: 'First Report',    desc: 'Submitted your first issue' },
  REPORTS_10:    { icon: '📊', label: '10 Reports',      desc: 'Submitted 10 issues' },
  REPORTS_25:    { icon: '🌟', label: '25 Reports',      desc: 'Submitted 25 issues' },
  REPORTS_50:    { icon: '⭐', label: '50 Reports',      desc: 'Submitted 50 issues' },
  REPORTS_100:   { icon: '💫', label: '100 Reports',     desc: 'Submitted 100 issues' },
  FIRST_RESOLVED:{ icon: '✅', label: 'First Resolved',  desc: 'Had your first issue resolved' },
  RESOLVED_5:    { icon: '🎯', label: '5 Resolved',      desc: 'Had 5 issues resolved' },
  STREAK_7:      { icon: '🔥', label: '7-Day Streak',    desc: 'Active for 7 consecutive days' },
  STREAK_30:     { icon: '💎', label: '30-Day Streak',   desc: 'Active for 30 consecutive days' },
  MAP_EXPLORER:  { icon: '🗺️', label: 'Map Explorer',    desc: 'Used the map feature' },
  WARD_PIONEER:  { icon: '🏙️', label: 'Ward Pioneer',    desc: 'First reporter in your ward' },
  MOST_LIKED:    { icon: '❤️', label: 'Most Liked',      desc: 'Got 50+ likes on an issue' },
  EARLY_BIRD:    { icon: '🐦', label: 'Early Bird',      desc: 'Reported before 7 AM' },
  NIGHT_WATCHMAN:{ icon: '🌙', label: 'Night Watchman',  desc: 'Reported after 11 PM' },
};

export const WARDS = [
  'White Town', 'Lawspet', 'Oulgaret', 'Mudaliarpet', 'Villianur',
  'Ariyankuppam', 'Bahour', 'Mannadipet', 'Nettapakkam', 'Embalam',
];

export const PUDUCHERRY_CENTER: [number, number] = [11.9340, 79.8306];
export const PUDUCHERRY_ZOOM = 12;
