// ─── User Types ────────────────────────────────────────────────────────────────

export type UserRole = 'CITIZEN' | 'NGO' | 'AUTHORITY';
export type UserLevel = 'NEWCOMER' | 'OBSERVER' | 'REPORTER' | 'GUARDIAN' | 'ECO_CHAMPION';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ward: string;
  language: string;
  eco_score: number;
  level: UserLevel;
  streak: number;
  achievements: string[];
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Issue Types ────────────────────────────────────────────────────────────────

export type IssueCategory = 
  | 'ROADS' | 'WATER' | 'WASTE' | 'LIGHTING' 
  | 'AIR_QUALITY' | 'PARKS' | 'PUBLIC_PROPERTY' | 'OTHER';

export type IssueStatus = 
  | 'PENDING_VERIFICATION' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AreaType = 
  | 'HIGHWAY' | 'SCHOOL_HOSPITAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'RESIDENTIAL' | 'RURAL';

export type HecticLevel = 
  | 'EXTREMELY_BUSY' | 'BUSY' | 'MODERATE' | 'LOW' | 'VERY_LOW';

export interface StatusHistoryEntry {
  status: IssueStatus;
  changed_at: string;
  changed_by: string | null;
  note: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  priority_score: number;
  location: { type: string; coordinates: [number, number] };
  ward: string;
  area_type: AreaType;
  hectic_level: HecticLevel;
  reporter_id: string | null;
  reporter_name?: string;
  is_anonymous: boolean;
  ai_category: string | null;
  ai_confidence: number | null;
  ai_classified_at: string | null;
  attachments: string[];
  status_history: StatusHistoryEntry[];
  like_count: number;
  comment_count: number;
  share_count: number;
  resolved_at: string | null;
  citizen_verified_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface IssueCreate {
  title: string;
  description: string;
  category: IssueCategory;
  ward: string;
  latitude: number;
  longitude: number;
  area_type?: AreaType;
  hectic_level?: HecticLevel;
  is_anonymous: boolean;
  attachments?: string[];
}

// ─── Map Types ──────────────────────────────────────────────────────────────────

export interface MapPin {
  id: string;
  title: string;
  category: IssueCategory;
  priority: IssuePriority;
  priority_score: number;
  status?: IssueStatus;
  location: { type: string; coordinates: [number, number] };
  ward: string;
  like_count: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface WardFeature {
  type: 'Feature';
  properties: {
    name: string;
    name_ta: string;
    name_fr: string;
    health_score: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
}

// ─── Social Types ───────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  content: string;
  issue_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  is_internal: boolean;
  is_pinned: boolean;
  parent_id: string | null;
  created_at: string;
}

export interface Story {
  id: string;
  media_url: string;
  ward: string;
  user_id: string;
  user_name: string;
  expires_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  issue_id: string | null;
  created_at: string;
}

// ─── Analytics Types ────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total: number;
  pending: number;
  verified: number;
  in_progress: number;
  resolved: number;
  critical: number;
  resolution_rate: number;
  avg_resolution_days: number;
}

export interface MonthlyData {
  month: string;
  year: number;
  total: number;
  resolved: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface WardData {
  ward: string;
  total: number;
  resolved: number;
  critical: number;
  resolution_rate: number;
}

export interface SLAItem {
  _id: string;
  title: string;
  category: string;
  ward: string;
  priority: IssuePriority;
  status: IssueStatus;
  created_at: string;
  age_days: number;
  sla_days: number;
  sla_breached: boolean;
}

// ─── Leaderboard ────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string;
  name: string;
  eco_score: number;
  level: UserLevel;
  ward: string;
  achievements: string[];
  rank: number;
}

export interface WardLeaderboardEntry {
  ward: string;
  total_score: number;
  citizen_count: number;
  rank: number;
}

// ─── Ward ───────────────────────────────────────────────────────────────────────

export interface Ward {
  id: string;
  name: string;
  name_ta: string;
  name_fr: string;
  health_score: number;
}

// ─── ML Types ───────────────────────────────────────────────────────────────────

export interface ClassifyResult {
  category: IssueCategory;
  confidence: number;
}

export interface PriorityBreakdown {
  image_severity: number;
  location_weight: number;
  hectic_level: number;
  total: number;
}

export interface PriorityResult {
  score: number;
  priority: IssuePriority;
  breakdown: PriorityBreakdown;
}

export interface ChatbotResponse {
  intent: string;
  response: string;
  language: string;
}
