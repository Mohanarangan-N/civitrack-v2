import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const rawUrl = (import.meta.env.VITE_API_URL || '').trim();
let baseURL = '/api';

if (rawUrl && rawUrl !== '/api') {
  // If it's a domain without scheme, add https
  const withProtocol = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;
  baseURL = withProtocol.endsWith('/api') ? withProtocol : `${withProtocol.replace(/\/+$/, '')}/api`;
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 safely
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isMeRoute = err.config?.url?.includes('/auth/me');
      if (isMeRoute) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(err);
  }
);

export default api;
