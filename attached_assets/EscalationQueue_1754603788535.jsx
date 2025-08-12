import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EscalationQueue = ({ escalations, onEscalate, onDismiss }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Crítica': return 'AlertTriangle';
      case 'Alta': return 'AlertCircle';
      case 'Média': return 'Info';
      default: return 'Circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return 'text-error';
      case 'Alta': return 'text-warning';
      case 'Média': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (minutes) => {
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-enterprise">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center space-x-2">
            <Icon name="TrendingUp" size={18} className="text-warning" />
            <span>Fila de Escalação</span>
          </h3>
          <span className="text-sm text-muted-foreground">
            {escalations?.length} pendentes
          </span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {escalations?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma escalação pendente
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {escalations?.map((escalation) => (
              <div key={escalation?.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getPriorityIcon(escalation?.priority)} 
                      size={16} 
                      className={getPriorityColor(escalation?.priority)} 
                    />
                    <span className="text-sm font-medium text-foreground">
                      #{escalation?.ticketId}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(escalation?.timeOverdue)}
                  </span>
                </div>

                <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                  {escalation?.subject}
                </h4>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                  <span>Cliente: {escalation?.client}</span>
                  <span>•</span>
                  <span>Responsável: {escalation?.responsible}</span>
                </div>

                <div className="bg-error/10 border border-error/20 rounded-md p-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertTriangle" size={14} className="text-error" />
                    <span className="text-xs font-medium text-error">
                      SLA Violado há {formatTimeAgo(escalation?.violationTime)}
                    </span>
                  </div>
                  <p className="text-xs text-error/80 mt-1">
                    {escalation?.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEscalate(escalation?.id)}
                      iconName="ArrowUp"
                      iconPosition="left"
                      iconSize={12}
                      className="text-warning hover:text-warning"
                    >
                      Escalar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(escalation?.id)}
                      iconName="X"
                      iconSize={12}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Dispensar
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="ExternalLink"
                    iconSize={12}
                    className="text-primary hover:text-primary"
                  >
                    Ver Ticket
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalationQueue;