import { supabase } from '@/integrations/supabase/client';
type EventCallback = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private currentUserId: string | null = null;

  async connect() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const userId = data.session?.user?.id;
    const WS_BASE = import.meta.env.VITE_WS_URL as string;

    // Store current user ID for filtering
    this.currentUserId = userId || null;

    if (!WS_BASE) {
      console.error('VITE_WS_URL environment variable is not set');
      throw new Error('WebSocket URL not configured. Please set VITE_WS_URL environment variable.');
    }

    const wsUrl = `${WS_BASE}/ws/live`;

    this.ws = token ? new WebSocket(wsUrl, [token]) : new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', {});
    };

    this.ws.onmessage = (event) => {
      try {
        // Validate message is a string
        if (typeof event.data !== 'string') {
          console.warn('Received non-string WebSocket message:', event.data);
          return;
        }

        const data = JSON.parse(event.data);

        // Validate message has required type field
        if (!data.type) {
          console.warn('WebSocket message missing type field:', data);
          return;
        }

        // MULTI-USER FILTERING: Only process events for current user
        // Skip filtering for global events (connected, disconnected, error)
        const globalEvents = ['connected', 'disconnected', 'error'];
        if (!globalEvents.includes(data.type)) {
          // If event has account_id, only process if it matches current user
          if (data.account_id && data.account_id !== this.currentUserId) {
            console.debug(`Filtered out event for other user: ${data.type} (account_id: ${data.account_id})`);
            return;
          }
        }

        this.emit(data.type, data);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', {
          error: e,
          rawData: event.data,
          dataType: typeof event.data
        });
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected', {});

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { error });
    };
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }

  send(data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.currentUserId = null;
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getCurrentUserId() {
    return this.currentUserId;
  }
}

export const wsService = new WebSocketService();
export default wsService;
