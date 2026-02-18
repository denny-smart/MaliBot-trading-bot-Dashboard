import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';
import { type BackendSignal, type BackendPerformance } from '@/lib/monitoringTransformers';
import { type BackendBotStatus } from '@/lib/dashboardTransformers';

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
    // console.log('Attaching Token to request:', config.url);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found for request:', config.url);
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
    checkApproval: () => apiClient.get<{ approved: boolean }>('/api/v1/auth/check-approval'),
    me: () => apiClient.get<{ user: Record<string, unknown> }>('/api/v1/auth/me'),
    status: () => apiClient.get<{ status: string }>('/api/v1/auth/status'),
    requestApproval: () => apiClient.post<{ success: boolean }>('/api/v1/auth/request-approval'),
  },
  bot: {
    start: () => apiClient.post<{ success: boolean }>('/api/v1/bot/start'),
    stop: () => apiClient.post<{ success: boolean }>('/api/v1/bot/stop'),
    restart: () => apiClient.post<{ success: boolean }>('/api/v1/bot/restart'),
    status: () => apiClient.get<BackendBotStatus>('/api/v1/bot/status'),
  },
  trades: {
    active: () => apiClient.get<Record<string, unknown>[]>('/api/v1/trades/active'),
    history: (params?: Record<string, unknown>) => apiClient.get<Record<string, unknown>[]>('/api/v1/trades/history', { params }),
    stats: () => apiClient.get<{ total_trades: number; win_rate: number; total_profit: number; profit_factor: number; avg_win: number; avg_loss: number; largest_win: number; largest_loss: number }>('/api/v1/trades/stats'),
    statsDebug: () => apiClient.get<Record<string, unknown>>('/api/v1/trades/stats/debug'),
  },
  monitor: {
    signals: () => apiClient.get<BackendSignal[]>('/api/v1/monitor/signals'),
    performance: () => apiClient.get<BackendPerformance>('/api/v1/monitor/performance'),
    logs: () => apiClient.get<{ logs: string[]; total_lines: number; showing: number }>('/api/v1/monitor/logs'),
  },
  config: {
    current: () => apiClient.get<{ deriv_api_key?: string; strategy?: string; stake_amount: number; active_strategy?: string;[k: string]: unknown }>('/api/v1/config/current'),
    update: (config: Record<string, unknown>) => apiClient.put<{ success: boolean }>('/api/v1/config/update', config),
    setStrategy: (strategy: string) => apiClient.put<{ success: boolean; strategy: string }>('/api/v1/config/strategy', { strategy }),
    getStrategyParams: () => apiClient.get<{ params: Record<string, unknown> }>('/api/v1/config/strategy-params'),
    updateStrategyParams: (params: Record<string, unknown>) => apiClient.put<{ success: boolean; params: Record<string, unknown> }>('/api/v1/config/strategy-params', params),
  },
  health: () => apiClient.get<{ status: 'ok' | 'degraded' | 'down' }>('/health'),
};

export default api;
