import axios from 'axios';

const API_BASE_URL = 'https://r-25v1.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (username: string, password: string) =>
      apiClient.post('/api/v1/auth/login', { username, password }),
    register: (username: string, password: string, email: string) =>
      apiClient.post('/api/v1/auth/register', { username, password, email }),
    me: () => apiClient.get('/api/v1/auth/me'),
    changePassword: (current_password: string, new_password: string) =>
      apiClient.post('/api/v1/auth/change-password', { current_password, new_password }),
    logout: () => apiClient.post('/api/v1/auth/logout'),
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
