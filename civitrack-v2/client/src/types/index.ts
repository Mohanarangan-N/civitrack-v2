export type Role = 'CITIZEN'|'NGO'|'AUTHORITY'|'ADMIN'
export type Lang = 'en'|'ta'|'fr'
export type IssueStatus = 'PENDING_VERIFICATION'|'VERIFIED'|'IN_PROGRESS'|'RESOLVED'|'REJECTED'|'INVALID'|'DUPLICATE'
export type Priority = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
export type Category = 'ROADS'|'WATER'|'WASTE'|'LIGHTING'|'AIR_QUALITY'|'PARKS'|'PUBLIC_PROPERTY'|'OTHER'
export type CitizenLevel = 'NEWCOMER'|'OBSERVER'|'REPORTER'|'GUARDIAN'|'ECO_CHAMPION'

export interface User {
  id: string; name: string; email: string; role: Role
  ward?: string; city: string; language: Lang
  avatar_url?: string; eco_score: number; level: CitizenLevel
  achievements: Achievement[]; streak_days: number
  followers_count: number; following_count: number; is_verified: boolean
  report_count: number; created_at: string
}

export interface Achievement { badge_key: string; unlocked_at: string; bonus_pts: number }

export interface AI {
  category?: Category; priority?: Priority; confidence: number
  tags: string[]; summary?: string; total_score: number
  image_score: number; location_score: number; hectic_score: number
  classified_at?: string
}

export interface Attachment { file_url: string; mime_type: string; exif_stripped: boolean }

export interface StatusEntry {
  status: IssueStatus; changed_by?: string; changed_by_role?: string
  note?: string; changed_at: string
}

export interface Anonymous {
  is_anonymous: boolean; display_name: string
  exact_coords_public: boolean; timestamp_blurred: boolean
}

export interface Issue {
  id: string; title: string; description: string
  category: Category; status: IssueStatus; priority: Priority
  location: { type: string; coordinates: [number,number] }
  address?: string; ward?: string
  reporter_id?: string; anonymous: Anonymous
  ngo_id?: string; assignee_id?: string; ai: AI
  like_count: number; comment_count: number; share_count: number
  upvote_count: number; view_count: number
  attachments: Attachment[]; status_history: StatusEntry[]
  rejection_reason?: string; resubmission_count: number
  resolved_at?: string; citizen_verified_resolved: boolean
  created_at: string; updated_at: string
}

export interface Comment {
  id: string; issue_id: string; user_id: string
  user_name: string; user_role: Role; content: string
  is_internal: boolean; is_pinned: boolean; created_at: string
}

export interface Story {
  id: string; user_id: string; user_name: string
  user_role: Role; content?: string; ward?: string
  story_type: string; view_count: number; expires_at: string; created_at: string
}

export interface MapPin {
  id: string; lat: number; lng: number; title: string
  category: Category; priority: Priority; status: IssueStatus
  ward: string; emoji: string; color: string; likes: number
}

export interface Ward {
  id?: string; name: string; name_ta: string; name_fr: string
  health_score: number; open_issues: number; center?: [number,number]
}

export const CATEGORY_EMOJI: Record<Category,string> = {
  ROADS:'🚧',WATER:'💧',WASTE:'🗑️',LIGHTING:'💡',AIR_QUALITY:'💨',PARKS:'🌳',PUBLIC_PROPERTY:'🏛️',OTHER:'📌'
}
export const PRIORITY_COLOR: Record<Priority,string> = {
  LOW:'#4CC88A',MEDIUM:'#FFD060',HIGH:'#E8901A',CRITICAL:'#E85038'
}
export const STATUS_COLOR: Record<IssueStatus,string> = {
  PENDING_VERIFICATION:'#B57BFF',VERIFIED:'#3B9ED4',IN_PROGRESS:'#E8901A',
  RESOLVED:'#4CC88A',REJECTED:'#E85038',INVALID:'#888',DUPLICATE:'#888'
}
export const LEVEL_THRESHOLDS = { NEWCOMER:[0,100],OBSERVER:[101,500],REPORTER:[501,1500],GUARDIAN:[1501,3000],ECO_CHAMPION:[3001,999999] }
export const LEVEL_EMOJI: Record<CitizenLevel,string> = {
  NEWCOMER:'🌱',OBSERVER:'👁️',REPORTER:'⭐',GUARDIAN:'🛡️',ECO_CHAMPION:'👑'
}
