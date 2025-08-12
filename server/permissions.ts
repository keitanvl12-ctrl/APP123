// Sistema completo de permissões granulares
export const SYSTEM_PERMISSIONS = [
  // === USUÁRIOS ===
  {
    id: 'users_view',
    code: 'usuarios_visualizar',
    name: 'Visualizar Usuários',
    description: 'Pode ver a lista de usuários do sistema',
    category: 'usuarios',
    subcategory: 'read'
  },
  {
    id: 'users_create',
    code: 'usuarios_criar',
    name: 'Criar Usuários',
    description: 'Pode criar novos usuários no sistema',
    category: 'usuarios',
    subcategory: 'create'
  },
  {
    id: 'users_edit',
    code: 'usuarios_editar',
    name: 'Editar Usuários',
    description: 'Pode editar informações de usuários',
    category: 'usuarios',
    subcategory: 'update'
  },
  {
    id: 'users_delete',
    code: 'usuarios_deletar',
    name: 'Deletar Usuários',
    description: 'Pode remover usuários do sistema',
    category: 'usuarios',
    subcategory: 'delete'
  },
  {
    id: 'users_manage_roles',
    code: 'usuarios_gerenciar_funcoes',
    name: 'Gerenciar Funções de Usuários',
    description: 'Pode alterar funções e permissões de usuários',
    category: 'usuarios',
    subcategory: 'manage'
  },
  {
    id: 'users_manage_departments',
    code: 'usuarios_gerenciar_departamentos',
    name: 'Gerenciar Departamentos de Usuários',
    description: 'Pode alterar departamentos de usuários',
    category: 'usuarios',
    subcategory: 'manage'
  },

  // === TICKETS ===
  {
    id: 'tickets_create',
    code: 'tickets_criar',
    name: 'Criar Tickets',
    description: 'Pode criar novos tickets no sistema',
    category: 'tickets',
    subcategory: 'create'
  },
  {
    id: 'tickets_view_own',
    code: 'tickets_ver_proprios',
    name: 'Ver Próprios Tickets',
    description: 'Pode visualizar apenas tickets criados por si mesmo',
    category: 'tickets',
    subcategory: 'read'
  },
  {
    id: 'tickets_view_department',
    code: 'tickets_ver_departamento',
    name: 'Ver Tickets do Departamento',
    description: 'Pode visualizar tickets do seu departamento',
    category: 'tickets',
    subcategory: 'read'
  },
  {
    id: 'tickets_view_all',
    code: 'tickets_ver_todos',
    name: 'Ver Todos os Tickets',
    description: 'Pode visualizar todos os tickets do sistema',
    category: 'tickets',
    subcategory: 'read'
  },
  {
    id: 'tickets_edit_own',
    code: 'tickets_editar_proprios',
    name: 'Editar Próprios Tickets',
    description: 'Pode editar tickets criados por si mesmo',
    category: 'tickets',
    subcategory: 'update'
  },
  {
    id: 'tickets_edit_department',
    code: 'tickets_editar_departamento',
    name: 'Editar Tickets do Departamento',
    description: 'Pode editar tickets do seu departamento',
    category: 'tickets',
    subcategory: 'update'
  },
  {
    id: 'tickets_edit_all',
    code: 'tickets_editar_todos',
    name: 'Editar Todos os Tickets',
    description: 'Pode editar qualquer ticket do sistema',
    category: 'tickets',
    subcategory: 'update'
  },
  {
    id: 'tickets_delete',
    code: 'tickets_deletar',
    name: 'Deletar Tickets',
    description: 'Pode deletar tickets do sistema',
    category: 'tickets',
    subcategory: 'delete'
  },
  {
    id: 'tickets_assign',
    code: 'tickets_atribuir',
    name: 'Atribuir Tickets',
    description: 'Pode atribuir tickets para outros usuários',
    category: 'tickets',
    subcategory: 'manage'
  },
  {
    id: 'tickets_be_assigned',
    code: 'tickets_ser_responsavel',
    name: 'Ser Responsável por Tickets',
    description: 'Pode ser atribuído como responsável por tickets',
    category: 'tickets',
    subcategory: 'manage'
  },
  {
    id: 'tickets_change_status',
    code: 'tickets_alterar_status',
    name: 'Alterar Status de Tickets',
    description: 'Pode alterar o status de tickets',
    category: 'tickets',
    subcategory: 'manage'
  },
  {
    id: 'tickets_change_priority',
    code: 'tickets_alterar_prioridade',
    name: 'Alterar Prioridade de Tickets',
    description: 'Pode alterar a prioridade de tickets',
    category: 'tickets',
    subcategory: 'manage'
  },
  {
    id: 'tickets_add_comments',
    code: 'tickets_adicionar_comentarios',
    name: 'Adicionar Comentários',
    description: 'Pode adicionar comentários aos tickets',
    category: 'tickets',
    subcategory: 'create'
  },

  // === DEPARTAMENTOS ===
  {
    id: 'departments_view',
    code: 'departamentos_visualizar',
    name: 'Visualizar Departamentos',
    description: 'Pode ver a lista de departamentos',
    category: 'departamentos',
    subcategory: 'read'
  },
  {
    id: 'departments_create',
    code: 'departamentos_criar',
    name: 'Criar Departamentos',
    description: 'Pode criar novos departamentos',
    category: 'departamentos',
    subcategory: 'create'
  },
  {
    id: 'departments_edit',
    code: 'departamentos_editar',
    name: 'Editar Departamentos',
    description: 'Pode editar informações de departamentos',
    category: 'departamentos',
    subcategory: 'update'
  },
  {
    id: 'departments_delete',
    code: 'departamentos_deletar',
    name: 'Deletar Departamentos',
    description: 'Pode remover departamentos do sistema',
    category: 'departamentos',
    subcategory: 'delete'
  },
  {
    id: 'departments_manage',
    code: 'departamentos_gerenciar',
    name: 'Gerenciar Departamentos',
    description: 'Acesso completo ao gerenciamento de departamentos',
    category: 'departamentos',
    subcategory: 'manage'
  },

  // === RELATÓRIOS ===
  {
    id: 'reports_view_basic',
    code: 'relatorios_ver_basicos',
    name: 'Ver Relatórios Básicos',
    description: 'Pode ver relatórios básicos do sistema',
    category: 'relatorios',
    subcategory: 'read'
  },
  {
    id: 'reports_view_department',
    code: 'relatorios_ver_departamento',
    name: 'Ver Relatórios do Departamento',
    description: 'Pode ver relatórios do seu departamento',
    category: 'relatorios',
    subcategory: 'read'
  },
  {
    id: 'reports_view_all',
    code: 'relatorios_ver_todos',
    name: 'Ver Todos os Relatórios',
    description: 'Pode ver todos os relatórios do sistema',
    category: 'relatorios',
    subcategory: 'read'
  },
  {
    id: 'reports_export',
    code: 'relatorios_exportar',
    name: 'Exportar Relatórios',
    description: 'Pode exportar relatórios em PDF/Excel',
    category: 'relatorios',
    subcategory: 'manage'
  },
  {
    id: 'reports_create_custom',
    code: 'relatorios_criar_personalizados',
    name: 'Criar Relatórios Personalizados',
    description: 'Pode criar relatórios customizados',
    category: 'relatorios',
    subcategory: 'create'
  },

  // === SISTEMA/ADMINISTRAÇÃO ===
  {
    id: 'system_access_admin',
    code: 'sistema_acesso_administracao',
    name: 'Acesso à Administração',
    description: 'Pode acessar a área de administração do sistema',
    category: 'sistema',
    subcategory: 'read'
  },
  {
    id: 'system_manage_roles',
    code: 'sistema_gerenciar_funcoes',
    name: 'Gerenciar Funções do Sistema',
    description: 'Pode criar, editar e deletar funções e permissões',
    category: 'sistema',
    subcategory: 'manage'
  },
  {
    id: 'system_manage_config',
    code: 'sistema_gerenciar_configuracoes',
    name: 'Gerenciar Configurações',
    description: 'Pode alterar configurações gerais do sistema',
    category: 'sistema',
    subcategory: 'manage'
  },
  {
    id: 'system_manage_sla',
    code: 'sistema_gerenciar_sla',
    name: 'Gerenciar SLA',
    description: 'Pode configurar e alterar regras de SLA',
    category: 'sistema',
    subcategory: 'manage'
  },
  {
    id: 'system_view_logs',
    code: 'sistema_ver_logs',
    name: 'Visualizar Logs do Sistema',
    description: 'Pode visualizar logs e auditoria do sistema',
    category: 'sistema',
    subcategory: 'read'
  },
  {
    id: 'system_backup_restore',
    code: 'sistema_backup_restaurar',
    name: 'Backup e Restauração',
    description: 'Pode fazer backup e restaurar dados do sistema',
    category: 'sistema',
    subcategory: 'manage'
  }
];

