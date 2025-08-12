import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

// Definir hierarquia de roles
const ROLE_HIERARCHY = {
  solicitante: 0,
  atendente: 1,
  supervisor: 2,
  administrador: 3
} as const;

// Definir permissões por role
const ROLE_PERMISSIONS = {
  solicitante: {
    canManageUsers: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: false, // Só vê seus próprios tickets
    canManageTickets: false, // Só pode criar, não gerenciar
    canViewReports: false,
    canManageSystem: false,
    canManageCategories: false,
    canManageDepartments: false,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: false,
    canRespondTickets: false,
  },
  atendente: {
    canManageUsers: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: true, // Pode ver tickets do departamento
    canManageTickets: false,
    canViewReports: false,
    canManageSystem: false,
    canManageCategories: false,
    canManageDepartments: false,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: false,
    canRespondTickets: true, // Pode responder tickets atribuídos
  },
  supervisor: {
    canManageUsers: true, // Só do seu departamento
    canViewAllTickets: false,
    canViewDepartmentTickets: true, // Todos do departamento
    canManageTickets: true, // Atender/resolver tickets
    canViewReports: true, // Relatórios do departamento
    canManageSystem: false,
    canManageCategories: true, // Só do departamento
    canManageDepartments: false,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: true,
    canRespondTickets: true,
  },
  administrador: {
    canManageUsers: true, // Todos os usuários
    canViewAllTickets: true, // Todos os tickets
    canViewDepartmentTickets: true,
    canManageTickets: true,
    canViewReports: true, // Todos os relatórios
    canManageSystem: true, // Configurações do sistema
    canManageCategories: true,
    canManageDepartments: true,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: true,
    canRespondTickets: true,
  }
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;
export type PermissionKey = keyof typeof ROLE_PERMISSIONS.solicitante;

export interface UserPermissions {
  // Verificar se usuário tem permissão específica
  hasPermission: (permission: PermissionKey) => boolean;
  
  // Verificar hierarquia - se role atual é igual ou superior ao mínimo requerido
  hasRoleLevel: (minRole: UserRole) => boolean;
  
  // Verificar se pode gerenciar outro usuário (mesmo departamento + hierarquia)
  canManageUser: (targetUser: User) => boolean;
  
  // Verificar se pode ver tickets de outro usuário
  canViewUserTickets: (targetUser: User) => boolean;
  
  // Informações do usuário atual
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
}

export function usePermissions(): UserPermissions {
  // Simulação temporária - em produção seria da API de auth
  const { data: user, isLoading } = useQuery<User>({ 
    queryKey: ['/api/auth/user'], 
    retry: false,
    queryFn: () => {
      // Dados simulados - em produção virá da API real
      return Promise.resolve({
        id: 'user-admin-1',
        username: 'admin',
        password: '',
        name: 'Administrador Sistema',
        email: 'admin@opus.com.br',
        role: 'administrador', // Altere para testar: colaborador, supervisor, administrador
        departmentId: 'dept-ti-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User);
    }
  });
  
  const userRole: UserRole = (user?.role as UserRole) || 'solicitante';
  
  const hasPermission = (permission: PermissionKey): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[userRole][permission];
  };
  
  const hasRoleLevel = (minRole: UserRole): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
  };
  
  const canManageUser = (targetUser: User): boolean => {
    if (!user) return false;
    
    // Administrador pode gerenciar todos
    if (userRole === 'administrador') return true;
    
    // Supervisor pode gerenciar usuários do mesmo departamento que não sejam administradores
    if (userRole === 'supervisor' && user.departmentId === targetUser.departmentId) {
      return targetUser.role !== 'administrador';
    }
    
    // Atendente não pode gerenciar usuários
    if (userRole === 'atendente') return false;
    
    return false;
  };
  
  const canViewUserTickets = (targetUser: User): boolean => {
    if (!user) return false;
    
    // Usuário sempre pode ver seus próprios tickets
    if (user.id === targetUser.id) return true;
    
    // Administrador vê todos
    if (userRole === 'administrador') return true;
    
    // Supervisor vê todos do departamento
    if (userRole === 'supervisor' && user.departmentId === targetUser.departmentId) {
      return true;
    }
    
    return false;
  };
  
  return {
    hasPermission,
    hasRoleLevel,
    canManageUser,
    canViewUserTickets,
    user,
    userRole,
    isLoading
  };
}