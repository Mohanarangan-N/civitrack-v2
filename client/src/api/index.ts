import api from './client';
import type { Issue, IssueCreate, Comment } from '@/types';

export const issuesAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/issues', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get(`/issues/${id}`).then((r) => r.data),

  create: (data: IssueCreate) =>
    api.post('/issues', data).then((r) => r.data),

  verify: (id: string, data: { action: string; reason?: string; escalate_to_critical?: boolean }) =>
    api.patch(`/issues/${id}/verify`, data).then((r) => r.data),

  updateStatus: (id: string, data: { status: string; note?: string }) =>
    api.patch(`/issues/${id}/status`, data).then((r) => r.data),

  citizenVerify: (id: string) =>
    api.patch(`/issues/${id}/citizen-verify`).then((r) => r.data),

  toggleLike: (id: string) =>
    api.post(`/issues/${id}/like`).then((r) => r.data),

  getComments: (id: string) =>
    api.get(`/issues/${id}/comments`).then((r) => r.data),

  postComment: (id: string, data: { content: string; parent_id?: string; is_internal?: boolean }) =>
    api.post(`/issues/${id}/comments`, data).then((r) => r.data),

  trackAnonymous: (token: string) =>
    api.get('/issues/track-anonymous', { params: { token } }).then((r) => r.data),
};

export const mapAPI = {
  getPins: () => api.get('/map/pins').then((r) => r.data),
  getHeatmap: () => api.get('/map/heatmap').then((r) => r.data),
  getWards: () => api.get('/map/wards').then((r) => r.data),
};

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string; ward: string; language: string }) =>
    api.post('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  me: () => api.get('/auth/me').then((r) => r.data),
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary').then((r) => r.data),
  getMonthly: () => api.get('/analytics/monthly').then((r) => r.data),
  getCategory: () => api.get('/analytics/category').then((r) => r.data),
  getWards: () => api.get('/analytics/wards').then((r) => r.data),
  getSLA: () => api.get('/analytics/sla').then((r) => r.data),
  getPreventativeInsights: () => api.get('/analytics/preventative-insights').then((r) => r.data),
};

export const ngoAPI = {
  getPending: () => api.get('/ngo/pending').then((r) => r.data),
  getStats: () => api.get('/ngo/stats').then((r) => r.data),
};

export const leaderboardAPI = {
  getCity: () => api.get('/leaderboard').then((r) => r.data),
  getWard: () => api.get('/leaderboard/ward').then((r) => r.data),
};

export const storiesAPI = {
  getAll: () => api.get('/stories').then((r) => r.data),
  post: (data: { media_url: string; ward: string }) =>
    api.post('/stories', data).then((r) => r.data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications').then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};

export const usersAPI = {
  getProfile: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  getIssues: (id: string, page = 1) =>
    api.get(`/users/${id}/issues`, { params: { page } }).then((r) => r.data),
};

export const wardsAPI = {
  getAll: () => api.get('/wards').then((r) => r.data),
};

export const mlAPI = {
  classifyText: (text: string) =>
    api.post('/ml/classify-text', { text }).then((r) => r.data),

  validateImage: (data: { image: string; category: string; title?: string; description?: string }) =>
    api.post('/ml/validate-image', data),

  priorityScore: (area_type: string, hectic_level: string, image_severity = 0.5) =>
    api.post('/ml/priority-score', { area_type, hectic_level, image_severity }).then((r) => r.data),

  chatbot: (message: string, language = 'en') =>
    api.post('/ml/chatbot', { message, language }).then((r) => r.data),
};