// Definição de funções do sistema com suas permissões
export const SYSTEM_ROLES_PERMISSIONS = {
  'administrador': [
    // Tem TODAS as permissões
    ...SYSTEM_PERMISSIONS.map(p => p.id)
  ],
  'supervisor': [
    // Usuários - pode ver, criar e editar (não deletar)
    'users_view', 'users_create', 'users_edit', 'users_manage_departments',
    // Tickets - acesso completo exceto deletar
    'tickets_create', 'tickets_view_all', 'tickets_edit_all', 'tickets_assign', 
    'tickets_be_assigned', 'tickets_change_status', 'tickets_change_priority', 'tickets_add_comments',
    // Departamentos - pode ver e gerenciar seu departamento
    'departments_view', 'departments_edit',
    // Relatórios - pode ver todos e exportar
    'reports_view_all', 'reports_export', 'reports_create_custom',
    // Sistema - acesso limitado
    'system_access_admin', 'reports_view_department'
  ],
  'atendente': [
    // Usuários - só pode ver
    'users_view',
    // Tickets - pode criar, ver do departamento, editar do departamento, ser responsável
    'tickets_create', 'tickets_view_department', 'tickets_edit_department', 
    'tickets_be_assigned', 'tickets_change_status', 'tickets_add_comments',
    // Departamentos - só pode ver
    'departments_view',
    // Relatórios - só relatórios básicos e do departamento
    'reports_view_basic', 'reports_view_department'
  ],
  'solicitante': [
    // Tickets - só pode criar e ver os próprios
    'tickets_create', 'tickets_view_own', 'tickets_edit_own', 'tickets_add_comments',
    // Relatórios - só relatórios básicos dos próprios tickets
    'reports_view_basic'
  ]
};

