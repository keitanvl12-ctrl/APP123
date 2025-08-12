import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Settings, Users, Plus, Edit2, Trash2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: number;
  isSystem: boolean;
  userCount: number;
}

export default function RoleManagementSimple() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar funções do sistema - versão simples sem cache
  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['/api/roles'],
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  // Buscar permissões disponíveis
  const { data: allPermissions = [] } = useQuery({
    queryKey: ['/api/permissions'],
    staleTime: 0,
    cacheTime: 0,
  });

  console.log('=== SIMPLE ROLE MANAGEMENT ===');
  console.log('Roles:', roles);
  console.log('Permissions:', allPermissions);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  // Mutations para CRUD de roles
  const createRoleMutation = useMutation({
    mutationFn: async (newRole: { name: string; description: string; permissions: string[] }) => {
      return apiRequest('/api/permissions/roles', {
        method: 'POST',
        body: JSON.stringify(newRole),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Função criada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar função',
        variant: 'destructive',
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, ...updates }: { roleId: string; name: string; description: string; permissions: string[] }) => {
      return apiRequest(`/api/permissions/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setEditingRole(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Função atualizada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar função',
        variant: 'destructive',
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/permissions/roles/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: 'Sucesso',
        description: 'Função excluída com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir função',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    
    // Load existing permissions for the role
    if (role.isSystem) {
      // For system roles, load default permissions based on role type
      const systemPermissions = getSystemRolePermissions(role.id);
      setSelectedPermissions(systemPermissions);
    } else {
      // For custom roles, load from API or keep empty for demo
      setSelectedPermissions([]);
    }
  };

  const getSystemRolePermissions = (roleId: string): string[] => {
    switch (roleId) {
      case 'administrador':
        return [
          'users_view', 'users_create', 'users_edit', 'users_delete', 'users_manage_roles', 'users_manage_departments',
          'tickets_create', 'tickets_view_all', 'tickets_edit_all', 'tickets_delete', 'tickets_assign', 
          'tickets_be_assigned', 'tickets_change_status', 'tickets_change_priority', 'tickets_add_comments',
          'departments_view', 'departments_create', 'departments_edit', 'departments_delete', 'departments_manage',
          'reports_view_all', 'reports_export', 'reports_create_custom',
          'system_access_admin', 'system_manage_roles', 'system_manage_config', 'system_manage_sla'
        ];
      case 'supervisor':
        return [
          'users_view', 'users_create', 'users_edit', 'users_manage_departments',
          'tickets_create', 'tickets_view_all', 'tickets_edit_all', 'tickets_assign', 
          'tickets_be_assigned', 'tickets_change_status', 'tickets_change_priority', 'tickets_add_comments',
          'departments_view', 'departments_edit',
          'reports_view_all', 'reports_export', 'reports_create_custom',
          'system_access_admin'
        ];
      case 'atendente':
        return [
          'users_view',
          'tickets_create', 'tickets_view_department', 'tickets_edit_department', 
          'tickets_be_assigned', 'tickets_change_status', 'tickets_add_comments',
          'departments_view',
          'reports_view_basic', 'reports_view_department'
        ];
      case 'solicitante':
        return [
          'tickets_create', 'tickets_view_own', 'tickets_edit_own', 'tickets_add_comments',
          'reports_view_basic'
        ];
      default:
        return [];
    }
  };

  const handleCreateRole = () => {
    if (!roleName.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da função é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    createRoleMutation.mutate({
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions,
    });
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    updateRoleMutation.mutate({
      roleId: editingRole.id,
      name: editingRole.isSystem ? editingRole.name : roleName,
      description: editingRole.isSystem ? editingRole.description : roleDescription,
      permissions: selectedPermissions,
    });
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir funções do sistema',
        variant: 'destructive',
      });
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a função "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'administrador': return 'border-purple-300 bg-purple-50';
      case 'supervisor': return 'border-blue-300 bg-blue-50';
      case 'atendente': return 'border-yellow-300 bg-yellow-50';
      case 'solicitante': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getBadgeColor = (roleId: string) => {
    switch (roleId) {
      case 'administrador': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'supervisor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'atendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'solicitante': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Configuração de Funções</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Configuração de Funções</h1>
        <div className="text-red-500">
          Erro ao carregar funções: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Funções</h1>
          <p className="text-gray-600 mt-2">Gerencie funções e permissões do sistema de usuários</p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Função
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roles.map((role: Role) => {
          console.log('Rendering role:', role);
          return (
            <Card key={role.id} className={`relative border-2 ${getRoleColor(role.id)}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded-full ${getBadgeColor(role.id)} border-2`}></div>
                      {role.name}
                    </CardTitle>
                    
                    <Badge 
                      variant="secondary" 
                      className={`mb-2 ${getBadgeColor(role.id)} font-semibold`}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {role.userCount} usuário(s)
                    </Badge>
                    
                    <CardDescription className="text-sm">
                      {role.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(role)}
                      title={role.isSystem ? "Editar permissões" : "Editar função"}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-500 hover:text-red-700"
                        title="Excluir função"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Settings className="h-4 w-4" />
                    Permissões: {role.permissions}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      Principais permissões:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.id === 'administrador' && (
                        <>
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Todos Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Gerenciar Usuários</Badge>
                          <Badge variant="outline" className="text-xs">+13 mais</Badge>
                        </>
                      )}
                      {role.id === 'supervisor' && (
                        <>
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Todos Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Editar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">+6 mais</Badge>
                        </>
                      )}
                      {role.id === 'atendente' && (
                        <>
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Tickets Dept.</Badge>
                          <Badge variant="outline" className="text-xs">Editar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">+3 mais</Badge>
                        </>
                      )}
                      {role.id === 'solicitante' && (
                        <>
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Próprios</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
                    Função do Sistema
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Show message if no roles */}
      {roles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Nenhuma função encontrada</div>
          <div className="text-gray-400 text-sm mt-2">
            Verificando dados do backend...
          </div>
        </div>
      )}

      {/* Modal de Criação de Função */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Função</DialogTitle>
            <DialogDescription>
              Crie uma nova função do sistema com permissões específicas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Nome da Função</Label>
              <Input
                id="create-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ex: Gerente de TI"
              />
            </div>
            <div>
              <Label htmlFor="create-description">Descrição</Label>
              <Textarea
                id="create-description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Descreva as responsabilidades desta função..."
              />
            </div>
            
            <div>
              <Label>Permissões</Label>
              <div className="mt-2 max-h-80 overflow-y-auto border rounded p-4">
                {['usuarios', 'tickets', 'departamentos', 'relatorios', 'sistema'].map(category => {
                  const categoryPermissions = allPermissions.filter((p: any) => p.category === category);
                  if (categoryPermissions.length === 0) return null;
                  
                  const categoryNames = {
                    usuarios: 'Usuários',
                    tickets: 'Tickets',
                    departamentos: 'Departamentos', 
                    relatorios: 'Relatórios',
                    sistema: 'Sistema'
                  };
                  
                  return (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2 border-b pb-1">
                        {categoryNames[category as keyof typeof categoryNames]}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission: any) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label htmlFor={`perm-${permission.id}`} className="text-xs leading-tight">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateRole}
                disabled={createRoleMutation.isPending}
              >
                {createRoleMutation.isPending ? 'Criando...' : 'Criar Função'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Função */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole?.isSystem ? 'Configurar Permissões' : 'Editar Função'}: {editingRole?.name}
            </DialogTitle>
            <DialogDescription>
              {editingRole?.isSystem 
                ? 'Configure as permissões desta função do sistema.'
                : 'Modifique o nome, descrição e permissões da função.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingRole?.isSystem && (
              <>
                <div>
                  <Label htmlFor="edit-name">Nome da Função</Label>
                  <Input
                    id="edit-name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Ex: Gerente de TI"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Descreva as responsabilidades desta função..."
                  />
                </div>
              </>
            )}
            
            {editingRole?.isSystem && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800 font-medium mb-1">
                  Função do Sistema: {editingRole.name}
                </div>
                <div className="text-xs text-blue-600">
                  {editingRole.description}
                </div>
              </div>
            )}
            
            <div>
              <Label>Permissões</Label>
              <div className="mt-2 max-h-80 overflow-y-auto border rounded p-4">
                {['usuarios', 'tickets', 'departamentos', 'relatorios', 'sistema'].map(category => {
                  const categoryPermissions = allPermissions.filter((p: any) => p.category === category);
                  if (categoryPermissions.length === 0) return null;
                  
                  const categoryNames = {
                    usuarios: 'Usuários',
                    tickets: 'Tickets',
                    departamentos: 'Departamentos', 
                    relatorios: 'Relatórios',
                    sistema: 'Sistema'
                  };
                  
                  return (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2 border-b pb-1">
                        {categoryNames[category as keyof typeof categoryNames]}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission: any) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-perm-${permission.id}`}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label htmlFor={`edit-perm-${permission.id}`} className="text-xs leading-tight">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingRole(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? 'Salvando...' : 
                 editingRole?.isSystem ? 'Salvar Permissões' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}