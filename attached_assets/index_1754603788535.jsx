import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SLATicketCard from './components/SLATicketCard';
import EscalationQueue from './components/EscalationQueue';
import SLAFilters from './components/SLAFilters';
import ViolationHistory from './components/ViolationHistory';
import SLAMetrics from './components/SLAMetrics';
import BulkActions from './components/BulkActions';

const SLAMonitoringCenter = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data for SLA tickets
  const [tickets] = useState([
    {
      id: 'TK-2024-001',
      subject: 'Sistema de vendas apresentando lentidão extrema durante picos de acesso',
      client: 'TechCorp Ltda',
      responsible: 'Carlos Silva',
      priority: 'Crítica',
      slaPercentage: 95,
      timeRemaining: 15,
      slaStatus: 'critical',
      isPaused: false,
      createdAt: '07/08/2024 14:30',
      department: 'TI'
    },
    {
      id: 'TK-2024-002',
      subject: 'Erro de integração com sistema de pagamento causando falhas nas transações',
      client: 'ComercioMax S.A.',
      responsible: 'Ana Santos',
      priority: 'Alta',
      slaPercentage: 75,
      timeRemaining: 120,
      slaStatus: 'warning',
      isPaused: false,
      createdAt: '07/08/2024 13:15',
      department: 'TI'
    },
    {
      id: 'TK-2024-003',
      subject: 'Solicitação de novo usuário no sistema corporativo',
      client: 'Empresa ABC',
      responsible: 'Pedro Oliveira',
      priority: 'Média',
      slaPercentage: 45,
      timeRemaining: 240,
      slaStatus: 'normal',
      isPaused: false,
      createdAt: '07/08/2024 12:00',
      department: 'RH'
    },
    {
      id: 'TK-2024-004',
      subject: 'Backup do servidor principal falhou durante a madrugada',
      client: 'DataCenter Pro',
      responsible: 'Maria Costa',
      priority: 'Alta',
      slaPercentage: 105,
      timeRemaining: -30,
      slaStatus: 'violated',
      isPaused: false,
      createdAt: '06/08/2024 23:45',
      department: 'TI'
    },
    {
      id: 'TK-2024-005',
      subject: 'Configuração de novo ambiente de desenvolvimento para equipe',
      client: 'StartupTech',
      responsible: 'João Ferreira',
      priority: 'Média',
      slaPercentage: 30,
      timeRemaining: 480,
      slaStatus: 'normal',
      isPaused: true,
      createdAt: '07/08/2024 10:30',
      department: 'TI'
    },
    {
      id: 'TK-2024-006',
      subject: 'Problema de conectividade com VPN corporativa',
      client: 'RemoteWork Inc',
      responsible: 'Carlos Silva',
      priority: 'Alta',
      slaPercentage: 85,
      timeRemaining: 45,
      slaStatus: 'critical',
      isPaused: false,
      createdAt: '07/08/2024 11:20',
      department: 'TI'
    }
  ]);

  // Mock data for escalations
  const [escalations] = useState([
    {
      id: 'ESC-001',
      ticketId: 'TK-2024-004',
      subject: 'Backup do servidor principal falhou durante a madrugada',
      client: 'DataCenter Pro',
      responsible: 'Maria Costa',
      priority: 'Alta',
      timeOverdue: 30,
      violationTime: 30,
      reason: 'SLA de 4 horas excedido. Backup crítico não executado.'
    },
    {
      id: 'ESC-002',
      ticketId: 'TK-2024-001',
      subject: 'Sistema de vendas apresentando lentidão extrema',
      client: 'TechCorp Ltda',
      responsible: 'Carlos Silva',
      priority: 'Crítica',
      timeOverdue: 15,
      violationTime: 15,
      reason: 'Ticket crítico próximo ao vencimento do SLA.'
    }
  ]);

  // Mock data for violation history
  const [violations] = useState([
    {
      id: 'VIO-001',
      ticketId: 'TK-2024-004',
      subject: 'Backup do servidor principal falhou durante a madrugada',
      client: 'DataCenter Pro',
      responsible: 'Maria Costa',
      department: 'TI',
      priority: 'Alta',
      violatedAt: '2024-08-07T03:45:00',
      hoursOverdue: 0.5,
      originalSLA: 4,
      totalTimeSpent: 4.5,
      reason: 'Complexidade técnica maior que o esperado',
      status: 'active'
    },
    {
      id: 'VIO-002',
      ticketId: 'TK-2024-003',
      subject: 'Erro crítico no sistema de pagamentos',
      client: 'FinanceMax',
      responsible: 'Ana Santos',
      department: 'TI',
      priority: 'Crítica',
      violatedAt: '2024-08-06T16:30:00',
      hoursOverdue: 2,
      originalSLA: 2,
      totalTimeSpent: 4,
      reason: 'Dependência de fornecedor externo',
      status: 'resolved'
    }
  ]);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    slaStatus: 'all',
    priority: 'all',
    department: 'all',
    sortBy: 'timeRemaining'
  });

  const [savedFilters] = useState([
    { id: 1, name: 'Críticos', filters: { slaStatus: 'critical', priority: 'all' } },
    { id: 2, name: 'Violados', filters: { slaStatus: 'violated', priority: 'all' } },
    { id: 3, name: 'TI Urgente', filters: { department: 'TI', priority: 'Crítica' } }
  ]);

  // Calculate metrics
  const metrics = {
    totalTickets: tickets?.length,
    normalTickets: tickets?.filter(t => t?.slaPercentage < 60)?.length,
    warningTickets: tickets?.filter(t => t?.slaPercentage >= 60 && t?.slaPercentage < 80)?.length,
    criticalTickets: tickets?.filter(t => t?.slaPercentage >= 80 && t?.slaPercentage < 100)?.length,
    violatedTickets: tickets?.filter(t => t?.slaPercentage >= 100)?.length,
    complianceRate: Math.round(((tickets?.length - tickets?.filter(t => t?.slaPercentage >= 100)?.length) / tickets?.length) * 100)
  };

  // Filter tickets based on current filters
  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = ticket?.subject?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
                         ticket?.client?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
                         ticket?.id?.toLowerCase()?.includes(filters?.search?.toLowerCase());
    
    const matchesSLAStatus = filters?.slaStatus === 'all' || 
                            (filters?.slaStatus === 'normal' && ticket?.slaPercentage < 60) ||
                            (filters?.slaStatus === 'warning' && ticket?.slaPercentage >= 60 && ticket?.slaPercentage < 80) ||
                            (filters?.slaStatus === 'critical' && ticket?.slaPercentage >= 80 && ticket?.slaPercentage < 100) ||
                            (filters?.slaStatus === 'violated' && ticket?.slaPercentage >= 100);
    
    const matchesPriority = filters?.priority === 'all' || ticket?.priority === filters?.priority;
    const matchesDepartment = filters?.department === 'all' || ticket?.department === filters?.department;

    return matchesSearch && matchesSLAStatus && matchesPriority && matchesDepartment;
  })?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'timeRemaining':
        return a?.timeRemaining - b?.timeRemaining;
      case 'slaPercentage':
        return b?.slaPercentage - a?.slaPercentage;
      case 'priority':
        const priorityOrder = { 'Crítica': 4, 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleTicketSelection = (ticketId) => {
    setSelectedTickets(prev => 
      prev?.includes(ticketId) 
        ? prev?.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets?.length === filteredTickets?.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets?.map(t => t?.id));
    }
  };

  const handlePauseTicket = (ticketId) => {
    console.log('Pausar ticket:', ticketId);
  };

  const handleResumeTicket = (ticketId) => {
    console.log('Retomar ticket:', ticketId);
  };

  const handleViewDetails = (ticket) => {
    console.log('Ver detalhes do ticket:', ticket);
  };

  const handleEscalate = (escalationId) => {
    console.log('Escalar:', escalationId);
  };

  const handleDismissEscalation = (escalationId) => {
    console.log('Dispensar escalação:', escalationId);
  };

  const handleBulkAction = (actionData) => {
    console.log('Ação em lote:', actionData);
  };

  const handleSaveFilter = (name, filterData) => {
    console.log('Salvar filtro:', name, filterData);
  };

  const handleLoadFilter = (savedFilter) => {
    setFilters({ ...filters, ...savedFilter?.filters });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        <div className="p-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Centro de Monitoramento SLA</h1>
              <p className="text-muted-foreground">
                Acompanhe o desempenho dos SLAs em tempo real e gerencie violações
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="RefreshCw" size={16} />
                <span>Última atualização: {lastRefresh?.toLocaleTimeString('pt-BR')}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLastRefresh(new Date())}
                iconName="RefreshCw"
                iconPosition="left"
                iconSize={14}
              >
                Atualizar
              </Button>
            </div>
          </div>

          {/* SLA Metrics */}
          <SLAMetrics metrics={metrics} />

          {/* Filters */}
          <SLAFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSaveFilter={handleSaveFilter}
            savedFilters={savedFilters}
            onLoadFilter={handleLoadFilter}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Monitoring Grid */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg shadow-enterprise">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground flex items-center space-x-2">
                      <Icon name="Monitor" size={18} className="text-primary" />
                      <span>Tickets Ativos ({filteredTickets?.length})</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        iconName={selectedTickets?.length === filteredTickets?.length ? "CheckSquare" : "Square"}
                        iconSize={14}
                      >
                        {selectedTickets?.length === filteredTickets?.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {filteredTickets?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Nenhum ticket encontrado
                      </h3>
                      <p className="text-muted-foreground">
                        Ajuste os filtros para ver mais resultados
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {filteredTickets?.map((ticket) => (
                        <div key={ticket?.id} className="relative">
                          <div 
                            className={`absolute top-2 left-2 z-10 cursor-pointer ${
                              selectedTickets?.includes(ticket?.id) ? 'text-primary' : 'text-muted-foreground'
                            }`}
                            onClick={() => handleTicketSelection(ticket?.id)}
                          >
                            <Icon 
                              name={selectedTickets?.includes(ticket?.id) ? "CheckSquare" : "Square"} 
                              size={16} 
                            />
                          </div>
                          <SLATicketCard
                            ticket={ticket}
                            onPause={handlePauseTicket}
                            onResume={handleResumeTicket}
                            onViewDetails={handleViewDetails}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-6">
              {/* Escalation Queue */}
              <EscalationQueue
                escalations={escalations}
                onEscalate={handleEscalate}
                onDismiss={handleDismissEscalation}
              />

              {/* Violation History */}
              <ViolationHistory
                violations={violations}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Bulk Actions */}
      <BulkActions
        selectedTickets={selectedTickets}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedTickets([])}
      />
    </div>
  );
};

export default SLAMonitoringCenter;