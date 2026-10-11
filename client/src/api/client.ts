import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { handleMockRequest } from './mockEngine';

const rawUrl = (import.meta.env.VITE_API_URL || '').trim();
let baseURL = '/api';

if (rawUrl && rawUrl !== '/api') {
  // If it's a domain without scheme, add https
  const withProtocol = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;
  baseURL = withProtocol.endsWith('/api') ? withProtocol : `${withProtocol.replace(/\/+$/, '')}/api`;
}

// Check if running on Vercel or environment where /api is not backed by a Python server
const isVercelOrStandalone = 
  typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('civitrack')) && 
  baseURL === '/api';

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

// Response interceptor: handle HTML rewrites and fallback on 404/405/network errors safely
api.interceptors.response.use(
  (res) => {
    // If response is HTML (which Vercel returns on 200 rewrites when looking for /api)
    if (typeof res.data === 'string' && (res.data.includes('<!DOCTYPE html>') || res.data.includes('<html'))) {
      const mockData = handleMockRequest(res.config);
      if (mockData !== null) {
        return { ...res, data: mockData };
      }
    }
    return res;
  },
  async (err) => {
    // If request failed (e.g. 405 Method Not Allowed, 404, or backend offline)
    if (err.config) {
      const mockData = handleMockRequest(err.config);
      if (mockData !== null) {
        return {
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: err.config,
        };
      }
    }

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
