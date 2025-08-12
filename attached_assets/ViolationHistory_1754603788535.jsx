import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ViolationHistory = ({ violations, onViewDetails }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getViolationSeverity = (hoursOverdue) => {
    if (hoursOverdue >= 24) return { color: 'text-error', bg: 'bg-error/10', label: 'Crítica' };
    if (hoursOverdue >= 8) return { color: 'text-warning', bg: 'bg-warning/10', label: 'Alta' };
    return { color: 'text-primary', bg: 'bg-primary/10', label: 'Média' };
  };

  const formatDuration = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-enterprise">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center space-x-2">
            <Icon name="AlertTriangle" size={18} className="text-error" />
            <span>Histórico de Violações</span>
          </h3>
          <span className="text-sm text-muted-foreground">
            Últimas 24h
          </span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {violations?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma violação nas últimas 24 horas
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {violations?.map((violation) => {
              const severity = getViolationSeverity(violation?.hoursOverdue);
              
              return (
                <div key={violation?.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">
                        #{violation?.ticketId}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severity?.color} ${severity?.bg}`}>
                        {severity?.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(violation?.violatedAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-1">
                    {violation?.subject}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3">
                    <div>
                      <span className="font-medium">Cliente:</span> {violation?.client}
                    </div>
                    <div>
                      <span className="font-medium">Responsável:</span> {violation?.responsible}
                    </div>
                    <div>
                      <span className="font-medium">Departamento:</span> {violation?.department}
                    </div>
                    <div>
                      <span className="font-medium">Prioridade:</span> {violation?.priority}
                    </div>
                  </div>
                  <div className="bg-error/5 border border-error/20 rounded-md p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-error">
                        Detalhes da Violação
                      </span>
                      <span className="text-xs text-error">
                        Atrasado: {formatDuration(violation?.hoursOverdue)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      SLA Original: {violation?.originalSLA}h | 
                      Tempo Decorrido: {formatDuration(violation?.totalTimeSpent)}
                    </p>
                    {violation?.reason && (
                      <p className="text-xs text-error/80 mt-1">
                        Motivo: {violation?.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {violation?.status === 'resolved' ? (
                        <div className="flex items-center space-x-1 text-success">
                          <Icon name="CheckCircle" size={14} />
                          <span className="text-xs font-medium">Resolvido</span>
                        </div>
                      ) : violation?.status === 'escalated' ? (
                        <div className="flex items-center space-x-1 text-warning">
                          <Icon name="ArrowUp" size={14} />
                          <span className="text-xs font-medium">Escalado</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-error">
                          <Icon name="Clock" size={14} />
                          <span className="text-xs font-medium">Em Andamento</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(violation)}
                      iconName="ExternalLink"
                      iconSize={12}
                      className="text-primary hover:text-primary"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {violations?.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            iconSize={14}
            className="w-full"
          >
            Exportar Relatório de Violações
          </Button>
        </div>
      )}
    </div>
  );
};

export default ViolationHistory;