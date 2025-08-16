import { createContext, useContext, type ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Tournament } from '@shared/schema';

export interface WebSocketMessage {
  type:
    | 'tournament_created'
    | 'tournament_updated'
    | 'tournament_deleted'
    | 'tournament_registration'
    | 'tournament_unregistration';
  tournament?: Tournament;
  tournamentId?: string;
  userId?: string;
}

function useWebSocket(onMessage?: (message: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();
  const websocketCallbacks = useRef<((message: any) => void)[]>([]);

  const addCallback = (callback: (message: any) => void) => {
    websocketCallbacks.current.push(callback);
    if (isConnected) {
      callback({ type: 'connected' });
    }
    return () => {
      websocketCallbacks.current = websocketCallbacks.current.filter((cb) => cb !== callback);
    };
  };

  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        websocketCallbacks.current.forEach((callback) => callback({ type: 'connected' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage?.(message);
          websocketCallbacks.current.forEach((callback) =>
            callback({ type: 'message', data: message }),
          );
        } catch (_error) {
          websocketCallbacks.current.forEach((callback) =>
            callback({ type: 'error', error: 'Failed to parse message' }),
          );
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        websocketCallbacks.current.forEach((callback) => callback({ type: 'disconnected' }));

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
            30000,
          );
          const jitter = Math.random() * 1000;
          const finalDelay = delay + jitter;
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = window.setTimeout(connect, finalDelay);
        } else {
          websocketCallbacks.current.forEach((callback) =>
            callback({ type: 'error', error: 'Connection failed after maximum attempts' }),
          );
        }
      };

      wsRef.current.onerror = () => {
        setIsConnected(false);
        websocketCallbacks.current.forEach((callback) =>
          callback({ type: 'error', error: 'WebSocket connection error' }),
        );
      };
    } catch (_error) {
      setIsConnected(false);
      websocketCallbacks.current.forEach((callback) =>
        callback({ type: 'error', error: 'Failed to initiate WebSocket connection' }),
      );
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(
          baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
          30000,
        );
        const jitter = Math.random() * 1000;
        const finalDelay = delay + jitter;
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = window.setTimeout(connect, finalDelay);
      }
    }
  }, [onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, sendMessage, addCallback };
}

interface WebSocketContextValue {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  addCallback: (callback: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const ws = useWebSocket();
  return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketService() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWebSocketService must be used within a WebSocketProvider');
  }
  return ctx;
}

export { useWebSocket };
