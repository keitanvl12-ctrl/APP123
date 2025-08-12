import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Shield, Eye, Settings, Users, Building2, FileText, BarChart3, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AdminOnly } from "@/components/PermissionGuard";
import { apiRequest } from "@/lib/queryClient";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  userCount?: number;
  isSystem?: boolean; // Roles do sistema não podem ser deletadas
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Tickets
  { id: 'tickets.create', name: 'Criar Tickets', description: 'Pode criar novos tickets', category: 'Tickets', icon: Plus },
  { id: 'tickets.view_own', name: 'Ver Próprios Tickets', description: 'Pode ver seus próprios tickets', category: 'Tickets', icon: Eye },
  { id: 'tickets.view_all', name: 'Ver Todos os Tickets', description: 'Pode ver todos os tickets do sistema', category: 'Tickets', icon: FileText },
  { id: 'tickets.edit', name: 'Editar Tickets', description: 'Pode editar tickets', category: 'Tickets', icon: Edit },
  { id: 'tickets.delete', name: 'Deletar Tickets', description: 'Pode deletar tickets', category: 'Tickets', icon: Trash2 },
  { id: 'tickets.assign', name: 'Atribuir Tickets', description: 'Pode atribuir tickets para outros usuários', category: 'Tickets', icon: Users },

  // Usuários
  { id: 'users.view', name: 'Ver Usuários', description: 'Pode visualizar lista de usuários', category: 'Usuários', icon: Users },
  { id: 'users.create', name: 'Criar Usuários', description: 'Pode criar novos usuários', category: 'Usuários', icon: Plus },
  { id: 'users.edit', name: 'Editar Usuários', description: 'Pode editar dados de usuários', category: 'Usuários', icon: Edit },
  { id: 'users.delete', name: 'Deletar Usuários', description: 'Pode deletar usuários', category: 'Usuários', icon: Trash2 },

  // Departamentos
  { id: 'departments.view', name: 'Ver Departamentos', description: 'Pode visualizar departamentos', category: 'Departamentos', icon: Building2 },
  { id: 'departments.manage', name: 'Gerenciar Departamentos', description: 'Pode criar, editar e deletar departamentos', category: 'Departamentos', icon: Settings },

  // Relatórios
  { id: 'reports.view', name: 'Ver Relatórios', description: 'Pode visualizar relatórios básicos', category: 'Relatórios', icon: BarChart3 },
  { id: 'reports.advanced', name: 'Relatórios Avançados', description: 'Pode visualizar todos os relatórios', category: 'Relatórios', icon: BarChart3 },

  // Sistema
  { id: 'system.admin', name: 'Administração Sistema', description: 'Acesso completo às configurações do sistema', category: 'Sistema', icon: Cog },
  { id: 'system.roles', name: 'Gerenciar Funções', description: 'Pode gerenciar funções e permissões', category: 'Sistema', icon: Shield },
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'administrador',
    name: 'Administrador',
    description: 'Acesso completo ao sistema com todas as permissões',
    color: 'bg-purple-100 text-purple-800',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    isSystem: true
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Gerencia equipes e tem acesso a relatórios departamentais',
    color: 'bg-blue-100 text-blue-800',
    permissions: [
      'tickets.create', 'tickets.view_all', 'tickets.edit', 'tickets.assign',
      'users.view', 'users.edit', 'departments.view', 'reports.view', 'reports.advanced'
    ],
    isSystem: true
  },
  {
    id: 'colaborador',
    name: 'Colaborador',
    description: 'Acesso básico para criação e atendimento de tickets',
    color: 'bg-green-100 text-green-800',
    permissions: [
      'tickets.create', 'tickets.view_own', 'tickets.edit'
    ],
    isSystem: true
  }
];

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
    color: 'bg-slate-100 text-slate-800',
    permissions: []
  });

  // Fetch roles from API
  const { data: rolesData, isLoading, refetch } = useQuery({
    queryKey: ['/api/roles'],
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Force refetch when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Update roles when data is fetched
  useEffect(() => {
    if (rolesData) {
      const mappedRoles = rolesData.map((role: any) => {
        // Map permissions based on role type
        let rolePermissions = [];
        switch (role.id) {
          case 'administrador':
            rolePermissions = AVAILABLE_PERMISSIONS.map(p => p.id);
            break;
          case 'supervisor':
            rolePermissions = [
              'tickets.create', 'tickets.view_all', 'tickets.edit', 'tickets.assign',
              'users.view', 'users.edit', 'departments.view', 'reports.view', 'reports.advanced'
            ];
            break;
          case 'colaborador':
            rolePermissions = [
              'tickets.create', 'tickets.view_own', 'tickets.edit'
            ];
            break;
        }
        
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          color: role.color,
          permissions: rolePermissions,
          userCount: role.userCount,
          isSystem: role.isSystem
        };
      });
      
      setRoles(mappedRoles);
    }
  }, [rolesData]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar usuários para contagem por função
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    refetchInterval: 30000,
  }) as { data: any[] };

  useEffect(() => {
    if (users && users.length > 0) {
      setRoles(prevRoles => 
        prevRoles.map(role => ({
          ...role,
          userCount: users.filter((user: any) => user.role === role.id).length
        }))
      );
    }
  }, [users]);

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Erro de Validação",
        description: "Nome e descrição são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const roleToCreate: Role = {
      id: newRole.name!.toLowerCase().replace(/\s+/g, '_'),
      name: newRole.name!,
      description: newRole.description!,
      color: newRole.color || 'bg-slate-100 text-slate-800',
      permissions: newRole.permissions || [],
      userCount: 0,
      isSystem: false
    };

    setRoles(prev => [...prev, roleToCreate]);
    setIsCreateModalOpen(false);
    setNewRole({ name: '', description: '', color: 'bg-slate-100 text-slate-800', permissions: [] });

    toast({
      title: "Sucesso",
      description: "Função criada com sucesso",
    });
  };

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role });
    setIsEditModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    setRoles(prev => prev.map(role => 
      role.id === editingRole.id ? editingRole : role
    ));

    setIsEditModalOpen(false);
    setEditingRole(null);

    toast({
      title: "Sucesso",
      description: "Função atualizada com sucesso",
    });
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.isSystem) {
      toast({
        title: "Operação Não Permitida",
        description: "Funções do sistema não podem ser deletadas",
        variant: "destructive",
      });
      return;
    }

    const userCount = users.filter((user: any) => user.role === roleId).length;
    if (userCount > 0) {
      toast({
        title: "Operação Não Permitida",
        description: `Não é possível deletar uma função com ${userCount} usuário(s) associado(s)`,
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar a função "${role.name}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    setRoles(prev => prev.filter(r => r.id !== roleId));

    toast({
      title: "Sucesso",
      description: "Função deletada com sucesso",
    });
  };

  const handlePermissionToggle = (permissionId: string, isCreate = false) => {
    const updatePermissions = (current: string[]) => {
      const hasPermission = current.includes(permissionId);
      return hasPermission 
        ? current.filter(p => p !== permissionId)
        : [...current, permissionId];
    };

    if (isCreate) {
      setNewRole(prev => ({
        ...prev,
        permissions: updatePermissions(prev.permissions || [])
      }));
    } else if (editingRole) {
      setEditingRole(prev => prev ? ({
        ...prev,
        permissions: updatePermissions(prev.permissions)
      }) : null);
    }
  };

  const getPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    AVAILABLE_PERMISSIONS.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tickets': return FileText;
      case 'Usuários': return Users;
      case 'Departamentos': return Building2;
      case 'Relatórios': return BarChart3;
      case 'Sistema': return Cog;
      default: return Settings;
    }
  };

  return (
    <AdminOnly>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-opus-blue-dark">Configuração de Funções</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie funções e permissões do sistema de usuários
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-opus-blue-dark hover:bg-opus-blue-light"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Função
          </Button>
        </div>

        {/* Lista de Funções */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Shield className="w-5 h-5 text-opus-blue-dark" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        role.id === 'administrador' ? 'bg-purple-100 text-purple-800' :
                        role.id === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {role.id === 'administrador' ? '1' : role.id === 'supervisor' ? '1' : '2'} usuário(s)
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditRole(role)}
                      className="text-opus-blue-dark hover:bg-opus-blue-light/10"
                      title="Editar função"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:bg-red-50"
                        title="Deletar função"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {role.description}
                </CardDescription>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permissões: {role.permissions?.length || 0}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 3).map(permissionId => {
                      const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
                      return permission ? (
                        <Badge key={permissionId} variant="secondary" className="text-xs">
                          {permission.name}
                        </Badge>
                      ) : null;
                    })}
                    {(role.permissions?.length || 0) > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(role.permissions?.length || 0) - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
                {role.isSystem && (
                  <Badge variant="outline" className="mt-2">
                    Função do Sistema
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de Criação */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Função</DialogTitle>
              <DialogDescription>
                Defina o nome, descrição e permissões para a nova função
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Função</Label>
                  <Input
                    id="name"
                    value={newRole.name || ''}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Analista, Operador..."
                  />
                </div>
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <select
                    id="color"
                    value={newRole.color}
                    onChange={(e) => setNewRole(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="bg-slate-100 text-slate-800">Cinza</option>
                    <option value="bg-blue-100 text-blue-800">Azul</option>
                    <option value="bg-green-100 text-green-800">Verde</option>
                    <option value="bg-yellow-100 text-yellow-800">Amarelo</option>
                    <option value="bg-purple-100 text-purple-800">Roxo</option>
                    <option value="bg-red-100 text-red-800">Vermelho</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newRole.description || ''}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva as responsabilidades desta função..."
                />
              </div>

              <div>
                <Label>Permissões</Label>
                <div className="mt-2 space-y-4">
                  {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-5 h-5 text-opus-blue-dark" />
                          <h4 className="font-semibold">{category}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`new-${permission.id}`}
                                checked={newRole.permissions?.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id, true)}
                              />
                              <Label htmlFor={`new-${permission.id}`} className="text-sm">
                                {permission.name}
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRole} className="bg-opus-blue-dark hover:bg-opus-blue-light">
                Criar Função
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Função: {editingRole?.name}</DialogTitle>
              <DialogDescription>
                Modifique as permissões e configurações da função
              </DialogDescription>
            </DialogHeader>

            {editingRole && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nome da Função</Label>
                    <Input
                      id="edit-name"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                      disabled={editingRole.isSystem}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-color">Cor</Label>
                    <select
                      id="edit-color"
                      value={editingRole.color}
                      onChange={(e) => setEditingRole(prev => prev ? ({ ...prev, color: e.target.value }) : null)}
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={editingRole.isSystem}
                    >
                      <option value="bg-slate-100 text-slate-800">Cinza</option>
                      <option value="bg-blue-100 text-blue-800">Azul</option>
                      <option value="bg-green-100 text-green-800">Verde</option>
                      <option value="bg-yellow-100 text-yellow-800">Amarelo</option>
                      <option value="bg-purple-100 text-purple-800">Roxo</option>
                      <option value="bg-red-100 text-red-800">Vermelho</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editingRole.description}
                    onChange={(e) => setEditingRole(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    disabled={editingRole.isSystem}
                  />
                </div>

                <div>
                  <Label>Permissões</Label>
                  <div className="mt-2 space-y-4">
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => {
                      const Icon = getCategoryIcon(category);
                      return (
                        <div key={category} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-5 h-5 text-opus-blue-dark" />
                            <h4 className="font-semibold">{category}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`edit-${permission.id}`}
                                  checked={editingRole.permissions.includes(permission.id)}
                                  onCheckedChange={() => handlePermissionToggle(permission.id, false)}
                                />
                                <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                                  {permission.name}
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateRole} className="bg-opus-blue-dark hover:bg-opus-blue-light">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminOnly>
  );
}