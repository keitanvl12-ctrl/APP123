import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, Target, Zap, Shield, Bell, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SLAMetrics from '@/components/sla/SLAMetrics';
import SLATicketCard from '@/components/sla/SLATicketCard';
import SLAFilters from '@/components/sla/SLAFilters';
import ViolationHistory from '@/components/sla/ViolationHistory';
import EscalationQueue from '@/components/sla/EscalationQueue';
import TicketDetailModal from '@/components/TicketDetailModal';

export default function SLA() {
  const [filters, setFilters] = React.useState({
    priority: 'all',
    status: 'all',
    department: 'all',
    timeRange: '24h'
  });
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Buscar tickets reais da API
  const { data: realTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/tickets'],
  });

  // Buscar usuários para pegar nomes
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Buscar departamentos para pegar nomes
  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
  });

  // Criar mapeamento de IDs para nomes
  const userMap = users.reduce((acc: any, user: any) => {
    acc[user.id] = user.name;
    return acc;
  }, {});

  const departmentMap = departments.reduce((acc: any, dept: any) => {
    acc[dept.id] = dept.name;
    return acc;
  }, {});

  // Usar tickets reais com dados de SLA calculados no backend
  const slaTickets = realTickets.filter((ticket: any) => ['open', 'in_progress', 'pending'].includes(ticket.status));

  // Listener para abrir ticket modal
  useEffect(() => {
    const handleOpenTicketModal = (e: CustomEvent) => {
      setSelectedTicketId(e.detail.ticketId);
      setIsTicketModalOpen(true);
    };

    window.addEventListener('open-ticket-modal', handleOpenTicketModal as EventListener);
    return () => {
      window.removeEventListener('open-ticket-modal', handleOpenTicketModal as EventListener);
    };
  }, []);

  if (ticketsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredTickets = slaTickets.filter(ticket => {
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.department !== 'all' && ticket.department?.name !== filters.department) return false;
    return true;
  });

  // Separar tickets por criticidade baseado no SLA status
  const criticalTickets = filteredTickets.filter(t => t.slaStatus === 'violated' || t.priority === 'critical');
  const urgentTickets = filteredTickets.filter(t => t.slaStatus === 'at_risk' && !criticalTickets.includes(t)); 
  const normalTickets = filteredTickets.filter(t => !criticalTickets.includes(t) && !urgentTickets.includes(t));

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Monitor SLA
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Visão em tempo real dos acordos de nível de serviço
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              alert('Funcionalidade de Configuração de Alertas será implementada em breve');
            }}
          >
            <Bell className="w-4 h-4" />
            Configurar Alertas
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/sla-rules'}
          >
            <Target className="w-4 h-4" />
            Regras SLA
          </Button>
        </div>
      </div>

      {/* Alertas Críticos - Seção de Destaque */}
      {criticalTickets.length > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="flex justify-between items-center">
              <div>
                <strong>{criticalTickets.length} ticket(s) crítico(s)</strong> precisam de ação imediata!
                Violações ativas ou risco extremo de violação.
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="ml-4"
                onClick={() => {
                  // Redirecionar para o kanban board com filtros críticos
                  window.location.href = '/?priority=critical&status=open';
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Ação Urgente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Visuais Melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">SLA Compliance</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-200">94.2%</p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +2.1% vs mês anterior
                </div>
              </div>
              <Target className="w-12 h-12 text-green-600 opacity-60" />
            </div>
            <Progress value={94.2} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Tickets Críticos</p>
                <p className="text-3xl font-bold text-red-800 dark:text-red-200">{criticalTickets.length}</p>
                <div className="flex items-center text-xs text-red-600 mt-1">
                  {criticalTickets.length > 0 ? (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Requer ação imediata
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Nenhum crítico
                    </>
                  )}
                </div>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Tickets Urgentes</p>
                <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">{urgentTickets.length}</p>
                <div className="flex items-center text-xs text-yellow-600 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Próximos ao SLA
                </div>
              </div>
              <Clock className="w-12 h-12 text-yellow-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Tempo Médio</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">2.4h</p>
                <div className="flex items-center text-xs text-blue-600 mt-1">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  -15min vs semana anterior
                </div>
              </div>
              <Clock className="w-12 h-12 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <SLAFilters filters={filters} onFiltersChange={setFilters} />

      {/* Seções de Tickets Organizadas por Criticidade */}
      <div className="space-y-6">
        {/* Tickets Críticos */}
        {criticalTickets.length > 0 && (
          <Card className="border-red-300 bg-red-50/30 dark:bg-red-950/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-red-800 dark:text-red-200">
                <AlertTriangle className="w-6 h-6" />
                Tickets Críticos ({criticalTickets.length})
                <Badge variant="destructive" className="pulse-animation">AÇÃO URGENTE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {criticalTickets.map(ticket => (
                  <div key={ticket.id} className="ring-2 ring-red-300 rounded-lg">
                    <SLATicketCard ticket={ticket} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets Urgentes */}
        {urgentTickets.length > 0 && (
          <Card className="border-yellow-300 bg-yellow-50/30 dark:bg-yellow-950/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
                <Clock className="w-6 h-6" />
                Tickets Urgentes ({urgentTickets.length})
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">ATENÇÃO</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {urgentTickets.map(ticket => (
                  <div key={ticket.id} className="ring-1 ring-yellow-300 rounded-lg">
                    <SLATicketCard ticket={ticket} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets Normais */}
        {normalTickets.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-green-600" />
                Tickets Regulares ({normalTickets.length})
                <Badge variant="outline" className="border-green-500 text-green-700">OK</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {normalTickets.map(ticket => (
                  <SLATicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Seção Inferior com Escalação e Histórico */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EscalationQueue />
        <ViolationHistory />
      </div>

      {/* Modal de Ticket */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedTicketId(null);
          }}
        />
      )}

      {/* CSS para animações */}
      <style>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}