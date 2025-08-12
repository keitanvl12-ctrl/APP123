import React from 'react';
import Icon from '../AppIcon';
import Button from '../Button';

import { TicketWithDetails } from '@shared/schema';

interface SLATicketCardProps {
  ticket: TicketWithDetails & {
    slaHoursRemaining?: number;
    slaHoursTotal?: number;
    slaStatus?: 'met' | 'at_risk' | 'violated';
    slaSource?: string;
  };
}

export default function SLATicketCard({ ticket }: SLATicketCardProps) {
  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  const statusColors = {
    open: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    in_progress: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    resolved: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
  };

  const statusLabels = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    pending: 'Pendente',
    resolved: 'Resolvido'
  };

  const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica'
  };

  const formatTimeRemaining = (hoursRemaining: number) => {
    if (hoursRemaining <= 0) {
      const hoursViolated = Math.abs(hoursRemaining);
      return `Vencido há ${hoursViolated.toFixed(1)}h`;
    }
    
    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining - hours) * 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`;
    } else {
      return `${minutes}m restantes`;
    }
  };

  const getTimeColor = (hoursRemaining: number) => {
    if (hoursRemaining <= 0) return 'text-red-600 dark:text-red-400';
    if (hoursRemaining <= 1) return 'text-yellow-600 dark:text-yellow-400'; // < 1 hora
    return 'text-green-600 dark:text-green-400';
  };

  // Usar dados reais do SLA calculado no backend
  const hoursRemaining = ticket.slaHoursRemaining || 0;
  const hoursTotal = ticket.slaHoursTotal || 4;
  const slaStatus = ticket.slaStatus || 'met';
  
  const calculateProgress = () => {
    if (hoursTotal <= 0) return 0;
    
    // Se está vencido (hoursRemaining negativo), progresso é 100%
    if (hoursRemaining <= 0) return 100;
    
    // Calcular quantas horas já se passaram
    const hoursElapsed = hoursTotal - hoursRemaining;
    const progress = (hoursElapsed / hoursTotal) * 100;
    
    // Garantir que está entre 0 e 100
    return Math.min(Math.max(progress, 0), 100);
  };

  const progress = calculateProgress();
  const isViolation = slaStatus === 'violated';
  const isUrgent = slaStatus === 'at_risk';
  const isCritical = ticket.priority === 'critical';

  // Determinar estilo do card baseado na criticidade
  const getCardStyles = () => {
    if (isViolation) {
      return 'border-red-500 dark:border-red-400 bg-gradient-to-r from-red-50 via-red-50 to-red-100 dark:from-red-950/30 dark:via-red-950/20 dark:to-red-900/30 shadow-lg shadow-red-200/50 dark:shadow-red-900/50';
    }
    if (isCritical) {
      return 'border-orange-500 dark:border-orange-400 bg-gradient-to-r from-orange-50 via-orange-50 to-orange-100 dark:from-orange-950/30 dark:via-orange-950/20 dark:to-orange-900/30 shadow-md shadow-orange-200/30 dark:shadow-orange-900/30';
    }
    if (isUrgent) {
      return 'border-yellow-400 dark:border-yellow-400 bg-gradient-to-r from-yellow-50 via-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:via-yellow-950/20 dark:to-yellow-900/30 shadow-md shadow-yellow-200/30 dark:shadow-yellow-900/30';
    }
    if (ticket.escalated) {
      return 'border-purple-400 dark:border-purple-400 bg-gradient-to-r from-purple-50 via-purple-50 to-purple-100 dark:from-purple-950/30 dark:via-purple-950/20 dark:to-purple-900/30 shadow-md shadow-purple-200/30 dark:shadow-purple-900/30';
    }
    return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
  };

  return (
    <div className={`rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${getCardStyles()}`}>
      {/* Header com Indicadores Críticos */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
            <span className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              {ticket.ticketNumber}
            </span>
            
            {/* Indicadores de Status Crítico */}
            {isViolation && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg animate-pulse">
                <Icon name="AlertTriangle" size={14} className="mr-1" />
                VIOLAÇÃO ATIVA
              </span>
            )}
            
            {isCritical && !isViolation && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md">
                <Icon name="Zap" size={14} className="mr-1" />
                CRÍTICO
              </span>
            )}
            
            {isUrgent && !isViolation && !isCritical && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-md">
                <Icon name="Clock" size={14} className="mr-1" />
                URGENTE
              </span>
            )}
            
            {ticket.escalated && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500 text-white shadow-md">
                <Icon name="ArrowUp" size={14} className="mr-1" />
                ESCALADO
              </span>
            )}
          </div>
          
          <h3 className={`text-lg font-bold line-clamp-2 ${
            isViolation ? 'text-red-800 dark:text-red-200' :
            isCritical ? 'text-orange-800 dark:text-orange-200' :
            'text-slate-900 dark:text-slate-100'
          }`}>
            {ticket.subject}
          </h3>
        </div>
      </div>

      {/* Priority & Status Badges */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
          <Icon name="Flag" size={12} className="mr-1" />
          {priorityLabels[ticket.priority]}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
          {statusLabels[ticket.status]}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
          {ticket.department?.name || 'N/A'}
        </span>
      </div>

      {/* SLA Progress Visual Melhorado */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="Target" size={16} className="text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Progresso SLA
            </span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            isViolation 
              ? 'bg-red-600 text-white animate-pulse' 
              : isUrgent
                ? 'bg-orange-500 text-white'
                : 'bg-green-500 text-white'
          }`}>
            {formatTimeRemaining(hoursRemaining)}
          </div>
        </div>
        
        {/* Barra de Progresso Aprimorada */}
        <div className="relative w-full bg-slate-300 dark:bg-slate-600 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className={`h-4 rounded-full transition-all duration-700 relative ${
              isViolation 
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700' 
                : progress > 80 
                  ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
                  : 'bg-gradient-to-r from-green-400 via-green-500 to-green-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            {/* Efeito de brilho para violações */}
            {isViolation && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping"></div>
            )}
            
            {/* Indicador de perigo quando próximo ao limite */}
            {progress > 90 && !isViolation && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent animate-pulse"></div>
            )}
          </div>
          
          {/* Marco de 100% */}
          <div className="absolute top-0 right-0 w-0.5 h-4 bg-slate-500 dark:bg-slate-400"></div>
        </div>
        
        {/* Informações adicionais */}
        <div className="flex justify-between items-center mt-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {progress.toFixed(1)}% do tempo utilizado
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Meta: {hoursTotal}h
          </span>
        </div>
      </div>

      {/* Assignee & Actions Melhorados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
            isViolation ? 'bg-red-500' : 
            isCritical ? 'bg-orange-500' : 
            'bg-blue-500'
          }`}>
            {ticket.assignedToUser?.name ? ticket.assignedToUser.name.split(' ').map(n => n[0]).join('') : 'NA'}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {ticket.assignedToUser?.name || 'Não atribuído'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Responsável
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => {
              const event = new CustomEvent('open-ticket-modal', { 
                detail: { ticketId: ticket.id } 
              });
              window.dispatchEvent(event);
            }}
          >
            <Icon name="Eye" size={14} className="mr-1" />
            Ver Detalhes
          </Button>
          
          {isViolation && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="text-xs font-bold animate-pulse"
              onClick={() => {
                window.location.href = `/?ticket=${ticket.id}&action=urgent`;
                // Mostrar toast de alerta
                const event = new CustomEvent('show-urgent-alert', { 
                  detail: { ticketId: ticket.id, title: ticket.subject } 
                });
                window.dispatchEvent(event);
              }}
            >
              <Icon name="AlertTriangle" size={14} className="mr-1" />
              AÇÃO URGENTE
            </Button>
          )}
          
          {isCritical && !isViolation && (
            <Button 
              variant="default" 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-xs font-bold"
              onClick={() => window.location.href = `/?ticket=${ticket.id}&priority=critical`}
            >
              <Icon name="Zap" size={14} className="mr-1" />
              PRIORITÁRIO
            </Button>
          )}
          
          {isUrgent && !isViolation && !isCritical && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold"
              onClick={() => window.location.href = `/?ticket=${ticket.id}&priority=urgent`}
            >
              <Icon name="Clock" size={14} className="mr-1" />
              URGENTE
            </Button>
          )}
        </div>
      </div>

      {/* Created Time */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Criado em {new Date(ticket.createdAt).toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  );
}