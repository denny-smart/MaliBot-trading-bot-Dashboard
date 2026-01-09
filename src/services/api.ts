import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add Supabase token to all requests
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut();
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    checkApproval: () => apiClient.get('/api/v1/auth/check-approval'),
    me: () => apiClient.get('/api/v1/auth/me'),
    status: () => apiClient.get('/api/v1/auth/status'),
  },
  bot: {
    start: () => apiClient.post('/api/v1/bot/start'),
    stop: () => apiClient.post('/api/v1/bot/stop'),
    restart: () => apiClient.post('/api/v1/bot/restart'),
    status: () => apiClient.get('/api/v1/bot/status'),
  },
  trades: {
    active: () => apiClient.get('/api/v1/trades/active'),
    history: (params?: Record<string, unknown>) => apiClient.get('/api/v1/trades/history', { params }),
    stats: () => apiClient.get('/api/v1/trades/stats'),
  },
  monitor: {
    signals: () => apiClient.get('/api/v1/monitor/signals'),
    performance: () => apiClient.get('/api/v1/monitor/performance'),
    logs: () => apiClient.get('/api/v1/monitor/logs'),
  },
  config: {
    current: () => apiClient.get('/api/v1/config/current'),
    update: (config: Record<string, unknown>) => apiClient.put('/api/v1/config/update', config),
  },
  health: () => apiClient.get('/health'),
};

export default api;
