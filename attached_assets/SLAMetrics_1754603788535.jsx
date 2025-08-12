import React from 'react';
import Icon from '../../../components/AppIcon';

const SLAMetrics = ({ metrics }) => {
  const metricCards = [
    {
      id: 'total',
      title: 'Total de Tickets',
      value: metrics?.totalTickets,
      icon: 'Ticket',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'normal',
      title: 'Normal (0-59%)',
      value: metrics?.normalTickets,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 'warning',
      title: 'Atenção (60-79%)',
      value: metrics?.warningTickets,
      icon: 'AlertCircle',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 'critical',
      title: 'Crítico (80-99%)',
      value: metrics?.criticalTickets,
      icon: 'AlertTriangle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      id: 'violated',
      title: 'Violados (100%+)',
      value: metrics?.violatedTickets,
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      id: 'compliance',
      title: 'Taxa de Conformidade',
      value: `${metrics?.complianceRate}%`,
      icon: 'TrendingUp',
      color: metrics?.complianceRate >= 95 ? 'text-success' : metrics?.complianceRate >= 85 ? 'text-warning' : 'text-error',
      bgColor: metrics?.complianceRate >= 95 ? 'bg-success/10' : metrics?.complianceRate >= 85 ? 'bg-warning/10' : 'bg-error/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {metricCards?.map((metric) => (
        <div key={metric?.id} className="bg-card border border-border rounded-lg p-4 shadow-enterprise hover:shadow-enterprise-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${metric?.bgColor}`}>
              <Icon name={metric?.icon} size={20} className={metric?.color} />
            </div>
            {metric?.id === 'compliance' && (
              <div className="flex items-center space-x-1">
                <Icon 
                  name={metrics?.complianceRate >= 95 ? "TrendingUp" : metrics?.complianceRate >= 85 ? "Minus" : "TrendingDown"} 
                  size={14} 
                  className={metric?.color} 
                />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{metric?.value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{metric?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SLAMetrics;