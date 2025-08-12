import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const TicketPreview = ({ ticket, onClose, onAssign, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!ticket) {
    return (
      <div className="w-full bg-card h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Selecione um ticket para visualizar</p>
        </div>
      </div>
    );
  }

  const priorityConfig = {
    critical: { label: 'Crítica', color: 'text-red-600 bg-red-50', icon: 'AlertTriangle' },
    high: { label: 'Alta', color: 'text-orange-600 bg-orange-50', icon: 'ArrowUp' },
    medium: { label: 'Média', color: 'text-yellow-600 bg-yellow-50', icon: 'Minus' },
    low: { label: 'Baixa', color: 'text-green-600 bg-green-50', icon: 'ArrowDown' }
  };

  const statusConfig = {
    todo: { label: 'A Fazer', color: 'text-gray-600 bg-gray-50' },
    attending: { label: 'Atendendo', color: 'text-blue-600 bg-blue-50' },
    paused: { label: 'Pausado', color: 'text-yellow-600 bg-yellow-50' },
    completed: { label: 'Concluído', color: 'text-green-600 bg-green-50' }
  };

  const getSLAColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes <= 0) return 'Vencido';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const recentActivity = [
    {
      id: 1,
      type: 'comment',
      user: 'Ana Silva',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      action: 'adicionou um comentário',
      time: '2 min atrás',
      content: 'Problema identificado no servidor de email. Iniciando correção.'
    },
    {
      id: 2,
      type: 'status',
      user: 'Sistema',
      avatar: null,
      action: 'alterou status para Atendendo',
      time: '15 min atrás'
    },
    {
      id: 3,
      type: 'assignment',
      user: 'Carlos Santos',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      action: 'atribuiu ticket para Ana Silva',
      time: '1h atrás'
    }
  ];

  const tabs = [
    { id: 'details', label: 'Detalhes', icon: 'FileText' },
    { id: 'activity', label: 'Atividade', icon: 'Activity' },
    { id: 'comments', label: 'Comentários', icon: 'MessageSquare' }
  ];

  return (
    <div className="w-full bg-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground truncate">Ticket #{ticket?.id}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant={ticket?.status === 'attending' ? "outline" : "default"}
            size="sm"
            iconName={ticket?.status === 'attending' ? "Pause" : "Play"}
            iconPosition="left"
            onClick={() => onStatusChange(ticket?.id, ticket?.status === 'attending' ? 'paused' : 'attending')}
            className="text-xs"
          >
            {ticket?.status === 'attending' ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="outline" size="sm" iconName="User" onClick={() => onAssign(ticket?.id)} className="text-xs">
            Atribuir
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border flex-shrink-0">
        <nav className="flex">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium transition-enterprise ${
                activeTab === tab?.id
                  ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab?.icon} size={14} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Informações Básicas</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Assunto</label>
                  <p className="text-sm text-foreground font-medium">{ticket?.subject}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <p className="text-sm text-foreground">{ticket?.category}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Descrição</label>
                  <p className="text-sm text-foreground">{ticket?.description}</p>
                </div>
              </div>
            </div>

            {/* Status & Priority */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Status & Prioridade</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[ticket?.status]?.color}`}>
                    {statusConfig?.[ticket?.status]?.label}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Prioridade</span>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${priorityConfig?.[ticket?.priority]?.color}`}>
                    <Icon name={priorityConfig?.[ticket?.priority]?.icon} size={12} />
                    <span>{priorityConfig?.[ticket?.priority]?.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Information */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">SLA</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progresso</span>
                    <span className="text-xs font-medium text-foreground">{ticket?.slaPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getSLAColor(ticket?.slaPercentage)}`}
                      style={{ width: `${Math.min(ticket?.slaPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tempo Restante</span>
                  <span className="text-xs font-medium text-foreground">
                    {formatTimeRemaining(ticket?.timeRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* People */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Pessoas</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Image
                    src={ticket?.requesterAvatar}
                    alt={ticket?.requester}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ticket?.requester}</p>
                    <p className="text-xs text-muted-foreground">Solicitante</p>
                  </div>
                </div>
                {ticket?.assignee && (
                  <div className="flex items-center space-x-3">
                    <Image
                      src={ticket?.assigneeAvatar}
                      alt={ticket?.assignee}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ticket?.assignee}</p>
                      <p className="text-xs text-muted-foreground">Responsável</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Datas</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Criado em</span>
                  <span className="text-xs text-foreground">{ticket?.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Atualizado em</span>
                  <span className="text-xs text-foreground">{ticket?.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Atividade Recente</h4>
            <div className="space-y-4">
              {recentActivity?.map((activity) => (
                <div key={activity?.id} className="flex items-start space-x-3">
                  {activity?.avatar ? (
                    <Image
                      src={activity?.avatar}
                      alt={activity?.user}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <Icon name="Settings" size={12} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity?.user}</span> {activity?.action}
                    </p>
                    {activity?.content && (
                      <p className="text-sm text-muted-foreground mt-1">{activity?.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{activity?.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Comentários</h4>
              <Button variant="outline" size="sm" iconName="Plus" className="text-xs">
                Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Image
                    src="https://randomuser.me/api/portraits/women/1.jpg"
                    alt="Ana Silva"
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-foreground">Ana Silva</span>
                  <span className="text-xs text-muted-foreground">2 min atrás</span>
                </div>
                <p className="text-sm text-foreground">
                  Problema identificado no servidor de email. Iniciando correção do sistema de autenticação SMTP.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Image
                    src="https://randomuser.me/api/portraits/men/2.jpg"
                    alt="Carlos Santos"
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-foreground">Carlos Santos</span>
                  <span className="text-xs text-muted-foreground">1h atrás</span>
                </div>
                <p className="text-sm text-foreground">
                  Ticket atribuído para análise técnica. Prioridade alta devido ao impacto no sistema de email corporativo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPreview;