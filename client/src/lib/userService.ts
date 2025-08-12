// Serviço para gerenciar informações do usuário atual
// Em um sistema real, isso viria de um contexto de autenticação

interface User {
  id: string;
  name: string;
  email: string;
  role: 'colaborador' | 'supervisor' | 'administrador';
  department: string;
  avatar?: string;
}

// Usuário simulado - em produção isso viria do contexto de autenticação
const mockUser: User = {
  id: '8cd6d843-31a9-48f1-a99c-a6789e592a9f',
  name: 'João Silva',
  email: 'joao.silva@empresa.com',
  role: 'administrador', // Para demonstração, vamos usar administrador
  department: 'Tecnologia da Informação',
  avatar: null
};

export function getCurrentUser(): User {
  // Try to get user from localStorage first (for demo login)
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return {
        id: parsed.id || mockUser.id,
        name: parsed.name || mockUser.name,
        email: parsed.email || mockUser.email,
        role: parsed.role || mockUser.role,
        department: parsed.department?.name || mockUser.department,
        avatar: parsed.avatar || mockUser.avatar
      };
    } catch {
      // Fall back to mock user if parsing fails
    }
  }

  // Default fallback user
  return mockUser;
}

export function isAdmin(): boolean {
  return getCurrentUser().role === 'administrador';
}

export function isSupervisor(): boolean {
  const role = getCurrentUser().role;
  return role === 'supervisor' || role === 'administrador';
}

export function hasPermission(permission: string): boolean {
  const user = getCurrentUser();
  
  // Administradores têm todas as permissões
  if (user.role === 'administrador') {
    return true;
  }
  
  // Supervisores têm permissões limitadas
  if (user.role === 'supervisor') {
    const supervisorPermissions = [
      'canViewOwnTickets', 
      'canCreateTickets', 
      'canEditTickets', 
      'canAssignTickets',
      'canViewUsers', 
      'canManageUsers', 
      'canViewDepartments', 
      'canViewReports', 
      'canViewDeptReports', 
      'canManageCategories'
    ];
    return supervisorPermissions.includes(permission);
  }
  
  // Colaboradores têm permissões básicas
  if (user.role === 'colaborador') {
    const colaboradorPermissions = ['canViewOwnTickets', 'canCreateTickets'];
    return colaboradorPermissions.includes(permission);
  }
  
  return false;
}