// Função para verificar se um usuário tem uma permissão específica
export function hasPermission(userRole: string, permissionCode: string): boolean {
  const rolePermissions = SYSTEM_ROLES_PERMISSIONS[userRole as keyof typeof SYSTEM_ROLES_PERMISSIONS];
  if (!rolePermissions) return false;
  
  return rolePermissions.includes(permissionCode);
}

// Função para obter todas as permissões de uma função
export function getRolePermissions(roleId: string): string[] {
  return SYSTEM_ROLES_PERMISSIONS[roleId as keyof typeof SYSTEM_ROLES_PERMISSIONS] || [];
}

// Função para verificar acesso a tickets baseado no nível de permissão
export function getTicketAccessLevel(userRole: string, userId: string, userDepartmentId?: string) {
  if (hasPermission(userRole, 'tickets_view_all')) {
    return 'all'; // Pode ver todos os tickets
  }
  if (hasPermission(userRole, 'tickets_view_department')) {
    return 'department'; // Pode ver tickets do departamento
  }
  if (hasPermission(userRole, 'tickets_view_own')) {
    return 'own'; // Pode ver apenas próprios tickets
  }
  return 'none'; // Não pode ver tickets
}

// Função para verificar se pode editar um ticket específico
export function canEditTicket(userRole: string, userId: string, ticket: any): boolean {
  // Admin pode editar tudo
  if (hasPermission(userRole, 'tickets_edit_all')) return true;
  
  // Pode editar tickets do departamento
  if (hasPermission(userRole, 'tickets_edit_department') && ticket.creatorDepartmentId === ticket.assignedUserDepartmentId) return true;
  
  // Pode editar próprios tickets
  if (hasPermission(userRole, 'tickets_edit_own') && ticket.createdBy === userId) return true;
  
  return false;
}

export default {
  SYSTEM_PERMISSIONS,
  SYSTEM_ROLES_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  getTicketAccessLevel,
  canEditTicket
};