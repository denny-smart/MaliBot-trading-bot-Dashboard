import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';
import { wsService } from '@/services/websocket';
import { type BackendSignal, type BackendPerformance } from '@/lib/monitoringTransformers';
import { type BackendBotStatus } from '@/lib/dashboardTransformers';
import { type BackendTrade } from '@/lib/tradeTransformers';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const AUTH_OPTIONAL_PATHS = new Set([
  '/health',
  '/api/v1/auth/status',
  '/api/v1/auth/check-approval',
]);

let handlingAuthFailure = false;

function normalizePath(url?: string): string {
  if (!url) return '';
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    return path.split('?')[0];
  } catch {
    return url.split('?')[0];
  }
}

function isProtectedApiPath(path: string): boolean {
  return path.startsWith('/api/v1/') && !AUTH_OPTIONAL_PATHS.has(path);
}

type AxiosAuthErrorShape = {
  response?: {
    status?: number;
    data?: {
      detail?: unknown;
    };
  };
};

function isAuthFailure(error: unknown): boolean {
  const shapedError = error as AxiosAuthErrorShape;
  const status = shapedError.response?.status;
  const detail = String(shapedError.response?.data?.detail ?? '').toLowerCase();

  if (status === 401) return true;
  if (status !== 403) return false;

  // Keep 403 for not-approved accounts as a valid app state (no forced signout).
  if (detail.includes('not approved')) return false;

  return (
    detail.includes('not authenticated') ||
    detail.includes('invalid token') ||
    detail.includes('jwt') ||
    detail.includes('session')
  );
}

async function handleAuthFailureOnce(): Promise<void> {
  if (handlingAuthFailure) return;
  handlingAuthFailure = true;
  wsService.disconnect();
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Failed to sign out after auth failure:', error);
  } finally {
    window.setTimeout(() => {
      handlingAuthFailure = false;
    }, 1000);
  }
}

// Add Supabase token to all requests
apiClient.interceptors.request.use(async (config) => {
  const path = normalizePath(config.url);
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (isProtectedApiPath(path)) {
    await handleAuthFailureOnce();
    throw new axios.CanceledError(`Skipped unauthenticated request: ${path}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isCancel(error) && isAuthFailure(error)) {
      void handleAuthFailureOnce();
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
    active: () => apiClient.get<BackendTrade[]>('/api/v1/trades/active'),
    history: (params?: Record<string, unknown>) => apiClient.get<BackendTrade[]>('/api/v1/trades/history', { params }),
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
