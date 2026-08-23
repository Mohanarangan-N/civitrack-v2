import api from './client'
export const authAPI = {
  register: (d:any) => api.post('/auth/register',d),
  login:    (d:any) => api.post('/auth/login',d),
  me:       ()      => api.get('/auth/me'),
  wards:    ()      => api.get('/auth/wards'),
}
export const issuesAPI = {
  list:           (p?:any)    => api.get('/issues',{params:p}),
  get:            (id:string) => api.get(`/issues/${id}`),
  create:         (d:FormData)=> api.post('/issues',d,{headers:{'Content-Type':'multipart/form-data'}}),
  verify:         (id:string,d:any) => api.patch(`/issues/${id}/verify`,d),
  updateStatus:   (id:string,d:any) => api.patch(`/issues/${id}/status`,d),
  citizenVerify:  (id:string) => api.patch(`/issues/${id}/citizen-verify`),
  like:           (id:string) => api.post(`/issues/${id}/like`),
  addComment:     (id:string,d:any) => api.post(`/issues/${id}/comments`,d),
  getComments:    (id:string) => api.get(`/issues/${id}/comments`),
  trackAnonymous: (token:string) => api.post('/issues/track-anonymous',{token}),
}
export const mapAPI = {
  pins:    () => api.get('/map/pins'),
  heatmap: () => api.get('/map/heatmap'),
  wards:   () => api.get('/map/wards'),
}
export const analyticsAPI = {
  summary:    () => api.get('/analytics/summary'),
  monthly:    () => api.get('/analytics/monthly'),
  categories: () => api.get('/analytics/categories'),
  wards:      () => api.get('/analytics/wards'),
}
export const leaderboardAPI = {
  city: () => api.get('/leaderboard'),
  ward: () => api.get('/leaderboard/ward'),
}
export const notificationsAPI = {
  get:     () => api.get('/notifications'),
  readAll: () => api.patch('/notifications/read-all'),
}
export const storiesAPI = {
  get:  () => api.get('/stories'),
  post: (d:any) => api.post('/stories',d),
}
export const mlAPI = {
  classify: (d:any) => api.post('/ml/classify-text',d),
  priority: (d:any) => api.post('/ml/priority-score',d),
  chatbot:  (d:any) => api.post('/ml/chatbot',d),
}
export const ngoAPI = {
  pending: () => api.get('/users/ngo/pending'),
}
