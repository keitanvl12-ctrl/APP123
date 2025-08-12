import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActivityMonitor = () => {
  const [activeTab, setActiveTab] = useState('sessions');

  const activeSessions = [
    {
      id: 1,
      usuario: 'Ana Silva',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      email: 'ana.silva@empresa.com',
      ip: '192.168.1.100',
      dispositivo: 'Chrome - Windows 11',
      localizacao: 'São Paulo, SP',
      inicioSessao: '07/08/2025 14:30',
      ultimaAtividade: '18:45',
      status: 'Ativo'
    },
    {
      id: 2,
      usuario: 'Carlos Santos',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      email: 'carlos.santos@empresa.com',
      ip: '192.168.1.105',
      dispositivo: 'Firefox - macOS',
      localizacao: 'Rio de Janeiro, RJ',
      inicioSessao: '07/08/2025 09:15',
      ultimaAtividade: '18:42',
      status: 'Ativo'
    },
    {
      id: 3,
      usuario: 'Maria Oliveira',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      email: 'maria.oliveira@empresa.com',
      ip: '192.168.1.110',
      dispositivo: 'Safari - iPhone',
      localizacao: 'Belo Horizonte, MG',
      inicioSessao: '07/08/2025 16:20',
      ultimaAtividade: '18:40',
      status: 'Inativo'
    }
  ];

  const systemUsage = [
    { metric: 'Usuários Online', value: '23', change: '+5', trend: 'up' },
    { metric: 'Sessões Ativas', value: '31', change: '+2', trend: 'up' },
    { metric: 'Pico Diário', value: '45', change: '-3', trend: 'down' },
    { metric: 'Tempo Médio', value: '4h 32m', change: '+15m', trend: 'up' }
  ];

  const securityEvents = [
    {
      id: 1,
      tipo: 'Login Suspeito',
      usuario: 'João Pereira',
      descricao: 'Tentativa de login de localização não usual',
      ip: '203.45.67.89',
      timestamp: '07/08/2025 18:35',
      severidade: 'Alta',
      status: 'Investigando'
    },
    {
      id: 2,
      tipo: 'Múltiplas Tentativas',
      usuario: 'Sistema',
      descricao: '5 tentativas de login falharam para admin@empresa.com',
      ip: '192.168.1.200',
      timestamp: '07/08/2025 17:20',
      severidade: 'Média',
      status: 'Bloqueado'
    },
    {
      id: 3,
      tipo: 'Permissão Alterada',
      usuario: 'Ana Silva',
      descricao: 'Permissões de administrador concedidas a carlos.santos',
      ip: '192.168.1.100',
      timestamp: '07/08/2025 16:45',
      severidade: 'Baixa',
      status: 'Aprovado'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Alta': return 'bg-error text-error-foreground';
      case 'Média': return 'bg-warning text-warning-foreground';
      case 'Baixa': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'text-success';
      case 'Inativo': return 'text-muted-foreground';
      case 'Investigando': return 'text-warning';
      case 'Bloqueado': return 'text-error';
      case 'Aprovado': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const tabs = [
    { id: 'sessions', label: 'Sessões Ativas', icon: 'Users', count: activeSessions?.length },
    { id: 'usage', label: 'Uso do Sistema', icon: 'BarChart3', count: null },
    { id: 'security', label: 'Eventos de Segurança', icon: 'Shield', count: securityEvents?.length }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-enterprise">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={16} />
          <h3 className="text-sm font-semibold text-foreground">Monitor de Atividade</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>Atualização em tempo real</span>
          </div>
          <Button variant="outline" size="xs" iconName="RefreshCw" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-enterprise ${
              activeTab === tab?.id
                ? 'border-b-2 border-primary text-primary' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
            {tab?.count !== null && (
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="p-4">
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Sessões Ativas ({activeSessions?.length})</h4>
              <Button variant="outline" size="xs" iconName="LogOut" iconPosition="left">
                Encerrar Todas
              </Button>
            </div>
            
            <div className="space-y-3">
              {activeSessions?.map((session) => (
                <div key={session?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={session?.avatar}
                        alt={session?.usuario}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                        session?.status === 'Ativo' ? 'bg-success' : 'bg-muted-foreground'
                      }`}></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{session?.usuario}</div>
                      <div className="text-xs text-muted-foreground">{session?.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Monitor" size={12} />
                        <span>{session?.dispositivo}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Icon name="MapPin" size={12} />
                        <span>{session?.localizacao}</span>
                      </div>
                    </div>
                    <div>
                      <div>Início: {session?.inicioSessao}</div>
                      <div className={getStatusColor(session?.status)}>
                        Última: {session?.ultimaAtividade}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      iconName="LogOut"
                      className="text-error hover:text-error"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <h4 className="text-sm font-medium text-foreground">Estatísticas de Uso</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {systemUsage?.map((stat, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat?.metric}</p>
                      <p className="text-lg font-semibold text-foreground">{stat?.value}</p>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs ${
                      stat?.trend === 'up' ? 'text-success' : 'text-error'
                    }`}>
                      <Icon name={stat?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={12} />
                      <span>{stat?.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-medium text-foreground">Atividade por Hora</h5>
              <div className="h-32 bg-muted/50 rounded-lg flex items-end justify-center p-4">
                <div className="flex items-end space-x-1 h-full">
                  {[12, 8, 15, 22, 18, 25, 30, 28, 35, 32, 28, 20]?.map((height, index) => (
                    <div
                      key={index}
                      className="bg-primary rounded-t flex-1 min-w-0"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Eventos de Segurança</h4>
              <Button variant="outline" size="xs" iconName="Download" iconPosition="left">
                Exportar Log
              </Button>
            </div>
            
            <div className="space-y-3">
              {securityEvents?.map((event) => (
                <div key={event.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severidade)}`}>
                          {event.severidade}
                        </span>
                        <span className="text-sm font-medium text-foreground">{event.tipo}</span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{event.descricao}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Usuário: {event.usuario}</span>
                        <span>IP: {event.ip}</span>
                        <span>{event.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <Button variant="outline" size="xs" iconName="Eye" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityMonitor;