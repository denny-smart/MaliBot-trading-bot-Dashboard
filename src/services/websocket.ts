import { supabase } from '@/integrations/supabase/client';
type EventCallback = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private currentUserId: string | null = null;
  private allowReconnect = true;
  private manualClose = false;
  private reconnectTimeout: number | null = null;

  private clearReconnectTimeout() {
    if (this.reconnectTimeout !== null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect() {
    if (!this.allowReconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      void this.connect();
    }, this.reconnectDelay);
  }

  async connect() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const userId = data.session?.user?.id;
    const WS_BASE = import.meta.env.VITE_WS_URL as string;
    const previousUserId = this.currentUserId;

    if (!WS_BASE) {
      console.error('VITE_WS_URL environment variable is not set');
      throw new Error('WebSocket URL not configured. Please set VITE_WS_URL environment variable.');
    }

    // If user is logged out, do not create unauthenticated websocket connections.
    if (!token || !userId) {
      this.allowReconnect = false;
      this.currentUserId = null;
      this.clearReconnectTimeout();
      if (this.ws) {
        this.manualClose = true;
        this.ws.close();
        this.ws = null;
      }
      return;
    }

    this.allowReconnect = true;
    this.clearReconnectTimeout();

    // Check if we are already connected with the SAME user
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (previousUserId === userId) {
        console.debug('WebSocket already connected or connecting for this user');
        return;
      }
      // If user changed, we need to close and reconnect
      console.log('Switching user - reconnecting WebSocket...');
      this.manualClose = true;
      this.ws.close();
    }

    const wsUrl = `${WS_BASE}/ws/live`;

    // Close existing connection if any (e.g. closing or closed state but not null)
    if (this.ws) {
      this.manualClose = true;
      this.ws.close();
    }

    this.currentUserId = userId;
    this.ws = new WebSocket(wsUrl, [token]);

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
        const globalEvents = ['connected', 'disconnected', 'error'];
        const userSpecificEvents = ['bot_status', 'statistics', 'signal', 'new_trade', 'trade_closed', 'log'];
        
        const eventType = data.type as string;
        
        // For all events (except global), check account_id if present
        if (!globalEvents.includes(eventType)) {
          // If event has account_id, only process if it matches current user
          if (data.account_id && data.account_id !== this.currentUserId) {
            console.debug(`Filtered out event for other user: ${eventType} (event account_id: ${data.account_id}, current user: ${this.currentUserId})`);
            return;
          }
          // Log when processing user-specific events for debugging
          if (userSpecificEvents.includes(eventType)) {
            console.debug(`Processing user-specific event: ${eventType} for user ${this.currentUserId}`);
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

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected');
      this.emit('disconnected', {});

      // Avoid reconnect loops on explicit disconnect/log out or auth-required close.
      const authCloseCodes = new Set([4001, 4003, 1008]);
      if (this.manualClose) {
        this.manualClose = false;
        return;
      }
      if (authCloseCodes.has(event.code)) {
        this.allowReconnect = false;
        console.log(`WebSocket closed due to auth state (code ${event.code}); reconnect disabled.`);
        return;
      }

      this.scheduleReconnect();
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
    this.allowReconnect = false;
    this.reconnectAttempts = 0;
    this.clearReconnectTimeout();

    if (this.ws) {
      this.manualClose = true;
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
