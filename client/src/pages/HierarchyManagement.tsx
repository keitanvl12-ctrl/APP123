import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Building2,
  UserCheck,
  UserX,
  Crown,
  Star,
  CheckCircle
} from 'lucide-react';

interface HierarchyRole {
  id: string;
  name: string;
  displayName: string;
  level: number;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  requiresMinLevel?: number;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  // Tickets
  { id: 'canViewAllTickets', name: 'Ver Todos os Tickets', description: 'Visualizar tickets de todos os departamentos', category: 'Tickets', requiresMinLevel: 2 },
  { id: 'canViewOwnTickets', name: 'Ver Próprios Tickets', description: 'Visualizar apenas tickets próprios', category: 'Tickets', requiresMinLevel: 1 },
  { id: 'canCreateTickets', name: 'Criar Tickets', description: 'Criar novos tickets no sistema', category: 'Tickets', requiresMinLevel: 1 },
  { id: 'canEditTickets', name: 'Editar Tickets', description: 'Modificar informações de tickets', category: 'Tickets', requiresMinLevel: 2 },
  { id: 'canDeleteTickets', name: 'Excluir Tickets', description: 'Remover tickets do sistema', category: 'Tickets', requiresMinLevel: 3 },
  { id: 'canAssignTickets', name: 'Atribuir Tickets', description: 'Atribuir tickets para outros usuários', category: 'Tickets', requiresMinLevel: 2 },

  // Usuários
  { id: 'canViewUsers', name: 'Ver Usuários', description: 'Visualizar lista de usuários', category: 'Usuários', requiresMinLevel: 2 },
  { id: 'canManageUsers', name: 'Gerenciar Usuários', description: 'Criar, editar e desativar usuários', category: 'Usuários', requiresMinLevel: 2 },
  { id: 'canChangeUserRoles', name: 'Alterar Hierarquias', description: 'Modificar níveis de hierarquia dos usuários', category: 'Usuários', requiresMinLevel: 3 },

  // Departamentos
  { id: 'canViewDepartments', name: 'Ver Departamentos', description: 'Visualizar departamentos do sistema', category: 'Departamentos', requiresMinLevel: 2 },
  { id: 'canManageDepartments', name: 'Gerenciar Departamentos', description: 'Criar, editar e excluir departamentos', category: 'Departamentos', requiresMinLevel: 3 },

  // Relatórios
  { id: 'canViewReports', name: 'Ver Relatórios', description: 'Acessar relatórios e análises', category: 'Relatórios', requiresMinLevel: 2 },
  { id: 'canViewDeptReports', name: 'Relatórios Departamentais', description: 'Ver relatórios do próprio departamento', category: 'Relatórios', requiresMinLevel: 2 },
  { id: 'canViewAllReports', name: 'Todos os Relatórios', description: 'Acessar relatórios de todos os departamentos', category: 'Relatórios', requiresMinLevel: 3 },

  // Configurações
  { id: 'canAccessSettings', name: 'Configurações Gerais', description: 'Acessar configurações do sistema', category: 'Sistema', requiresMinLevel: 3 },
  { id: 'canManagePermissions', name: 'Gerenciar Permissões', description: 'Configurar permissões e hierarquias', category: 'Sistema', requiresMinLevel: 3 },
  { id: 'canConfigureSLA', name: 'Configurar SLA', description: 'Definir regras de SLA', category: 'Sistema', requiresMinLevel: 3 },
  { id: 'canManageCategories', name: 'Gerenciar Categorias', description: 'Criar e editar categorias de tickets', category: 'Sistema', requiresMinLevel: 2 }
];

const DEFAULT_ROLES: HierarchyRole[] = [
  {
    id: 'colaborador',
    name: 'colaborador',
    displayName: 'Colaborador',
    level: 1,
    description: 'Usuário básico que pode criar e visualizar apenas seus próprios tickets',
    permissions: ['canViewOwnTickets', 'canCreateTickets'],
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    icon: 'User'
  },
  {
    id: 'supervisor',
    name: 'supervisor',
    displayName: 'Supervisor',
    level: 2,
    description: 'Gerente departamental com acesso a tickets e usuários do seu departamento',
    permissions: [
      'canViewOwnTickets', 'canCreateTickets', 'canEditTickets', 'canAssignTickets',
      'canViewUsers', 'canManageUsers', 'canViewDepartments', 
      'canViewReports', 'canViewDeptReports', 'canManageCategories'
    ],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    icon: 'UserCheck'
  },
  {
    id: 'administrador',
    name: 'administrador',
    displayName: 'Administrador',
    level: 3,
    description: 'Acesso completo ao sistema com todas as permissões administrativas',
    permissions: DEFAULT_PERMISSIONS.map(p => p.id),
    color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    icon: 'Crown'
  }
];

