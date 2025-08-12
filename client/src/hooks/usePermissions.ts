import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
}

export interface UserPermissions {
  permissions: Permission[];
  role: string;
  departmentId?: string;
}

// Hook principal para verificar permissões
export function usePermissions() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: userPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions/user', user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  const isLoading = authLoading || permissionsLoading;

  // Verificar se usuário tem uma permissão específica
  const hasPermission = (permissionCode: string): boolean => {
    if (!userPermissions?.permissions) return false;
    return userPermissions.permissions.some((p: Permission) => p.code === permissionCode);
  };

  // Verificar múltiplas permissões (qualquer uma)
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => hasPermission(code));
  };

  // Verificar múltiplas permissões (todas)
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => hasPermission(code));
  };

  // Verificar se pode ver um ticket específico
  const canViewTicket = (ticket: any): boolean => {
    if (!ticket || !user) return false;

    // Administradores e supervisores veem tudo
    if (hasPermission('ver_todos_os_tickets')) {
      return true;
    }

    // Solicitantes só veem próprios tickets
    if (hasPermission('ver_proprios_tickets') && !hasPermission('ver_todos_os_tickets')) {
      return ticket.createdBy === user.id;
    }

    return false;
  };

  // Filtrar tickets baseado nas permissões
  const getFilteredTickets = (tickets: any[]): any[] => {
    if (!tickets || !Array.isArray(tickets)) return [];
    
    // Se pode ver todos os tickets, retorna todos
    if (hasPermission('ver_todos_os_tickets')) {
      return tickets;
    }

    // Se só pode ver próprios tickets
    if (hasPermission('ver_proprios_tickets')) {
      return tickets.filter(ticket => canViewTicket(ticket));
    }

    return [];
  };

  return {
    permissions: userPermissions?.permissions || [],
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canViewTicket,
    getFilteredTickets,
    userRole: userPermissions?.role,
    userDepartment: userPermissions?.departmentId,
  };
}

// Hook auxiliar para verificação de permissões com loading
export function usePermissionGuard(permissions: string[], mode: 'any' | 'all' = 'any') {
  const { hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
  
  const hasAccess = mode === 'any' 
    ? hasAnyPermission(permissions)
    : hasAllPermissions(permissions);

  return { hasAccess, isLoading };
}

// Componente de proteção para renderização condicional
export function PermissionGate({ 
  permissions, 
  mode = 'any', 
  fallback = null, 
  children 
}: {
  permissions: string[];
  mode?: 'any' | 'all';
  fallback?: any;
  children: any;
}) {
  const { hasAccess, isLoading } = usePermissionGuard(permissions, mode);
  
  if (isLoading) {
    return null;
  }
  
  if (!hasAccess) {
    return fallback;
  }
  
  return children;
}