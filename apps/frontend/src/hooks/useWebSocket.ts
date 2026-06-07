'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE } from '@/lib/constants';

type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WsMessage {
  type: string;
  data?: unknown;
  message?: string;
}

export function useWebSocket(onMessage?: (msg: WsMessage) => void) {
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    try {
      setStatus('connecting');
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mountedRef.current) setStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          if (mountedRef.current && onMessage) onMessage(msg);
        } catch {
          // ignore malformed
        }
      };

      ws.onerror = () => {
        if (mountedRef.current) setStatus('error');
      };

      ws.onclose = () => {
        if (mountedRef.current) {
          setStatus('disconnected');
          // Auto-reconnect after 5s
          reconnectTimer.current = setTimeout(connect, 5000);
        }
      };
    } catch {
      setStatus('error');
    }
  }, [onMessage]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status };
}
