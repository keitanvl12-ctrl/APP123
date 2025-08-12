import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import UserCard from './components/UserCard';
import UserDetailsPanel from './components/UserDetailsPanel';
import BulkActionsPanel from './components/BulkActionsPanel';
import FilterPanel from './components/FilterPanel';
import UserDataGrid from './components/UserDataGrid';
import ActivityMonitor from './components/ActivityMonitor';

const UserManagementConsole = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'cards'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    role: '',
    activity: '',
    dateFrom: '',
    dateTo: '',
    hasAvatar: false,
    hasSignature: false,
    ldapSync: false
  });

  // Mock data for users
  const mockUsers = [
    {
      id: 1001,
      nome: 'Ana Silva Santos',
      email: 'ana.silva@ticketflow.com.br',
      telefone: '(11) 99999-1234',
      departamento: 'TI',
      funcao: 'Administrador',
      status: 'Ativo',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      dataCriacao: '15/01/2024',
      ultimoAcesso: '07/08/2025 18:30',
      sessaoAtiva: true,
      assinatura: 'assinatura_ana.png',
      permissoes: ['tickets_criar', 'tickets_editar', 'usuarios_criar', 'configuracoes_sistema']
    },
    {
      id: 1002,
      nome: 'Carlos Eduardo Santos',
      email: 'carlos.santos@ticketflow.com.br',
      telefone: '(11) 98888-5678',
      departamento: 'Suporte',
      funcao: 'Supervisor',
      status: 'Ativo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      dataCriacao: '20/02/2024',
      ultimoAcesso: '07/08/2025 17:45',
      sessaoAtiva: true,
      assinatura: '',
      permissoes: ['tickets_criar', 'tickets_editar', 'tickets_atribuir']
    },
    {
      id: 1003,
      nome: 'Maria Oliveira Costa',
      email: 'maria.oliveira@ticketflow.com.br',
      telefone: '(11) 97777-9012',
      departamento: 'Suporte',
      funcao: 'Atendente',
      status: 'Ativo',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      dataCriacao: '10/03/2024',
      ultimoAcesso: '07/08/2025 16:20',
      sessaoAtiva: false,
      assinatura: 'assinatura_maria.png',
      permissoes: ['tickets_criar', 'tickets_editar']
    },
    {
      id: 1004,
      nome: 'João Pedro Almeida',
      email: 'joao.almeida@ticketflow.com.br',
      telefone: '(11) 96666-3456',
      departamento: 'Vendas',
      funcao: 'Usuário',
      status: 'Suspenso',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      dataCriacao: '05/04/2024',
      ultimoAcesso: '05/08/2025 14:30',
      sessaoAtiva: false,
      assinatura: '',
      permissoes: ['tickets_criar']
    },
    {
      id: 1005,
      nome: 'Fernanda Lima Rodrigues',
      email: 'fernanda.lima@ticketflow.com.br',
      telefone: '(11) 95555-7890',
      departamento: 'RH',
      funcao: 'Supervisor',
      status: 'Ativo',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      dataCriacao: '12/05/2024',
      ultimoAcesso: '07/08/2025 18:15',
      sessaoAtiva: true,
      assinatura: 'assinatura_fernanda.png',
      permissoes: ['usuarios_visualizar', 'usuarios_editar', 'relatorios_visualizar']
    },
    {
      id: 1006,
      nome: 'Roberto Silva Mendes',
      email: 'roberto.mendes@ticketflow.com.br',
      telefone: '(11) 94444-2468',
      departamento: 'Financeiro',
      funcao: 'Usuário',
      status: 'Pendente',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      dataCriacao: '01/08/2025',
      ultimoAcesso: 'Nunca acessou',
      sessaoAtiva: false,
      assinatura: '',
      permissoes: []
    }
  ];

  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);

  // Mock saved filter presets
  const [savedPresets] = useState([
    { id: 1, name: 'Usuários Ativos', filters: { status: 'Ativo' } },
    { id: 2, name: 'Equipe de Suporte', filters: { department: 'Suporte' } },
    { id: 3, name: 'Administradores', filters: { role: 'Administrador' } }
  ]);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Apply filters
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(user =>
        user?.nome?.toLowerCase()?.includes(searchTerm) ||
        user?.email?.toLowerCase()?.includes(searchTerm) ||
        user?.id?.toString()?.includes(searchTerm)
      );
    }

    if (filters?.status) {
      filtered = filtered?.filter(user => user?.status === filters?.status);
    }

    if (filters?.department) {
      filtered = filtered?.filter(user => user?.departamento === filters?.department);
    }

    if (filters?.role) {
      filtered = filtered?.filter(user => user?.funcao === filters?.role);
    }

    if (filters?.hasAvatar) {
      filtered = filtered?.filter(user => user?.avatar);
    }

    if (filters?.hasSignature) {
      filtered = filtered?.filter(user => user?.assinatura);
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      
      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }, [users, filters, sortConfig]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleUserSelect = (userId, selected) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers?.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedUsers(filteredUsers?.map(user => user?.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user?.nome}?`)) {
      setUsers(users?.filter(u => u?.id !== user?.id));
      setSelectedUsers(selectedUsers?.filter(id => id !== user?.id));
    }
  };

  const handleToggleUserStatus = (user) => {
    const newStatus = user?.status === 'Ativo' ? 'Suspenso' : 'Ativo';
    setUsers(users?.map(u => 
      u?.id === user?.id ? { ...u, status: newStatus } : u
    ));
  };

  const handleSaveUser = (userData) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users?.map(u => 
        u?.id === selectedUser?.id ? { ...selectedUser, ...userData } : u
      ));
    } else {
      // Create new user
      const newUser = {
        ...userData,
        id: Math.max(...users?.map(u => u?.id)) + 1,
        dataCriacao: new Date()?.toLocaleDateString('pt-BR'),
        ultimoAcesso: 'Nunca acessou',
        sessaoAtiva: false
      };
      setUsers([...users, newUser]);
    }
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handleBulkAction = (action, actionData, userIds) => {
    switch (action) {
      case 'status':
        setUsers(users?.map(u => 
          userIds?.includes(u?.id) ? { ...u, status: actionData?.status } : u
        ));
        break;
      case 'department':
        setUsers(users?.map(u => 
          userIds?.includes(u?.id) ? { ...u, departamento: actionData?.department } : u
        ));
        break;
      case 'role':
        setUsers(users?.map(u => 
          userIds?.includes(u?.id) ? { ...u, funcao: actionData?.role } : u
        ));
        break;
      case 'delete':
        setUsers(users?.filter(u => !userIds?.includes(u?.id)));
        break;
      default:
        console.log(`Bulk action ${action} executed for users:`, userIds);
    }
    setSelectedUsers([]);
  };

  const handleSavePreset = (name, filterData) => {
    console.log('Saving preset:', name, filterData);
  };

  const handleLoadPreset = (preset) => {
    setFilters({ ...filters, ...preset?.filters });
  };

  const sidebarWidth = isSidebarCollapsed ? 'ml-16' : 'ml-60';

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Console de Gerenciamento de Usuários - TicketFlow Pro</title>
        <meta name="description" content="Centro administrativo para gerenciamento completo de usuários, permissões e controle de acesso no TicketFlow Pro" />
      </Helmet>
      <Header 
        onSidebarToggle={handleSidebarToggle}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarCollapse}
      />
      <main className={`pt-16 lg:${sidebarWidth} transition-all duration-300`}>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Console de Gerenciamento de Usuários</h1>
              <p className="text-muted-foreground">
                Gerencie usuários, permissões e monitore atividades do sistema
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                iconSize={16}
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                iconName="Upload"
                iconPosition="left"
                iconSize={16}
              >
                Importar CSV
              </Button>
              <Button
                variant="default"
                iconName="UserPlus"
                iconPosition="left"
                iconSize={16}
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserDetails(true);
                }}
              >
                Novo Usuário
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total de Usuários', value: users?.length, icon: 'Users', color: 'text-primary' },
              { label: 'Usuários Ativos', value: users?.filter(u => u?.status === 'Ativo')?.length, icon: 'UserCheck', color: 'text-success' },
              { label: 'Online Agora', value: users?.filter(u => u?.sessaoAtiva)?.length, icon: 'Wifi', color: 'text-accent' },
              { label: 'Pendentes', value: users?.filter(u => u?.status === 'Pendente')?.length, icon: 'Clock', color: 'text-warning' }
            ]?.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-enterprise">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat?.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
                  </div>
                  <Icon name={stat?.icon} size={24} className={stat?.color} />
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Panel - Filters and User List */}
            <div className="xl:col-span-2 space-y-6">
              {/* Filters */}
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onSavePreset={handleSavePreset}
                savedPresets={savedPresets}
                onLoadPreset={handleLoadPreset}
              />

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    iconName="Grid3X3"
                    iconSize={16}
                    onClick={() => setViewMode('grid')}
                  >
                    Grade
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    iconName="LayoutGrid"
                    iconSize={16}
                    onClick={() => setViewMode('cards')}
                  >
                    Cartões
                  </Button>
                </div>
                
                {selectedUsers?.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Settings"
                    iconPosition="left"
                    iconSize={16}
                    onClick={() => setShowBulkActions(true)}
                  >
                    Ações em Lote ({selectedUsers?.length})
                  </Button>
                )}
              </div>

              {/* User List */}
              {viewMode === 'grid' ? (
                <UserDataGrid
                  users={filteredUsers}
                  selectedUsers={selectedUsers}
                  onUserSelect={handleUserSelect}
                  onSelectAll={handleSelectAll}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onToggleStatus={handleToggleUserStatus}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Usuários ({filteredUsers?.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUsers?.map((user) => (
                      <UserCard
                        key={user?.id}
                        user={user}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        onToggleStatus={handleToggleUserStatus}
                        isSelected={selectedUsers?.includes(user?.id)}
                        onSelect={handleUserSelect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Activity Monitor */}
            <div className="space-y-6">
              <ActivityMonitor />
            </div>
          </div>
        </div>
      </main>
      {/* User Details Panel */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-full max-h-[90vh]">
            <UserDetailsPanel
              user={selectedUser}
              onSave={handleSaveUser}
              onClose={() => {
                setShowUserDetails(false);
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      )}
      {/* Bulk Actions Panel */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <BulkActionsPanel
              selectedUsers={selectedUsers}
              onBulkAction={handleBulkAction}
              onClose={() => setShowBulkActions(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementConsole;