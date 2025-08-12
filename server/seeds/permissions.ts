import { db } from '../db';
import { systemRoles, systemPermissions, rolePermissions } from '../../shared/schema';

export async function seedPermissions() {
  console.log('🌱 Seeding permissions and roles...');

  // 1. Criar permissões do sistema
  const permissions = [
    // TICKETS
    { code: 'criar_tickets', name: 'Criar Tickets', description: 'Pode criar novos tickets', category: 'tickets' },
    { code: 'ver_proprios_tickets', name: 'Ver Próprios Tickets', description: 'Pode ver seus próprios tickets', category: 'tickets' },
    { code: 'ver_todos_os_tickets', name: 'Ver Todos os Tickets', description: 'Pode ver todos os tickets do sistema', category: 'tickets' },
    { code: 'editar_tickets', name: 'Editar Tickets', description: 'Pode editar tickets', category: 'tickets' },
    { code: 'deletar_tickets', name: 'Deletar Tickets', description: 'Pode deletar tickets', category: 'tickets' },
    { code: 'atribuir_tickets', name: 'Atribuir Tickets', description: 'Pode atribuir tickets para outros usuários', category: 'tickets' },
    
    // USUÁRIOS  
    { code: 'ver_usuarios', name: 'Ver Usuários', description: 'Pode visualizar lista de usuários', category: 'usuarios' },
    { code: 'criar_usuarios', name: 'Criar Usuários', description: 'Pode criar novos usuários', category: 'usuarios' },
    { code: 'editar_usuarios', name: 'Editar Usuários', description: 'Pode editar dados de usuários', category: 'usuarios' },
    { code: 'deletar_usuarios', name: 'Deletar Usuários', description: 'Pode deletar usuários', category: 'usuarios' },
    
    // DEPARTAMENTOS
    { code: 'ver_departamentos', name: 'Ver Departamentos', description: 'Pode visualizar departamentos', category: 'departamentos' },
    { code: 'gerenciar_departamentos', name: 'Gerenciar Departamentos', description: 'Pode criar, editar e deletar departamentos', category: 'departamentos' },
    
    // RELATÓRIOS
    { code: 'ver_relatorios', name: 'Ver Relatórios', description: 'Pode visualizar relatórios básicos', category: 'relatorios' },
    { code: 'relatorios_avancados', name: 'Relatórios Avançados', description: 'Pode visualizar todos os relatórios', category: 'relatorios' },
    
    // SISTEMA
    { code: 'administracao_sistema', name: 'Administração Sistema', description: 'Acesso completo às configurações do sistema', category: 'sistema' },
    { code: 'gerenciar_funcoes', name: 'Gerenciar Funções', description: 'Pode gerenciar funções e permissões', category: 'sistema' },
  ];

  const insertedPermissions = await db.insert(systemPermissions).values(permissions).returning();
  console.log(`✅ Created ${insertedPermissions.length} permissions`);

  // 2. Criar funções do sistema
  const roles = [
    {
      name: 'Administrador',
      description: 'Acesso completo ao sistema com todas as permissões',
      isSystemRole: true,
      userCount: 1
    },
    {
      name: 'Supervisor',
      description: 'Gerencia equipes e tem acesso a relatórios departamentais',
      isSystemRole: true,
      userCount: 1
    },
    {
      name: 'Atendente',
      description: 'Pode responder tickets atribuídos e ver tickets do departamento',
      isSystemRole: true,
      userCount: 2
    },
    {
      name: 'Solicitante',
      description: 'Pode apenas criar tickets e visualizar seus próprios tickets',
      isSystemRole: true,
      userCount: 2
    }
  ];

  const insertedRoles = await db.insert(systemRoles).values(roles).returning();
  console.log(`✅ Created ${insertedRoles.length} roles`);

  // 3. Associar permissões às funções
  const rolePermissionMappings = [
    // ADMINISTRADOR - Todas as permissões
    {
      roleName: 'Administrador',
      permissions: [
        'criar_tickets', 'ver_proprios_tickets', 'ver_todos_os_tickets', 'editar_tickets', 'deletar_tickets', 'atribuir_tickets',
        'ver_usuarios', 'criar_usuarios', 'editar_usuarios', 'deletar_usuarios',
        'ver_departamentos', 'gerenciar_departamentos',
        'ver_relatorios', 'relatorios_avancados',
        'administracao_sistema', 'gerenciar_funcoes'
      ]
    },
    // SUPERVISOR - Gerenciamento de equipe e relatórios
    {
      roleName: 'Supervisor',
      permissions: [
        'criar_tickets', 'ver_proprios_tickets', 'ver_todos_os_tickets', 'editar_tickets', 'atribuir_tickets',
        'ver_usuarios', 'editar_usuarios',
        'ver_departamentos',
        'ver_relatorios', 'relatorios_avancados'
      ]
    },
    // ATENDENTE - Atendimento de tickets
    {
      roleName: 'Atendente',
      permissions: [
        'criar_tickets', 'ver_proprios_tickets', 'editar_tickets',
        'ver_usuarios',
        'ver_departamentos',
        'ver_relatorios'
      ]
    },
    // SOLICITANTE - Apenas criação e visualização própria
    {
      roleName: 'Solicitante',
      permissions: [
        'criar_tickets', 'ver_proprios_tickets'
      ]
    }
  ];

  for (const mapping of rolePermissionMappings) {
    const role = insertedRoles.find(r => r.name === mapping.roleName);
    if (!role) continue;

    for (const permissionCode of mapping.permissions) {
      const permission = insertedPermissions.find(p => p.code === permissionCode);
      if (!permission) continue;

      await db.insert(rolePermissions).values({
        roleId: role.id,
        permissionId: permission.id
      });
    }
  }

  console.log('✅ Assigned permissions to roles');
  console.log('🎉 Permissions and roles seeded successfully!');
}