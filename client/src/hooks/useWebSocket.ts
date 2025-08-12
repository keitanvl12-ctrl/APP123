import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket conectado');
        
        // Registrar cliente com informações do usuário
        if (user) {
          wsRef.current?.send(JSON.stringify({
            type: 'register',
            userId: user.id,
            departmentId: user.departmentId,
            role: user.role
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket desconectado');
        
        // Reconectar após 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('Erro WebSocket:', error);
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }, [user]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'ticket_change':
        // Invalidar queries relacionadas a tickets
        queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
        queryClient.invalidateQueries({ queryKey: ['/api/sla/violations'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        break;
        
      case 'dashboard_update':
        // Invalidar queries do dashboard
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/priority-stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/trends'] });
        break;
        
      case 'sla_change':
        // Invalidar queries do SLA
        queryClient.invalidateQueries({ queryKey: ['/api/sla'] });
        queryClient.invalidateQueries({ queryKey: ['/api/sla/violations'] });
        break;
        
      case 'user_change':
        // Invalidar queries de usuários
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        break;

      default:
        console.log('Mensagem WebSocket não tratada:', message);
    }
  }, [queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    connected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    disconnect
  };
}