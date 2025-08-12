import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Settings, Users, Building2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/PermissionGuard';

const ROLE_COLORS = {
  colaborador: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  supervisor: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
  administrador: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
};

const DEMO_TICKETS = [
  { id: '1', title: 'Problema no computador', createdBy: 'user-1', department: 'dept-ti-1' },
  { id: '2', title: 'Solicitação de material', createdBy: 'user-2', department: 'dept-rh-1' },
  { id: '3', title: 'Bug no sistema', createdBy: 'user-admin-1', department: 'dept-ti-1' },
  { id: '4', title: 'Férias pendentes', createdBy: 'user-3', department: 'dept-rh-1' }
];

export default function HierarchyDemo() {
  const { 
    hasPermission, 
    hasRoleLevel, 
    canViewUserTickets, 
    user, 
    userRole, 
    isLoading 
  } = usePermissions();

  const [selectedRole, setSelectedRole] = useState<string>('administrador');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-opus-blue-dark"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Atual do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-opus-blue-dark" />
            Hierarquia Atual do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Informações do Usuário</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nome:</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hierarquia:</span>
                  <Badge className={ROLE_COLORS[userRole]}>{userRole}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Departamento:</span>
                  <span className="text-sm">{user?.departmentId || 'Não definido'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Permissões Ativas</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {hasPermission('canViewAllTickets') ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">Ver Todos os Tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasPermission('canManageUsers') ? (
                    <Users className="w-4 h-4 text-green-600" />
                  ) : (
                    <Users className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">Gerenciar Usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasPermission('canManageDepartments') ? (
                    <Building2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Building2 className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">Gerenciar Departamentos</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demonstração de Filtros de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Filtragem de Tickets por Hierarquia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              <strong>Regras de visualização:</strong>
              <ul className="list-disc list-inside mt-2">
                <li><strong>Colaborador:</strong> Vê apenas seus próprios tickets</li>
                <li><strong>Supervisor:</strong> Vê todos os tickets do seu departamento</li>
                <li><strong>Administrador:</strong> Vê todos os tickets do sistema</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_TICKETS.map(ticket => {
                const canView = userRole === 'administrador' || 
                               (userRole === 'supervisor' && ticket.department === user?.departmentId) ||
                               (userRole === 'colaborador' && ticket.createdBy === user?.id);
                
                return (
                  <div 
                    key={ticket.id}
                    className={`p-3 border rounded-lg ${
                      canView ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{ticket.title}</h5>
                      {canView ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <div>Criado por: {ticket.createdBy}</div>
                      <div>Depto: {ticket.department}</div>
                      <div className="mt-1">
                        <Badge variant={canView ? "default" : "secondary"} className="text-xs">
                          {canView ? 'Visível' : 'Bloqueado'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proteção de Componentes */}
      <Card>
        <CardHeader>
          <CardTitle>Proteção de Componentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Apenas para Supervisores */}
            <PermissionGuard 
              minRole="supervisor"
              fallback={
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <p className="text-sm text-red-600">Acesso Negado: Requer nível Supervisor ou superior</p>
                </div>
              }
            >
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h5 className="font-medium text-blue-800">Área de Supervisores</h5>
                <p className="text-sm text-blue-600 mt-1">Este conteúdo é visível para Supervisores e Administradores</p>
              </div>
            </PermissionGuard>

            {/* Apenas para Administradores */}
            <PermissionGuard 
              minRole="administrador"
              fallback={
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <p className="text-sm text-red-600">Acesso Negado: Requer nível Administrador</p>
                </div>
              }
            >
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h5 className="font-medium text-red-800">Área Administrativa</h5>
                <p className="text-sm text-red-600 mt-1">Este conteúdo é visível apenas para Administradores</p>
              </div>
            </PermissionGuard>

            {/* Por permissão específica */}
            <PermissionGuard 
              permission="canManageDepartments"
              fallback={
                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <p className="text-sm text-orange-600">Acesso Negado: Sem permissão para gerenciar departamentos</p>
                </div>
              }
            >
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h5 className="font-medium text-green-800">Gerenciamento de Departamentos</h5>
                <p className="text-sm text-green-600 mt-1">Você tem permissão para gerenciar departamentos</p>
              </div>
            </PermissionGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}