export default function HierarchyManagement() {
  const [roles, setRoles] = useState<HierarchyRole[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<HierarchyRole | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<HierarchyRole | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar usuários para estatísticas
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    refetchInterval: 30000,
  });

  const handleEditRole = (role: HierarchyRole) => {
    setEditingRole({ ...role });
    setIsEditModalOpen(true);
  };

  const handleSaveRole = () => {
    if (!editingRole) return;

    setRoles(prev => prev.map(role => 
      role.id === editingRole.id ? editingRole : role
    ));

    toast({
      title: "Sucesso",
      description: "Configurações de hierarquia salvas com sucesso",
    });

    setIsEditModalOpen(false);
    setEditingRole(null);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!editingRole) return;

    const hasPermission = editingRole.permissions.includes(permissionId);
    const updatedPermissions = hasPermission
      ? editingRole.permissions.filter(p => p !== permissionId)
      : [...editingRole.permissions, permissionId];

    setEditingRole({
      ...editingRole,
      permissions: updatedPermissions
    });
  };

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <Users className="w-4 h-4" />;
      case 'UserCheck': return <UserCheck className="w-4 h-4" />;
      case 'Crown': return <Crown className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getUserCountByRole = (roleName: string) => {
    return users.filter((user: any) => user.role === roleName).length;
  };

  const getPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    DEFAULT_PERMISSIONS.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-opus-blue-dark">Configuração de Hierarquias</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie níveis de acesso e permissões do sistema
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-opus-blue-dark hover:bg-opus-blue-light"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Hierarquia
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Hierarquias</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="users">Usuários por Hierarquia</TabsTrigger>
        </TabsList>

        {/* Tab: Hierarquias */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.sort((a, b) => a.level - b.level).map((role) => (
              <Card key={role.id} className="border-2 hover:border-opus-blue-light transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${role.color}`}>
                        {getRoleIcon(role.icon)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.displayName}</CardTitle>
                        <p className="text-sm text-gray-500">Nível {role.level}</p>
                      </div>
                    </div>
                    <Badge className={role.color}>
                      {getUserCountByRole(role.name)} usuário(s)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {role.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Permissões ({role.permissions.length}):</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map(permissionId => {
                        const permission = DEFAULT_PERMISSIONS.find(p => p.id === permissionId);
                        return permission ? (
                          <Badge key={permissionId} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRole(role)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Permissões */}
        <TabsContent value="permissions" className="space-y-4">
          {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {permission.description}
                        </p>
                        {permission.requiresMinLevel && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Requer nível {permission.requiresMinLevel}+
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab: Usuários por Hierarquia */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map(role => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getRoleIcon(role.icon)}
                    {role.displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="text-3xl font-bold text-opus-blue-dark">
                      {getUserCountByRole(role.name)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      usuário(s) neste nível
                    </p>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {users
                      .filter((user: any) => user.role === role.name)
                      .slice(0, 5)
                      .map((user: any) => (
                      <div key={user.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="w-6 h-6 bg-opus-blue-dark rounded-full flex items-center justify-center text-white text-xs">
                          {user.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                    {users.filter((user: any) => user.role === role.name).length > 5 && (
                      <p className="text-xs text-center text-gray-500">
                        +{users.filter((user: any) => user.role === role.name).length - 5} mais...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Hierarquia: {editingRole?.displayName}
            </DialogTitle>
          </DialogHeader>

          {editingRole && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    value={editingRole.displayName}
                    onChange={(e) => setEditingRole({
                      ...editingRole,
                      displayName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="level">Nível de Hierarquia</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="5"
                    value={editingRole.level}
                    onChange={(e) => setEditingRole({
                      ...editingRole,
                      level: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({
                    ...editingRole,
                    description: e.target.value
                  })}
                />
              </div>

              <Separator />

              {/* Permissões */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Permissões</h3>
                {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                  <Card key={category} className="mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {permissions.map(permission => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{permission.name}</h4>
                                {permission.requiresMinLevel && (
                                  <Badge variant="outline" className="text-xs">
                                    Nível {permission.requiresMinLevel}+
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {permission.description}
                              </p>
                            </div>
                            <Switch
                              checked={editingRole.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              disabled={permission.requiresMinLevel && permission.requiresMinLevel > editingRole.level}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveRole} className="bg-opus-blue-dark hover:bg-opus-blue-light">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}