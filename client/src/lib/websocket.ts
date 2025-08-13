import { useCallback, useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type:
    | 'tournament_created'
    | 'tournament_updated'
    | 'tournament_deleted'
    | 'tournament_registration'
    | 'tournament_unregistration';
  tournament?: any;
  tournamentId?: string;
  userId?: string;
}

export function useWebSocket(onMessage?: (message: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();
  const websocketCallbacks = useRef<((message: any) => void)[]>([]); // Use a ref to hold the callbacks

  // Function to add callbacks
  const addCallback = (callback: (message: any) => void) => {
    websocketCallbacks.current.push(callback);
    // Ensure initial connection status is reflected if already connected
    if (isConnected) {
      callback({ type: 'connected' });
    }
    return () => {
      // Remove callback on cleanup
      websocketCallbacks.current = websocketCallbacks.current.filter((cb) => cb !== callback);
    };
  };

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      // console.log("Connecting to WebSocket at:", wsUrl); // Removed console.log

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        // console.log("WebSocket connected"); // Removed console.log
        setIsConnected(true);
        reconnectAttempts = 0;
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        websocketCallbacks.current.forEach((callback) => callback({ type: 'connected' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage?.(message); // Call the primary onMessage handler
          websocketCallbacks.current.forEach((callback) =>
            callback({ type: 'message', data: message }),
          ); // Call registered callbacks
        } catch (_error) {
          websocketCallbacks.current.forEach((callback) =>
            callback({
              type: 'error',
              error: 'Failed to parse message',
            }),
          );
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        websocketCallbacks.current.forEach((callback) => callback({ type: 'disconnected' }));

        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000);
          const jitter = Math.random() * 1000; // Add some randomness
          const finalDelay = delay + jitter;
          reconnectAttempts++;
          reconnectTimeoutRef.current = window.setTimeout(connect, finalDelay);
        } else {
          websocketCallbacks.current.forEach((callback) =>
            callback({
              type: 'error',
              error: 'Connection failed after maximum attempts',
            }),
          );
        }
      };

      wsRef.current.onerror = () => {
        setIsConnected(false); // Ensure isConnected is false on error
        websocketCallbacks.current.forEach((callback) =>
          callback({
            type: 'error',
            error: 'WebSocket connection error',
          }),
        );
        // The onclose event will handle reconnection logic, so we don't need to call connect() here again.
      };
    } catch (_error) {
      // console.error("Failed to connect to WebSocket:", error); // Removed console.error
      setIsConnected(false);
      websocketCallbacks.current.forEach((callback) =>
        callback({
          type: 'error',
          error: 'Failed to initiate WebSocket connection',
        }),
      );
      // Attempt to reconnect even if initial connection fails
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000);
        const jitter = Math.random() * 1000; // Add some randomness
        const finalDelay = delay + jitter;
        // console.log( // Removed console.log
        //   `Attempting to reconnect after initial failure in ${Math.round(finalDelay)}ms... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`,
        // );
        reconnectAttempts++;
        reconnectTimeoutRef.current = window.setTimeout(connect, finalDelay);
      } else {
        // console.error("Max reconnection attempts reached after initial failure"); // Removed console.error
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
    } else {
      // console.warn("Cannot send message: WebSocket is not open."); // Removed console.warn
      // Optionally, queue message or notify user
    }
  };

  return { isConnected, sendMessage, addCallback };
}
