import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X, Settings } from 'lucide-react';

interface Permission {
  id: string;
  role: string;
  canManageUsers: boolean;
  canViewAllTickets: boolean;
  canViewDepartmentTickets: boolean;
  canManageTickets: boolean;
  canViewReports: boolean;
  canManageSystem: boolean;
  canManageCategories: boolean;
  canManageDepartments: boolean;
}

const PERMISSION_LABELS = {
  canManageUsers: 'Gerenciar Usuários',
  canViewAllTickets: 'Ver Todos os Tickets',
  canViewDepartmentTickets: 'Ver Tickets do Departamento',
  canManageTickets: 'Gerenciar Tickets',
  canViewReports: 'Ver Relatórios',
  canManageSystem: 'Administrar Sistema',
  canManageCategories: 'Gerenciar Categorias',
  canManageDepartments: 'Gerenciar Departamentos',
  canCreateTickets: 'Criar Tickets',
  canViewOwnTickets: 'Ver Próprios Tickets',
  canEditOwnTickets: 'Editar Próprios Tickets',
  canRespondTickets: 'Responder Tickets'
};

const ROLE_LABELS = {
  solicitante: 'Solicitante',
  atendente: 'Atendente', 
  supervisor: 'Supervisor',
  administrador: 'Administrador'
};

const ROLE_COLORS = {
  solicitante: 'border-green-500',
  atendente: 'border-yellow-500',
  supervisor: 'border-blue-500',
  administrador: 'border-purple-500'
};

const ROLE_DESCRIPTIONS = {
  solicitante: 'Pode apenas criar tickets e visualizar seus próprios',
  atendente: 'Pode responder tickets atribuídos e ver tickets do departamento',
  supervisor: 'Gerencia equipes e tem acesso a relatórios departamentais',
  administrador: 'Acesso completo ao sistema com todas as permissões'
};

export default function FunctionConfig() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      console.log('Carregando permissões...');
      const response = await fetch('/api/permissions');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Permissões carregadas:', data);
        setPermissions(data);
      } else {
        console.error('Erro ao carregar permissões:', response.status);
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações de permissões",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar permissões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handlePermissionChange = async (role: string, permission: string, value: boolean) => {
    try {
      console.log('Atualizando permissão:', role, permission, value);
      
      // Converter camelCase para snake_case para o backend
      const snakeCasePermission = permission.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      const response = await fetch(`/api/permissions/${role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [snakeCasePermission]: value
        }),
      });

      if (response.ok) {
        // Update local state
        setPermissions(prev => 
          prev.map(p => 
            p.role === role 
              ? { ...p, [permission]: value }
              : p
          )
        );

        toast({
          title: "Permissão atualizada",
          description: `${PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]} ${value ? 'habilitada' : 'desabilitada'} para ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]}`,
        });
      } else {
        throw new Error('Erro na requisição');
      }
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração de permissão",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações de permissões...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuração de Funções</h1>
            <p className="text-gray-600">Gerencie funções e permissões do sistema de usuários</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">
            <strong>Importante:</strong> As alterações nas permissões são salvas automaticamente e aplicadas imediatamente ao sistema.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {['solicitante', 'atendente', 'supervisor', 'administrador'].map(role => {
          const rolePermissions = permissions.find(p => p.role === role) || {
            role,
            canManageUsers: false,
            canViewAllTickets: false,
            canViewDepartmentTickets: false,
            canManageTickets: false,
            canViewReports: false,
            canManageSystem: false,
            canManageCategories: false,
            canManageDepartments: false,
          };

          const isEditing = editingRole === role;
          const activePermissions = Object.values(rolePermissions).filter(v => v === true).length - 1; // -1 to exclude 'role' field

          return (
            <Card key={role} className={`p-6 border-l-4 ${ROLE_COLORS[role as keyof typeof ROLE_COLORS]} shadow-lg hover:shadow-xl transition-shadow`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    role === 'administrador' ? 'bg-purple-500' : 
                    role === 'supervisor' ? 'bg-blue-500' : 
                    role === 'atendente' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {role === 'administrador' ? 'A' : role === 'supervisor' ? 'S' : role === 'atendente' ? 'T' : 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {activePermissions} de {Object.keys(PERMISSION_LABELS).length} permissões ativas
                    </p>
                    <p className="text-xs text-gray-500">
                      {ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS]}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => {
                        console.log('Editando função:', role);
                        setEditingRole(role);
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      data-testid={`button-edit-${role}`}
                    >
                      <Edit className="h-4 w-4" />
                      Editar Permissões
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingRole(null)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingRole(null);
                          toast({
                            title: "Configurações salvas",
                            description: `Permissões de ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]} foram atualizadas com sucesso`,
                          });
                        }}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="h-4 w-4" />
                        Finalizar Edição
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Configure as permissões desta função:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 transition-colors">
                        <Checkbox
                          id={`${role}-${key}`}
                          checked={rolePermissions[key as keyof typeof rolePermissions]}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(role, key, checked as boolean)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label 
                          htmlFor={`${role}-${key}`}
                          className="text-sm text-gray-700 cursor-pointer flex-1 font-medium"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Permissões ativas:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                      const hasPermission = rolePermissions[key as keyof typeof rolePermissions];
                      return (
                        <div key={key} className={`px-3 py-2 rounded-full text-xs font-medium text-center ${
                          hasPermission 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {hasPermission ? '✓' : '✗'} {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}