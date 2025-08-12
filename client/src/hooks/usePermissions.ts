import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import React from 'react';

// Interface para permissões
interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
}

// Mapeamento de roles do sistema para compatibilidade
const ROLE_MAPPING = {
  'admin': 'administrador',
  'supervisor': 'supervisor', 
  'atendente': 'atendente',
  'solicitante': 'solicitante'
};

// Definição completa das permissões por função (deve coincidir com o backend)
const SYSTEM_ROLES_PERMISSIONS = {
  'administrador': [
    // TODAS as permissões - acesso completo
    'users_view', 'users_create', 'users_edit', 'users_delete', 'users_manage_roles', 'users_manage_departments',
    'tickets_create', 'tickets_view_own', 'tickets_view_department', 'tickets_view_all', 
    'tickets_edit_own', 'tickets_edit_department', 'tickets_edit_all', 'tickets_delete',
    'tickets_assign', 'tickets_be_assigned', 'tickets_change_status', 'tickets_change_priority', 'tickets_add_comments',
    'departments_view', 'departments_create', 'departments_edit', 'departments_delete', 'departments_manage',
    'reports_view_basic', 'reports_view_department', 'reports_view_all', 'reports_export', 'reports_create_custom',
    'system_access_admin', 'system_manage_roles', 'system_manage_config', 'system_manage_sla', 
    'system_view_logs', 'system_backup_restore'
  ],
  'supervisor': [
    // Gestão de usuários limitada
    'users_view', 'users_create', 'users_edit', 'users_manage_departments',
    // Acesso amplo a tickets
    'tickets_create', 'tickets_view_all', 'tickets_edit_all', 'tickets_assign', 
    'tickets_be_assigned', 'tickets_change_status', 'tickets_change_priority', 'tickets_add_comments',
    // Departamentos - limitado
    'departments_view', 'departments_edit',
    // Relatórios avançados
    'reports_view_all', 'reports_export', 'reports_create_custom',
    // Acesso administrativo limitado
    'system_access_admin'
  ],
  'atendente': [
    // Usuários - só visualizar
    'users_view',
    // Tickets do departamento
    'tickets_create', 'tickets_view_department', 'tickets_edit_department', 
    'tickets_be_assigned', 'tickets_change_status', 'tickets_add_comments',
    // Departamentos - só visualizar
    'departments_view',
    // Relatórios básicos
    'reports_view_basic', 'reports_view_department'
  ],
  'solicitante': [
    // Apenas tickets próprios
    'tickets_create', 'tickets_view_own', 'tickets_edit_own', 'tickets_add_comments',
    // Relatórios básicos próprios
    'reports_view_basic'
  ]
};

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  // Buscar todas as permissões disponíveis do sistema
  const { data: allPermissions = [] } = useQuery<Permission[]>({
    queryKey: ['/api/permissions'],
    enabled: isAuthenticated,
  });

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permissionCode: string): boolean => {
    if (!user || !isAuthenticated) return false;
    
    // Mapear role do usuário para role do sistema
    const systemRole = ROLE_MAPPING[user.role as keyof typeof ROLE_MAPPING];
    if (!systemRole) return false;

    // Verificar se a role tem a permissão
    const rolePermissions = SYSTEM_ROLES_PERMISSIONS[systemRole as keyof typeof SYSTEM_ROLES_PERMISSIONS];
    return rolePermissions?.includes(permissionCode) || false;
  };

  // Verificar múltiplas permissões (OR - pelo menos uma)
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => hasPermission(code));
  };

  // Verificar múltiplas permissões (AND - todas)
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => hasPermission(code));
  };

  // Obter nível de acesso a tickets
  const getTicketAccessLevel = (): 'none' | 'own' | 'department' | 'all' => {
    if (hasPermission('tickets_view_all')) return 'all';
    if (hasPermission('tickets_view_department')) return 'department';
    if (hasPermission('tickets_view_own')) return 'own';
    return 'none';
  };

  // Verificar se pode editar um ticket específico
  const canEditTicket = (ticket: any): boolean => {
    if (!user || !ticket) return false;
    
    // Admin pode editar tudo
    if (hasPermission('tickets_edit_all')) return true;
    
    // Pode editar tickets do departamento
    if (hasPermission('tickets_edit_department') && 
        ticket.requesterDepartmentId === user.departmentId) return true;
    
    // Pode editar próprios tickets
    if (hasPermission('tickets_edit_own') && ticket.createdBy === user.id) return true;
    
    return false;
  };

  // Verificar se pode deletar tickets
  const canDeleteTicket = (): boolean => {
    return hasPermission('tickets_delete');
  };

  // Verificar se pode acessar administração
  const canAccessAdmin = (): boolean => {
    return hasPermission('system_access_admin');
  };

  // Verificar se pode gerenciar usuários
  const canManageUsers = (): boolean => {
    return hasAnyPermission(['users_create', 'users_edit', 'users_delete']);
  };

  // Verificar se pode gerenciar funções
  const canManageRoles = (): boolean => {
    return hasPermission('system_manage_roles');
  };

  // Verificar se pode gerenciar SLA
  const canManageSLA = (): boolean => {
    return hasPermission('system_manage_sla');
  };

  // Obter todas as permissões do usuário atual
  const getUserPermissions = (): string[] => {
    if (!user || !isAuthenticated) return [];
    
    const systemRole = ROLE_MAPPING[user.role as keyof typeof ROLE_MAPPING];
    if (!systemRole) return [];

    return SYSTEM_ROLES_PERMISSIONS[systemRole as keyof typeof SYSTEM_ROLES_PERMISSIONS] || [];
  };

  return {
    // Dados
    allPermissions,
    userPermissions: getUserPermissions(),
    
    // Verificações gerais
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Verificações específicas de funcionalidades
    getTicketAccessLevel,
    canEditTicket,
    canDeleteTicket,
    canAccessAdmin,
    canManageUsers,
    canManageRoles,
    canManageSLA,
    
    // Estado do usuário
    isAuthenticated,
    user,
  };
}

// Hook para verificação rápida de permissão única
export function useHasPermission(permissionCode: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permissionCode);
}

// Componente wrapper para controle de acesso
interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // true = AND, false = OR (default)
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  fallback = null, 
  children 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  
  return hasAccess ? children : fallback;
}