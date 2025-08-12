import { useState } from 'react';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PermissionGate } from '@/hooks/usePermissions';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit2, Users, Settings } from 'lucide-react';

interface SystemRole {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  userCount: number;
  permissions?: SystemPermission[];
}

interface SystemPermission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
}

export default function RoleManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar funções do sistema
  const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useQuery({
    queryKey: ['/api/roles'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Buscar todas as permissões disponíveis
  const { data: allPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions'],
    refetchOnMount: true,
  });

  // Debug: Log data
  console.log('=== DEBUG ROLES DATA ===');
  console.log('Roles data received:', roles);
  console.log('Roles length:', roles.length);
  console.log('Is array?', Array.isArray(roles));
  console.log('Permissions data received:', allPermissions);
  
  // Force refetch when needed
  React.useEffect(() => {
    console.log('RoleManagement component mounted, refetching...');
    refetchRoles();
  }, []);

  // Mutation para criar função
  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; permissions: string[] }) =>
      apiRequest('/api/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Função criada com sucesso',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar função',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar função
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description?: string; permissions: string[] }) =>
      apiRequest(`/api/permissions/roles/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setEditingRole(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Função atualizada com sucesso',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar função',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
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
      description: roleDescription || undefined,
      permissions: selectedPermissions,
    });
  };

  const handleUpdateRole = () => {
    if (!editingRole || !roleName.trim()) return;

    updateRoleMutation.mutate({
      id: editingRole.id,
      name: roleName,
      description: roleDescription || undefined,
      permissions: selectedPermissions,
    });
  };

  const startEdit = async (role: SystemRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    
    // Buscar permissões da função
    try {
      const roleDetails = await apiRequest(`/api/permissions/roles/${role.id}`);
      setSelectedPermissions(roleDetails.permissions?.map((p: SystemPermission) => p.code) || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes da função:', error);
    }
  };

  const handlePermissionChange = (permissionCode: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionCode]);
    } else {
      setSelectedPermissions(prev => prev.filter(code => code !== permissionCode));
    }
  };

  // Agrupar permissões por categoria
  const permissionsByCategory = allPermissions.reduce((acc: Record<string, SystemPermission[]>, permission: SystemPermission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  const categoryNames: Record<string, string> = {
    tickets: 'Tickets',
    usuarios: 'Usuários',
    departamentos: 'Departamentos',
    relatorios: 'Relatórios',
    sistema: 'Sistema',
  };

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate permissions={['gerenciar_funcoes', 'administracao_sistema']}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Configuração de Funções</h1>
            <p className="text-gray-600 mt-2">Gerencie funções e permissões do sistema de usuários</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Função
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Função</DialogTitle>
                <DialogDescription>
                  Defina o nome, descrição e permissões para a nova função.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Função</Label>
                  <Input
                    id="name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Ex: Gerente de TI"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Descreva as responsabilidades desta função..."
                  />
                </div>
                
                <div>
                  <Label>Permissões</Label>
                  <div className="space-y-4 mt-2 max-h-60 overflow-y-auto">
                    {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                      <div key={category} className="border rounded p-3">
                        <h4 className="font-semibold mb-2">{categoryNames[category] || category}</h4>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <div key={permission.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.code}
                                checked={selectedPermissions.includes(permission.code)}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(permission.code, checked as boolean)
                                }
                              />
                              <Label htmlFor={permission.code} className="text-sm">
                                {permission.name}
                                {permission.description && (
                                  <span className="text-gray-500 block text-xs">
                                    {permission.description}
                                  </span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role: any) => {
            // Get role color classes
            const getRoleColor = (roleId: string) => {
              switch (roleId) {
                case 'administrador': return 'border-purple-200 bg-purple-50';
                case 'supervisor': return 'border-blue-200 bg-blue-50';
                case 'atendente': return 'border-yellow-200 bg-yellow-50';
                case 'solicitante': return 'border-green-200 bg-green-50';
                default: return 'border-gray-200 bg-gray-50';
              }
            };

            const getBadgeColor = (roleId: string) => {
              switch (roleId) {
                case 'administrador': return 'bg-purple-100 text-purple-800';
                case 'supervisor': return 'bg-blue-100 text-blue-800';
                case 'atendente': return 'bg-yellow-100 text-yellow-800';
                case 'solicitante': return 'bg-green-100 text-green-800';
                default: return 'bg-gray-100 text-gray-800';
              }
            };

            console.log('Rendering role:', role);
            return (
              <Card key={role.id} className={`relative ${getRoleColor(role.id)}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getBadgeColor(role.id)} opacity-80`}></div>
                        {role.name}
                        <Badge variant="secondary" className={`ml-2 ${getBadgeColor(role.id)}`}>
                          {role.userCount} usuário(s)
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {role.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                    
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(role)}
                        className="ml-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Settings className="h-4 w-4" />
                      Permissões: {role.permissions}
                    </div>
                    
                    {/* Exibir algumas permissões principais baseadas no role */}
                    <div className="space-y-1">
                      {role.id === 'administrador' && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Próprios Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Todos os Tickets</Badge>
                          <Badge variant="outline" className="text-xs">+13 mais</Badge>
                        </div>
                      )}
                      
                      {role.id === 'supervisor' && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Todos os Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Editar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">+6 mais</Badge>
                        </div>
                      )}

                      {role.id === 'atendente' && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Tickets do Departamento</Badge>
                          <Badge variant="outline" className="text-xs">Editar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">+3 mais</Badge>
                        </div>
                      )}

                      {role.id === 'solicitante' && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Criar Tickets</Badge>
                          <Badge variant="outline" className="text-xs">Ver Próprios Tickets</Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Função do Sistema
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Dialog de Edição */}
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Função: {editingRole?.name}</DialogTitle>
              <DialogDescription>
                Modifique o nome, descrição e permissões da função.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              
              <div>
                <Label>Permissões</Label>
                <div className="space-y-4 mt-2 max-h-60 overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <div key={category} className="border rounded p-3">
                      <h4 className="font-semibold mb-2">{categoryNames[category] || category}</h4>
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div key={permission.code} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${permission.code}`}
                              checked={selectedPermissions.includes(permission.code)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(permission.code, checked as boolean)
                              }
                            />
                            <Label htmlFor={`edit-${permission.code}`} className="text-sm">
                              {permission.name}
                              {permission.description && (
                                <span className="text-gray-500 block text-xs">
                                  {permission.description}
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingRole(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  );
}