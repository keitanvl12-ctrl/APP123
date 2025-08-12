import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import FilterSidebar from './components/FilterSidebar';
import DashboardToolbar from './components/DashboardToolbar';
import TicketGrid from './components/TicketGrid';
import TicketPreview from './components/TicketPreview';
import ProductivityWidget from './components/ProductivityWidget';

const SupportAgentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterSidebarCollapsed, setFilterSidebarCollapsed] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [previewTicket, setPreviewTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    sla: [],
    assignment: []
  });

  const mockTickets = [
    {
      id: 1001,
      subject: "Problema de autenticação no sistema de email corporativo",
      category: "Email & Comunicação",
      description: "Usuários relatam dificuldades para acessar o sistema de email corporativo após a última atualização. Erro de autenticação SMTP persistente.",
      requester: "Maria Santos",
      requesterAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
      assignee: "Ana Silva",
      assigneeAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
      priority: "high",
      status: "attending",
      slaPercentage: 75,
      timeRemaining: 180,
      createdAt: "07/08/2025 14:30",
      updatedAt: "07/08/2025 18:45"
    },
    {
      id: 1002,
      subject: "Solicitação de acesso ao sistema financeiro",
      category: "Acesso & Permissões",
      description: "Novo funcionário precisa de acesso ao sistema financeiro para executar suas funções no departamento de contabilidade.",
      requester: "João Oliveira",
      requesterAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      assignee: null,
      assigneeAvatar: null,
      priority: "medium",
      status: "todo",
      slaPercentage: 45,
      timeRemaining: 420,
      createdAt: "07/08/2025 13:15",
      updatedAt: "07/08/2025 13:15"
    },
    {
      id: 1003,
      subject: "Falha crítica no servidor de banco de dados",
      category: "Infraestrutura",
      description: "Servidor principal de banco de dados apresentando instabilidade. Múltiplas conexões sendo rejeitadas, impactando sistemas críticos.",
      requester: "Carlos Santos",
      requesterAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
      assignee: "Pedro Lima",
      assigneeAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
      priority: "critical",
      status: "attending",
      slaPercentage: 95,
      timeRemaining: 30,
      createdAt: "07/08/2025 16:20",
      updatedAt: "07/08/2025 18:50"
    },
    {
      id: 1004,
      subject: "Atualização de software antivírus",
      category: "Segurança",
      description: "Solicitação para atualização do software antivírus em todas as estações de trabalho do departamento de RH.",
      requester: "Fernanda Costa",
      requesterAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
      assignee: "Ana Silva",
      assigneeAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
      priority: "low",
      status: "completed",
      slaPercentage: 100,
      timeRemaining: 0,
      createdAt: "06/08/2025 09:00",
      updatedAt: "07/08/2025 11:30"
    },
    {
      id: 1005,
      subject: "Configuração de impressora de rede",
      category: "Hardware",
      description: "Nova impressora multifuncional precisa ser configurada na rede corporativa e disponibilizada para o departamento de marketing.",
      requester: "Roberto Silva",
      requesterAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
      assignee: "Carlos Santos",
      assigneeAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
      priority: "medium",
      status: "paused",
      slaPercentage: 60,
      timeRemaining: 240,
      createdAt: "07/08/2025 10:45",
      updatedAt: "07/08/2025 15:20"
    },
    {
      id: 1006,
      subject: "Backup de dados não executado",
      category: "Backup & Recuperação",
      description: "Sistema de backup automático falhou na execução programada. Necessário verificar logs e executar backup manual.",
      requester: "Lucia Ferreira",
      requesterAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
      assignee: "Pedro Lima",
      assigneeAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
      priority: "high",
      status: "todo",
      slaPercentage: 85,
      timeRemaining: 90,
      createdAt: "07/08/2025 17:00",
      updatedAt: "07/08/2025 17:00"
    },
    {
      id: 1007,
      subject: "Treinamento em nova ferramenta de CRM",
      category: "Treinamento",
      description: "Equipe de vendas solicita treinamento para utilização da nova ferramenta de CRM implementada na empresa.",
      requester: "Amanda Rodrigues",
      requesterAvatar: "https://randomuser.me/api/portraits/women/5.jpg",
      assignee: null,
      assigneeAvatar: null,
      priority: "low",
      status: "todo",
      slaPercentage: 25,
      timeRemaining: 600,
      createdAt: "07/08/2025 08:30",
      updatedAt: "07/08/2025 08:30"
    },
    {
      id: 1008,
      subject: "Lentidão na rede corporativa",
      category: "Rede & Conectividade",
      description: "Usuários relatam lentidão significativa na rede corporativa, especialmente ao acessar recursos compartilhados e internet.",
      requester: "Marcos Pereira",
      requesterAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
      assignee: "Ana Silva",
      assigneeAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
      priority: "medium",
      status: "attending",
      slaPercentage: 70,
      timeRemaining: 150,
      createdAt: "07/08/2025 12:00",
      updatedAt: "07/08/2025 18:30"
    }
  ];

  const handleFilterChange = (section, optionId, checked) => {
    setFilters(prev => ({
      ...prev,
      [section]: checked
        ? [...prev?.[section], optionId]
        : prev?.[section]?.filter(id => id !== optionId)
    }));
  };

  const handleBulkAction = (actionId, ticketIds) => {
    console.log(`Bulk action ${actionId} on tickets:`, ticketIds);
    // Implement bulk action logic here
  };

  const handleTicketPreview = (ticket) => {
    setPreviewTicket(ticket);
  };

  const handleTicketAssign = (ticketId) => {
    console.log(`Assign ticket ${ticketId}`);
    // Implement assignment logic here
  };

  const handleStatusChange = (ticketId, newStatus) => {
    console.log(`Change ticket ${ticketId} status to ${newStatus}`);
    // Implement status change logic here
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
    // Implement refresh logic here
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // Implement export logic here
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e?.target?.tagName === 'INPUT' || e?.target?.tagName === 'TEXTAREA') return;
      
      switch (e?.key?.toLowerCase()) {
        case 'j':
          // Navigate down
          break;
        case 'k':
          // Navigate up
          break;
        case ' ':
          e?.preventDefault();
          // Toggle preview
          break;
        case 'a':
          // Assign ticket
          break;
        case 'r':
          if (e?.ctrlKey || e?.metaKey) {
            e?.preventDefault();
            handleRefresh();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Header */}
      <Header
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Main Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} min-w-0`}>
          <div className="flex h-full">
            {/* Filter Sidebar */}
            <div className={`flex-shrink-0 transition-all duration-300 ${filterSidebarCollapsed ? 'w-16' : 'w-72'}`}>
              <FilterSidebar
                isCollapsed={filterSidebarCollapsed}
                onToggleCollapse={() => setFilterSidebarCollapsed(!filterSidebarCollapsed)}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Toolbar */}
              <div className="flex-shrink-0">
                <DashboardToolbar
                  selectedTickets={selectedTickets}
                  onBulkAction={handleBulkAction}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onRefresh={handleRefresh}
                  onExport={handleExport}
                />
              </div>

              {/* Content Grid */}
              <div className="flex-1 flex min-h-0">
                {/* Ticket Grid */}
                <div className="flex-1 p-4 min-w-0">
                  <TicketGrid
                    tickets={mockTickets}
                    selectedTickets={selectedTickets}
                    onTicketSelect={setSelectedTickets}
                    onTicketPreview={handleTicketPreview}
                    searchQuery={searchQuery}
                  />
                </div>

                {/* Right Panel */}
                <div className="w-80 xl:w-96 flex-shrink-0 border-l border-border flex flex-col">
                  {/* Ticket Preview */}
                  <div className="flex-1 min-h-0">
                    <TicketPreview
                      ticket={previewTicket}
                      onClose={() => setPreviewTicket(null)}
                      onAssign={handleTicketAssign}
                      onStatusChange={handleStatusChange}
                    />
                  </div>

                  {/* Productivity Widget */}
                  <div className="flex-shrink-0 p-4 border-t border-border">
                    <ProductivityWidget />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAgentDashboard;