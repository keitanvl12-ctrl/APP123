import React, { useState, useEffect } from 'react';
import { Bell, X, Ticket, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/userService';

interface Notification {
  id: string;
  type: 'ticket_assigned' | 'ticket_updated' | 'ticket_resolved' | 'sla_warning';
  title: string;
  message: string;
  ticketId?: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const currentUser = getCurrentUser();

  // Buscar notificações do usuário logado
  const { data: userNotifications } = useQuery({
    queryKey: ['/api/notifications', currentUser.id],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?userId=${currentUser.id}`);
      return response.json();
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Buscar tickets atribuídos ao usuário para gerar notificações
  const { data: assignedTickets } = useQuery({
    queryKey: ['/api/tickets/assigned', currentUser.id],
    queryFn: async () => {
      const response = await fetch(`/api/tickets?assignedTo=${currentUser.id}&status=open`);
      return response.json();
    },
    refetchInterval: 60000, // Atualizar a cada minuto
  });

  useEffect(() => {
    if (assignedTickets) {
      // Gerar notificações para tickets atribuídos
      const ticketNotifications: Notification[] = assignedTickets.map((ticket: any) => {
        const createdTime = new Date(ticket.createdAt);
        const now = new Date();
        const hoursPassed = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
        
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let type: 'ticket_assigned' | 'sla_warning' = 'ticket_assigned';
        
        if (hoursPassed > 2) {
          priority = 'critical';
          type = 'sla_warning';
        } else if (hoursPassed > 1) {
          priority = 'high';
        } else if (hoursPassed > 0.5) {
          priority = 'medium';
        }

        return {
          id: `ticket-${ticket.id}`,
          type,
          title: type === 'sla_warning' ? 'Alerta de SLA!' : 'Novo Ticket Atribuído',
          message: `${ticket.subject} - ${ticket.requesterName || 'Cliente'}`,
          ticketId: ticket.id,
          timestamp: createdTime,
          read: false,
          priority
        };
      });

      setNotifications(ticketNotifications);
    }
  }, [assignedTickets]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket_assigned': return <Ticket className="w-4 h-4" />;
      case 'sla_warning': return <AlertCircle className="w-4 h-4" />;
      case 'ticket_updated': return <Clock className="w-4 h-4" />;
      case 'ticket_resolved': return <User className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-end z-50 p-4">
      <Card className="w-full max-w-md mt-16 mr-4 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-opus-blue-dark" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma notificação no momento</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  {notifications.length} notificação(ões)
                </span>
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {notifications
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 dark:bg-gray-800 opacity-75' 
                          : 'bg-white dark:bg-gray-900 shadow-sm'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-opus-blue-dark rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Hook para usar as notificações
export const useNotifications = () => {
  const currentUser = getCurrentUser();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['/api/notifications', currentUser.id],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return {
    notifications,
    unreadCount,
    refetch
  };
};

export default NotificationSystem;