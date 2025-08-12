import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X } from 'lucide-react';

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
  canManageDepartments: 'Gerenciar Departamentos'
};

const ROLE_LABELS = {
  colaborador: 'Colaborador',
  supervisor: 'Supervisor',
  administrador: 'Administrador'
};

export default function PermissionsConfig() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      console.log('Fetching permissions from API...');
      const response = await fetch('/api/permissions');
      
      console.log('Permissions response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Permissions data:', data);
        setPermissions(data);
      } else {
        console.error('Failed to fetch permissions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handlePermissionChange = async (role: string, permission: string, value: boolean) => {
    try {
      console.log('Updating permission:', role, permission, value);
      
      // Converter camelCase para snake_case para o backend
      const snakeCasePermission = permission.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      console.log('Snake case permission:', snakeCasePermission);
      
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
          description: `Configuração salva para ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]}`,
        });
      } else {
        throw new Error('Erro na requisição');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando configurações de permissões...</div>;
  }

  console.log('Rendering PermissionsConfig, permissions:', permissions, 'editing:', editingRole);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuração de Permissões</h1>
        <p className="text-gray-600">Configure as permissões para cada nível hierárquico</p>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Importante:</strong> As alterações são salvas automaticamente quando você marca/desmarca as opções.
          </p>
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          Debug: {permissions.length} permissões carregadas, editando: {editingRole || 'nenhuma'}
        </div>
      </div>

      <div className="grid gap-6">
        {['colaborador', 'supervisor', 'administrador'].map(role => {
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

          return (
            <Card key={role} className="p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-xs font-medium text-gray-600">
                      {Object.values(rolePermissions).filter(v => v === true).length} permissões ativas
                    </span>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Edit button clicked for role:', role);
                        setEditingRole(role);
                      }}
                      className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
                      data-testid={`button-edit-${role}`}
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRole(null)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingRole(null);
                          toast({
                            title: "Permissões salvas",
                            description: `Configurações de ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]} foram salvas`,
                          });
                        }}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4" />
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50">
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
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                    const hasPermission = rolePermissions[key as keyof typeof rolePermissions];
                    return (
                      <div key={key} className={`px-3 py-2 rounded-full text-xs font-medium ${
                        hasPermission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}