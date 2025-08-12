import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../AppIcon';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
  };

  const changeColor = changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                     changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                     'text-slate-500 dark:text-slate-400';

  const changeIcon = changeType === 'positive' ? 'TrendingUp' :
                    changeType === 'negative' ? 'TrendingDown' :
                    'Minus';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon name={icon as any} size={24} />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${changeColor}`}>
          <Icon name={changeIcon as any} size={14} />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </h3>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
          {value}
        </p>
      </div>
    </div>
  );
};

export default function SLAMetrics() {
  // Buscar dados reais dos tickets
  const { data: tickets = [] } = useQuery<any[]>({
    queryKey: ['/api/tickets']
  });

  // Removido priorityConfigs - SLA agora é calculado exclusivamente no backend

  // Calcular métricas reais baseadas nos tickets
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status !== 'resolved').length;
  
  // Tickets com SLA violado baseado nos dados reais do backend
  const violatedTickets = tickets.filter(ticket => {
    return ticket.slaStatus === 'violated';
  }).length;

  // Calcular porcentagem de cumprimento SLA
  const slaCompliance = totalTickets > 0 ? ((totalTickets - violatedTickets) / totalTickets * 100).toFixed(1) : '100';
  
  // Calcular tempo médio de resposta baseado nos dados SLA reais
  const avgResponseTime = tickets.length > 0 ? 
    (tickets.reduce((acc, ticket) => {
      if (ticket.slaHoursRemaining !== undefined && ticket.slaHoursTotal) {
        const hoursUsed = ticket.slaHoursTotal - ticket.slaHoursRemaining;
        return acc + Math.max(hoursUsed, 0);
      }
      return acc + 0;
    }, 0) / tickets.length).toFixed(1) : '0';

  // Tickets críticos necessitando atenção
  const criticalTickets = tickets.filter(ticket => {
    return ticket.priority === 'critical' && ticket.status !== 'resolved';
  }).length;

  const metrics = [
    {
      title: 'Cumprimento SLA',
      value: `${slaCompliance}%`,
      change: 2.1,
      changeType: (parseFloat(slaCompliance) >= 95 ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: 'Target',
      color: parseFloat(slaCompliance) >= 95 ? 'green' : 'red' as const
    },
    {
      title: 'Tempo Médio Resposta',
      value: `${avgResponseTime}h`,
      change: -15.3,
      changeType: 'positive' as const,
      icon: 'Clock',
      color: 'blue' as const
    },
    {
      title: 'Violações SLA',
      value: violatedTickets.toString(),
      change: 12.5,
      changeType: violatedTickets === 0 ? 'positive' : 'negative' as const,
      icon: 'AlertTriangle',
      color: 'red' as const
    },
    {
      title: 'Críticos Abertos',
      value: criticalTickets.toString(),
      change: -20.0,
      changeType: criticalTickets === 0 ? 'positive' : 'negative' as const,
      icon: 'AlertCircle',
      color: criticalTickets === 0 ? 'green' : 'yellow' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}