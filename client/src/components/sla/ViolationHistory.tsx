import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../AppIcon';

interface ViolationRecord {
  id: string;
  ticketId: string;
  title: string;
  violationTime: Date;
  department: string;
  assignee: string;
  impact: 'low' | 'medium' | 'high';
}

export default function ViolationHistory() {
  // Buscar dados reais dos tickets
  const { data: tickets = [] } = useQuery<any[]>({
    queryKey: ['/api/tickets']
  });

  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments']
  });

  const { data: priorityConfigs = [] } = useQuery<any[]>({
    queryKey: ['/api/config/priority']
  });

  // Calcular violações SLA baseado em tickets reais
  const violations: ViolationRecord[] = tickets
    .filter(ticket => {
      // Considerar tickets com mais de 24 horas como violação de SLA
      const createdAt = new Date(ticket.createdAt);
      const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursOld > 24 && ticket.status !== 'resolvido';
    })
    .map(ticket => {
      const dept = departments.find(d => d.id === ticket.departmentId);
      const priority = priorityConfigs.find(p => p.id === ticket.priority);
      
      // Determinar impacto baseado na prioridade
      let impact: 'low' | 'medium' | 'high' = 'medium';
      if (priority) {
        const priorityName = priority.name.toLowerCase();
        if (priorityName.includes('crítica') || priorityName.includes('critical')) {
          impact = 'high';
        } else if (priorityName.includes('baixa') || priorityName.includes('low')) {
          impact = 'low';
        }
      }

      return {
        id: ticket.id,
        ticketId: ticket.ticketNumber,
        title: ticket.subject,
        violationTime: new Date(ticket.createdAt),
        department: dept ? dept.name : 'N/A',
        assignee: ticket.assignedToName || 'Não atribuído',
        impact
      };
    })
    .sort((a, b) => b.violationTime.getTime() - a.violationTime.getTime()) // Mais recentes primeiro
    .slice(0, 10); // Limitar a 10 itens

  const impactColors = {
    low: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  const impactLabels = {
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto'
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d atrás`;
    }
  };

  // Calcular estatísticas
  const todayViolations = violations.filter(v => {
    const today = new Date();
    const violationDate = new Date(v.violationTime);
    return violationDate.toDateString() === today.toDateString();
  }).length;

  const weekViolations = violations.filter(v => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(v.violationTime) >= weekAgo;
  }).length;

  const monthViolations = violations.filter(v => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return new Date(v.violationTime) >= monthAgo;
  }).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="AlertTriangle" size={18} className="text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Histórico de Violações
          </h3>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Últimas 24h
        </span>
      </div>

      <div className="space-y-3">
        {violations.map((violation) => (
          <div 
            key={violation.id}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            onClick={() => {
              const event = new CustomEvent('open-ticket-modal', { 
                detail: { ticketId: violation.id } 
              });
              window.dispatchEvent(event);
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {violation.ticketId}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${impactColors[violation.impact]}`}>
                    {impactLabels[violation.impact]}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {violation.title}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <Icon name="Building2" size={12} className="mr-1" />
                  {violation.department}
                </span>
                <span className="flex items-center">
                  <Icon name="User" size={12} className="mr-1" />
                  {violation.assignee}
                </span>
              </div>
              <span className="flex items-center">
                <Icon name="Clock" size={12} className="mr-1" />
                {formatTimeAgo(violation.violationTime)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {violations.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-green-500 dark:text-green-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
            Nenhuma Violação
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Todos os SLAs estão sendo cumpridos
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button 
          className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          onClick={() => {
            window.location.href = '/reports?tab=violations';
          }}
        >
          Ver Histórico Completo
        </button>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-750 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{todayViolations}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Hoje</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{weekViolations}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Esta Semana</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{monthViolations}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Este Mês</p>
          </div>
        </div>
      </div>
    </div>
  );
}