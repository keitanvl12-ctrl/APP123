import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Users } from 'lucide-react';

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
  // Buscar funções do sistema - versão simples sem cache
  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['/api/roles'],
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  console.log('=== SIMPLE ROLE MANAGEMENT ===');
  console.log('Roles:', roles);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuração de Funções</h1>
        <p className="text-gray-600 mt-2">Gerencie funções e permissões do sistema de usuários</p>
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
    </div>
  );
}