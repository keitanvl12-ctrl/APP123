import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SLATicketCard = ({ ticket, onPause, onResume, onViewDetails }) => {
  const getSLAStatusColor = (status, percentage) => {
    if (status === 'violated') return 'bg-error';
    if (percentage >= 80) return 'bg-error';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-success';
  };

  const getSLAStatusText = (status, percentage) => {
    if (status === 'violated') return 'Violado';
    if (percentage >= 80) return 'Crítico';
    if (percentage >= 60) return 'Atenção';
    return 'Normal';
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes <= 0) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${mins?.toString()?.padStart(2, '0')}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return 'text-error bg-error/10';
      case 'Alta': return 'text-warning bg-warning/10';
      case 'Média': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-muted-foreground">#{ticket?.id}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
              {ticket?.priority}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
            {ticket?.subject}
          </h3>
        </div>
        <div className="ml-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(ticket)}
            className="h-8 w-8"
          >
            <Icon name="ExternalLink" size={14} />
          </Button>
        </div>
      </div>
      {/* Client and Responsible */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="User" size={14} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{ticket?.client}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="UserCheck" size={14} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{ticket?.responsible}</span>
        </div>
      </div>
      {/* SLA Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">SLA Progress</span>
          <span className={`text-xs font-medium ${
            ticket?.slaStatus === 'violated' ? 'text-error' : 
            ticket?.slaPercentage >= 80 ? 'text-error' :
            ticket?.slaPercentage >= 60 ? 'text-warning' : 'text-success'
          }`}>
            {getSLAStatusText(ticket?.slaStatus, ticket?.slaPercentage)}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getSLAStatusColor(ticket?.slaStatus, ticket?.slaPercentage)} ${
              ticket?.slaPercentage >= 80 ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.min(ticket?.slaPercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Tempo restante: {formatTimeRemaining(ticket?.timeRemaining)}
          </span>
          <span className="text-muted-foreground">
            {ticket?.slaPercentage}%
          </span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          {ticket?.isPaused ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResume(ticket?.id)}
              iconName="Play"
              iconPosition="left"
              iconSize={14}
              className="text-success hover:text-success"
            >
              Retomar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPause(ticket?.id)}
              iconName="Pause"
              iconPosition="left"
              iconSize={14}
              className="text-warning hover:text-warning"
            >
              Pausar
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Icon name="Clock" size={12} />
          <span>{ticket?.createdAt}</span>
        </div>
      </div>
    </div>
  );
};

export default SLATicketCard;