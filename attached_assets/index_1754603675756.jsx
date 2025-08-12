import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import KanbanColumn from './components/KanbanColumn';
import FilterSidebar from './components/FilterSidebar';
import BulkActions from './components/BulkActions';
import TicketModal from './components/TicketModal';

const KanbanBoardView = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [columnFilters, setColumnFilters] = useState({});
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Mock data for tickets
  const [tickets, setTickets] = useState([
    {
      id: 'TK-2025-001',
      subject: 'Sistema de login apresentando lentidão durante horário de pico',
      description: `O sistema de autenticação está apresentando lentidão significativa durante os horários de maior movimento (9h-11h e 14h-16h).\n\nUsuários relatam tempo de resposta superior a 30 segundos para realizar login.\n\nImpacto: Alto - afeta produtividade de toda equipe comercial.`,
      priority: 'High',
      status: 'todo',
      category: 'technical',
      requester: {
        name: 'Maria Santos',
        email: 'maria.santos@empresa.com.br',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
      },
      assignedAgent: {
        id: 'ana.silva',
        name: 'Ana Silva',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      slaPercentage: 25,
      slaRemaining: '6h 30min',
      hasAttachments: true,
      commentCount: 3,
      tags: ['login', 'performance', 'urgente'],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000)
    },
    {
      id: 'TK-2025-002',
      subject: 'Solicitação de nova funcionalidade no módulo de relatórios',
      description: `Necessidade de implementar filtros avançados no módulo de relatórios financeiros.\n\nFuncionalidades solicitadas:\n- Filtro por período customizado\n- Agrupamento por categoria\n- Exportação em múltiplos formatos`,
      priority: 'Medium',
      status: 'attending',
      category: 'feature',
      requester: {
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@empresa.com.br',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      assignedAgent: {
        id: 'carlos.santos',
        name: 'Carlos Santos',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
      },
      slaPercentage: 45,
      slaRemaining: '4h 15min',
      hasAttachments: false,
      commentCount: 7,
      tags: ['feature', 'relatórios', 'financeiro'],
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 1800000)
    },
    {
      id: 'TK-2025-003',
      subject: 'Erro crítico no processamento de pagamentos via PIX',
      description: `Sistema apresenta erro 500 ao processar pagamentos via PIX.\n\nErro ocorre em aproximadamente 30% das transações.\n\nLog de erro: "Payment gateway timeout - PIX processing failed"\n\nAção necessária: Investigação urgente e correção imediata.`,
      priority: 'Critical',
      status: 'paused',
      category: 'technical',
      requester: {
        name: 'Ana Ferreira',
        email: 'ana.ferreira@empresa.com.br',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
      },
      assignedAgent: {
        id: 'maria.oliveira',
        name: 'Maria Oliveira',
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
      },
      slaPercentage: 95,
      slaRemaining: '30min',
      hasAttachments: true,
      commentCount: 12,
      tags: ['crítico', 'pagamento', 'pix', 'bug'],
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 900000)
    },
    {
      id: 'TK-2025-004',
      subject: 'Configuração de backup automático implementada com sucesso',
      description: `Sistema de backup automático foi configurado e testado.\n\nConfigurações implementadas:\n- Backup diário às 02:00\n- Retenção de 30 dias\n- Notificação por email em caso de falha\n\nTestes realizados com sucesso. Sistema em produção.`,
      priority: 'Low',
      status: 'completed',
      category: 'technical',
      requester: {
        name: 'João Silva',
        email: 'joao.silva@empresa.com.br',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      assignedAgent: {
        id: 'joao.ferreira',
        name: 'João Ferreira',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
      },
      slaPercentage: 100,
      slaRemaining: 'Concluído',
      hasAttachments: false,
      commentCount: 5,
      tags: ['backup', 'infraestrutura', 'concluído'],
      createdAt: new Date(Date.now() - 432000000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'TK-2025-005',
      subject: 'Dúvida sobre cobrança na fatura do mês anterior',
      description: `Cliente questiona cobrança adicional na fatura de dezembro/2024.\n\nValor questionado: R$ 1.250,00\nReferente a: Serviços adicionais\n\nSolicitação: Detalhamento da cobrança e justificativa dos valores.`,
      priority: 'Medium',
      status: 'todo',
      category: 'billing',
      requester: {
        name: 'Patricia Costa',
        email: 'patricia.costa@cliente.com.br',
        avatar: 'https://randomuser.me/api/portraits/women/5.jpg'
      },
      assignedAgent: null,
      slaPercentage: 15,
      slaRemaining: '7h 45min',
      hasAttachments: true,
      commentCount: 1,
      tags: ['cobrança', 'fatura', 'financeiro'],
      createdAt: new Date(Date.now() - 21600000),
      updatedAt: new Date(Date.now() - 21600000)
    },
    {
      id: 'TK-2025-006',
      subject: 'Treinamento da equipe no novo sistema CRM',
      description: `Organização de treinamento para equipe comercial no novo sistema CRM.\n\nParticipantes: 15 pessoas\nDuração estimada: 4 horas\nModalidade: Presencial\n\nTópicos a abordar:\n- Navegação básica\n- Cadastro de leads\n- Acompanhamento de oportunidades\n- Relatórios gerenciais`,
      priority: 'Low',
      status: 'attending',
      category: 'general',
      requester: {
        name: 'Roberto Lima',
        email: 'roberto.lima@empresa.com.br',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
      },
      assignedAgent: {
        id: 'ana.silva',
        name: 'Ana Silva',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      slaPercentage: 60,
      slaRemaining: '2h 20min',
      hasAttachments: false,
      commentCount: 4,
      tags: ['treinamento', 'crm', 'equipe'],
      createdAt: new Date(Date.now() - 345600000),
      updatedAt: new Date(Date.now() - 7200000)
    }
  ]);

  // Column definitions
  const columns = [
    {
      id: 'todo',
      title: 'A Fazer',
      description: 'Tickets aguardando atendimento'
    },
    {
      id: 'attending',
      title: 'Em Atendimento',
      description: 'Tickets sendo processados'
    },
    {
      id: 'paused',
      title: 'Pausado',
      description: 'Tickets temporariamente suspensos'
    },
    {
      id: 'completed',
      title: 'Concluído',
      description: 'Tickets finalizados'
    }
  ];

  // Filter tickets based on search and filters
  const filteredTickets = tickets?.filter(ticket => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery?.toLowerCase();
      const matchesSearch = 
        ticket?.id?.toLowerCase()?.includes(searchLower) ||
        ticket?.subject?.toLowerCase()?.includes(searchLower) ||
        ticket?.requester?.name?.toLowerCase()?.includes(searchLower) ||
        (ticket?.assignedAgent?.name || '')?.toLowerCase()?.includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Advanced filters
    if (filters?.priorities?.length && !filters?.priorities?.includes(ticket?.priority)) return false;
    if (filters?.statuses?.length && !filters?.statuses?.includes(ticket?.status)) return false;
    if (filters?.agents?.length && !filters?.agents?.includes(ticket?.assignedAgent?.id)) return false;
    if (filters?.categories?.length && !filters?.categories?.includes(ticket?.category)) return false;
    
    // SLA filters
    if (filters?.slaStatuses?.length) {
      const slaStatus = ticket?.slaPercentage >= 90 ? 'critical' : 
                      ticket?.slaPercentage >= 70 ? 'warning' : 'normal';
      if (!filters?.slaStatuses?.includes(slaStatus)) return false;
    }

    // Date filters
    if (filters?.startDate && new Date(ticket.createdAt) < new Date(filters.startDate)) return false;
    if (filters?.endDate && new Date(ticket.createdAt) > new Date(filters.endDate)) return false;

    return true;
  });

  // Group tickets by status
  const ticketsByStatus = columns?.reduce((acc, column) => {
    acc[column.id] = filteredTickets?.filter(ticket => {
      // Apply column-specific filters
      const columnFilter = columnFilters?.[column?.id];
      if (columnFilter?.priority && columnFilter?.priority !== 'all' && ticket?.priority !== columnFilter?.priority) {
        return false;
      }
      if (columnFilter?.agent && columnFilter?.agent !== 'all' && ticket?.assignedAgent?.id !== columnFilter?.agent) {
        return false;
      }
      if (columnFilter?.sla && columnFilter?.sla !== 'all') {
        const slaStatus = ticket?.slaPercentage >= 90 ? 'critical' : 
                         ticket?.slaPercentage >= 70 ? 'warning' : 'normal';
        if (slaStatus !== columnFilter?.sla) return false;
      }
      
      return ticket?.status === column?.id;
    });
    return acc;
  }, {});

  // Calculate ticket counts for filters
  const ticketCounts = {
    priority: tickets?.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc?.[ticket?.priority] || 0) + 1;
      return acc;
    }, {}),
    status: tickets?.reduce((acc, ticket) => {
      acc[ticket.status] = (acc?.[ticket?.status] || 0) + 1;
      return acc;
    }, {}),
    agent: tickets?.reduce((acc, ticket) => {
      if (ticket?.assignedAgent) {
        acc[ticket.assignedAgent.id] = (acc?.[ticket?.assignedAgent?.id] || 0) + 1;
      }
      return acc;
    }, {}),
    category: tickets?.reduce((acc, ticket) => {
      acc[ticket.category] = (acc?.[ticket?.category] || 0) + 1;
      return acc;
    }, {}),
    sla: tickets?.reduce((acc, ticket) => {
      const slaStatus = ticket?.slaPercentage >= 90 ? 'critical' : 
                       ticket?.slaPercentage >= 70 ? 'warning' : 'normal';
      acc[slaStatus] = (acc?.[slaStatus] || 0) + 1;
      return acc;
    }, {})
  };

  // Handle ticket move
  const handleTicketMove = useCallback((ticketId, newStatus) => {
    setTickets(prevTickets => 
      prevTickets?.map(ticket => 
        ticket?.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date() }
          : ticket
      )
    );
  }, []);

  // Handle ticket selection
  const handleTicketSelect = useCallback((ticketId, isSelected, shiftKey = false) => {
    if (shiftKey && lastSelectedIndex !== null) {
      // Range selection with Shift+Click
      const currentIndex = filteredTickets?.findIndex(t => t?.id === ticketId);
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const rangeTickets = filteredTickets?.slice(start, end + 1)?.map(t => t?.id);
      
      setSelectedTickets(prev => {
        const newSelection = [...prev];
        rangeTickets?.forEach(id => {
          if (!newSelection?.includes(id)) {
            newSelection?.push(id);
          }
        });
        return newSelection;
      });
    } else {
      // Single selection
      setSelectedTickets(prev => 
        isSelected 
          ? [...prev, ticketId]
          : prev?.filter(id => id !== ticketId)
      );
      setLastSelectedIndex(filteredTickets?.findIndex(t => t?.id === ticketId));
    }
  }, [filteredTickets, lastSelectedIndex]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action, ticketIds) => {
    switch (action) {
      case 'move-todo':
      case 'move-attending': case'move-paused': case'move-completed':
        const newStatus = action?.split('-')?.[1];
        setTickets(prevTickets =>
          prevTickets?.map(ticket =>
            ticketIds?.includes(ticket?.id)
              ? { ...ticket, status: newStatus, updatedAt: new Date() }
              : ticket
          )
        );
        break;
      case 'export':
        // Mock export functionality
        console.log('Exporting tickets:', ticketIds);
        break;
      case 'select-all':
        setSelectedTickets(filteredTickets?.map(t => t?.id));
        break;
      default:
        console.log('Bulk action:', action, ticketIds);
    }
  }, [filteredTickets]);

  // Handle ticket edit
  const handleTicketEdit = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  }, []);

  // Handle ticket save
  const handleTicketSave = useCallback(async (updatedTicket) => {
    setTickets(prevTickets =>
      prevTickets?.map(ticket =>
        ticket?.id === updatedTicket?.id
          ? { ...updatedTicket, updatedAt: new Date() }
          : ticket
      )
    );
  }, []);

  // Handle ticket delete
  const handleTicketDelete = useCallback(async (ticketId) => {
    setTickets(prevTickets => prevTickets?.filter(ticket => ticket?.id !== ticketId));
  }, []);

  // Handle column filter change
  const handleColumnFilterChange = useCallback((columnId, filterType, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: {
        ...prev?.[columnId],
        [filterType]: value
      }
    }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setColumnFilters({});
    setSearchQuery('');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e?.ctrlKey || e?.metaKey) {
        switch (e?.key) {
          case 'f':
            e?.preventDefault();
            setIsFilterSidebarOpen(true);
            break;
          case 'a':
            e?.preventDefault();
            setSelectedTickets(filteredTickets?.map(t => t?.id));
            break;
        }
      }
      if (e?.key === 'Escape') {
        setSelectedTickets([]);
        setIsFilterSidebarOpen(false);
        setIsTicketModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTickets]);

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
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

        <main className={`
          pt-16 transition-all duration-300
          ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
        `}>
          <div className="p-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Quadro Kanban
                </h1>
                <p className="text-muted-foreground">
                  Gerencie tickets através de arrastar e soltar entre as colunas de status
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <div className="flex items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="Buscar tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    iconName="Search"
                    iconSize={16}
                  />
                </div>
                
                <Button
                  variant="outline"
                  iconName="Filter"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() => setIsFilterSidebarOpen(true)}
                  className={isFilterSidebarOpen ? 'bg-muted' : ''}
                >
                  Filtros
                </Button>
                
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() => window.location.href = '/ticket-creation-form'}
                >
                  Novo Ticket
                </Button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {columns?.map((column) => {
                const count = ticketsByStatus?.[column?.id]?.length || 0;
                const totalCount = tickets?.filter(t => t?.status === column?.id)?.length;
                
                return (
                  <div key={column?.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{column?.title}</p>
                        <p className="text-2xl font-bold text-foreground">
                          {count}
                          {count !== totalCount && (
                            <span className="text-sm text-muted-foreground ml-1">
                              de {totalCount}
                            </span>
                          )}
                        </p>
                      </div>
                      <Icon 
                        name={
                          column?.id === 'todo' ? 'Circle' :
                          column?.id === 'attending' ? 'Play' :
                          column?.id === 'paused' ? 'Pause' : 'CheckCircle'
                        } 
                        size={24} 
                        className="text-muted-foreground" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kanban Board */}
            <div className="flex space-x-6 overflow-x-auto pb-6">
              {columns?.map((column) => (
                <div key={column?.id} className="flex-shrink-0 w-80">
                  <KanbanColumn
                    column={column}
                    tickets={ticketsByStatus?.[column?.id] || []}
                    onTicketMove={handleTicketMove}
                    onTicketEdit={handleTicketEdit}
                    onTicketSelect={handleTicketSelect}
                    selectedTickets={selectedTickets}
                    canDrag={true}
                    activeFilters={columnFilters?.[column?.id] || {}}
                    onFilterChange={(filterType, value) => 
                      handleColumnFilterChange(column?.id, filterType, value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          ticketCounts={ticketCounts}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedTickets={selectedTickets}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedTickets([])}
          totalTickets={filteredTickets?.length}
        />

        {/* Ticket Modal */}
        <TicketModal
          ticket={selectedTicket}
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedTicket(null);
          }}
          onSave={handleTicketSave}
          onDelete={handleTicketDelete}
        />
      </div>
    </DndProvider>
  );
};

export default KanbanBoardView;