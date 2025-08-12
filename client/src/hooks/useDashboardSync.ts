import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useDashboardSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Dashboard sync WebSocket connected');
        clearTimeout(reconnectTimeout);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Dashboard sync received:', message.type);
          
          if (message.type === 'ticket_updated' || 
              message.type === 'ticket_created' || 
              message.type === 'dashboard_update') {
            
            // Immediate cache invalidation and refetch
            console.log('Triggering immediate dashboard refresh');
            
            // Invalidate all dashboard queries
            queryClient.invalidateQueries({ 
              predicate: (query) => {
                const key = query.queryKey[0] as string;
                return key.startsWith('/api/dashboard');
              }
            });

            // Force immediate refetch of critical dashboard data
            setTimeout(() => {
              queryClient.refetchQueries({ 
                predicate: (query) => {
                  const key = query.queryKey[0] as string;
                  return key === '/api/dashboard/stats';
                }
              });
            }, 100);
          }
        } catch (error) {
          console.error('Error processing dashboard sync message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Dashboard sync WebSocket disconnected, reconnecting...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('Dashboard sync WebSocket error:', error);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [queryClient]);
}