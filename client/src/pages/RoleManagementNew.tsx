import { useState, useEffect } from 'react';
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

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: number;
  isSystem: boolean;
  userCount: number;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  category: string;
}

export default function RoleManagementNew() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar funções do sistema - sem cache
  const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useQuery({
    queryKey: ['/api/roles'],
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Buscar permissões - sem cache
  const { data: allPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions'],
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  // Debug logs
  console.log('=== ROLE MANAGEMENT NEW DEBUG ===');
  console.log('Roles data:', roles);
  console.log('Permissions data:', allPermissions);

  // Force refetch on mount
  useEffect(() => {
    console.log('Component mounted, forcing refetch...');
    refetchRoles();
  }, []);

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

  const getPermissionBadges = (roleId: string) => {
    switch (roleId) {
      case 'administrador':
        return [
          'Criar Tickets', 'Ver Todos os Tickets', 'Gerenciar Usuários', 
          'Gerenciar Configurações', '+12 mais'
        ];
      case 'supervisor':
        return [
          'Criar Tickets', 'Ver Todos os Tickets', 'Editar Tickets', 
          'Ver Relatórios', '+5 mais'
        ];
      case 'atendente':
        return [
          'Criar Tickets', 'Ver Tickets do Departamento', 'Editar Tickets', '+3 mais'
        ];
      case 'solicitante':
        return ['Criar Tickets', 'Ver Próprios Tickets'];
      default:
        return [];
    }
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
                        {role.userCount} usuário(s)
                      </Badge>
                      
                      <CardDescription className="text-sm">
                        {role.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                    
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRole(role)}
                        className="ml-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
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
                        {getPermissionBadges(role.id).map((perm, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs px-2 py-1"
                          >
                            {perm}
                          </Badge>
                        ))}
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
              Recarregue a página ou verifique a conexão
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}