import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/AppIcon';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  lastLogin: string;
}

interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  type: string;
  action: string;
  target?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ActivityMonitorProps {
  onClose: () => void;
  users: User[];
}

export default function ActivityMonitor({
  onClose,
  users
}: ActivityMonitorProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityEntry[]>([]);
  const [filters, setFilters] = useState({
    user: 'all',
    type: 'all',
    severity: 'all',
    timeRange: 'today'
  });
  const [isLive, setIsLive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock activity data
  const mockActivities: ActivityEntry[] = [
    {
      id: '1',
      userId: '1',
      userName: 'João Silva Santos',
      userRole: 'admin',
      type: 'authentication',
      action: 'Login realizado com sucesso',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'São Paulo, SP',
      severity: 'low'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Maria Santos Oliveira',
      userRole: 'operator',
      type: 'ticket',
      action: 'Ticket #1234 foi resolvido',
      target: 'Ticket #1234',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'São Paulo, SP',
      severity: 'medium'
    },
    {
      id: '3',
      userId: '1',
      userName: 'João Silva Santos',
      userRole: 'admin',
      type: 'user_management',
      action: 'Novo usuário criado: Carlos Lima',
      target: 'Carlos Lima',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'São Paulo, SP',
      severity: 'high'
    },
    {
      id: '4',
      userId: '3',
      userName: 'Carlos Eduardo Lima',
      userRole: 'user',
      type: 'authentication',
      action: 'Tentativa de login falhada (senha incorreta)',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Rio de Janeiro, RJ',
      severity: 'critical'
    },
    {
      id: '5',
      userId: '2',
      userName: 'Maria Santos Oliveira',
      userRole: 'operator',
      type: 'settings',
      action: 'Configurações de perfil atualizadas',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'São Paulo, SP',
      severity: 'low'
    }
  ];

  useEffect(() => {
    setActivities(mockActivities);
    setFilteredActivities(mockActivities);
  }, []);

  // Auto refresh simulation
  useEffect(() => {
    if (!autoRefresh || !isLive) return;

    const interval = setInterval(() => {
      // Simulate new activity
      const newActivity: ActivityEntry = {
        id: Date.now().toString(),
        userId: users[Math.floor(Math.random() * users.length)].id,
        userName: users[Math.floor(Math.random() * users.length)].name,
        userRole: users[Math.floor(Math.random() * users.length)].role,
        type: ['authentication', 'ticket', 'settings', 'user_management'][Math.floor(Math.random() * 4)],
        action: 'Nova atividade simulada',
        timestamp: new Date().toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG'][Math.floor(Math.random() * 3)],
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep only 50 most recent
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isLive, users]);

  // Apply filters
  useEffect(() => {
    let filtered = [...activities];

    if (filters.user) {
      filtered = filtered.filter(activity => activity.userId === filters.user);
    }

    if (filters.type) {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    if (filters.severity) {
      filtered = filtered.filter(activity => activity.severity === filters.severity);
    }

    const now = new Date();
    const timeRangeFilter = (activity: ActivityEntry) => {
      const activityTime = new Date(activity.timestamp);
      const diffInMs = now.getTime() - activityTime.getTime();
      
      switch (filters.timeRange) {
        case 'today':
          return diffInMs <= 24 * 60 * 60 * 1000;
        case 'week':
          return diffInMs <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return diffInMs <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    };

    filtered = filtered.filter(timeRangeFilter);
    setFilteredActivities(filtered);
  }, [activities, filters]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'authentication': return 'LogIn';
      case 'ticket': return 'Ticket';
      case 'user_management': return 'Users';
      case 'settings': return 'Settings';
      default: return 'Activity';
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-700';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return severity;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'authentication': return 'Autenticação';
      case 'ticket': return 'Tickets';
      case 'user_management': return 'Usuários';
      case 'settings': return 'Configurações';
      default: return type;
    }
  };

  const exportActivities = () => {
    const csv = [
      ['Timestamp', 'Usuário', 'Função', 'Tipo', 'Ação', 'Severidade', 'IP', 'Localização'].join(','),
      ...filteredActivities.map(activity => [
        activity.timestamp,
        activity.userName,
        activity.userRole,
        getTypeLabel(activity.type),
        activity.action,
        getSeverityLabel(activity.severity),
        activity.ipAddress,
        activity.location
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atividades-usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Icon name="Activity" size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Monitor de Atividade dos Usuários
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Acompanhe em tempo real as ações realizadas pelos usuários
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {isLive ? 'Ao Vivo' : 'Pausado'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              iconName={isLive ? "Pause" : "Play"}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportActivities}
              iconName="Download"
            />
            
            <Button
              variant="ghost"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Select value={filters.user} onValueChange={(value) => setFilters({...filters, user: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="authentication">Autenticação</SelectItem>
                  <SelectItem value="ticket">Tickets</SelectItem>
                  <SelectItem value="user_management">Usuários</SelectItem>
                  <SelectItem value="settings">Configurações</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filters.severity} onValueChange={(value) => setFilters({...filters, severity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas severidades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filters.timeRange} onValueChange={(value) => setFilters({...filters, timeRange: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                iconName={autoRefresh ? "Pause" : "Play"}
                className="flex-1"
              >
                {autoRefresh ? 'Pausar' : 'Iniciar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="p-6 max-h-[calc(90vh-12rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Atividades Recentes ({filteredActivities.length})
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Atualizado {formatTimestamp(new Date().toISOString())}
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Activity" size={48} className="text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Não há atividades que correspondam aos filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map(activity => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border transition-all duration-200 ${getActivityColor(activity.severity)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Icon name={getActivityIcon(activity.type) as any} size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {activity.userName}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                          {activity.userRole}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>{getSeverityLabel(activity.severity)}</span>
                        <span>•</span>
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                      {activity.action}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Icon name="MapPin" size={12} />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Globe" size={12} />
                        <span>{activity.ipAddress}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Tag" size={12} />
                        <span>{getTypeLabel(activity.type)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}