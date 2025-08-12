import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Eye, 
  Settings, 
  FileText, 
  Building2,
  Ticket,
  BarChart3
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { AdminOnly } from '@/components/PermissionGuard';

interface PermissionConfig {
  key: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

const PERMISSION_CONFIG: PermissionConfig[] = [
  {
    key: 'canManageUsers',
    name: 'Gerenciar Usuários',
    description: 'Criar, editar e excluir usuários',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    key: 'canViewAllTickets',
    name: 'Visualizar Todos os Tickets',
    description: 'Ver tickets de todos os departamentos',
    icon: Eye,
    color: 'text-green-600'
  },
  {
    key: 'canViewDepartmentTickets',
    name: 'Visualizar Tickets do Departamento',
    description: 'Ver todos os tickets do próprio departamento',
    icon: Ticket,
    color: 'text-purple-600'
  },
  {
    key: 'canManageTickets',
    name: 'Gerenciar Tickets',
    description: 'Atender, resolver e gerenciar tickets',
    icon: Settings,
    color: 'text-orange-600'
  },
  {
    key: 'canViewReports',
    name: 'Visualizar Relatórios',
    description: 'Acesso aos relatórios do sistema',
    icon: BarChart3,
    color: 'text-indigo-600'
  },
  {
    key: 'canManageSystem',
    name: 'Configurações do Sistema',
    description: 'Acesso às configurações administrativas',
    icon: Settings,
    color: 'text-red-600'
  },
  {
    key: 'canManageCategories',
    name: 'Gerenciar Categorias',
    description: 'Criar e gerenciar categorias de tickets',
    icon: FileText,
    color: 'text-yellow-600'
  },
  {
    key: 'canManageDepartments',
    name: 'Gerenciar Departamentos',
    description: 'Criar e gerenciar departamentos',
    icon: Building2,
    color: 'text-teal-600'
  }
];

const ROLES = [
  { 
    key: 'colaborador', 
    name: 'Colaborador', 
    description: 'Usuário básico que pode criar tickets',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  },
  { 
    key: 'supervisor', 
    name: 'Supervisor', 
    description: 'Gerencia tickets e usuários do departamento',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
  },
  { 
    key: 'administrador', 
    name: 'Administrador', 
    description: 'Acesso total ao sistema',
    color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  }
];

// Permissões padrão por role
const DEFAULT_PERMISSIONS = {
  colaborador: {
    canManageUsers: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: false,
    canManageTickets: false,
    canViewReports: false,
    canManageSystem: false,
    canManageCategories: false,
    canManageDepartments: false,
  },
  supervisor: {
    canManageUsers: true,
    canViewAllTickets: false,
    canViewDepartmentTickets: true,
    canManageTickets: true,
    canViewReports: true,
    canManageSystem: false,
    canManageCategories: true,
    canManageDepartments: false,
  },
  administrador: {
    canManageUsers: true,
    canViewAllTickets: true,
    canViewDepartmentTickets: true,
    canManageTickets: true,
    canViewReports: true,
    canManageSystem: true,
    canManageCategories: true,
    canManageDepartments: true,
  }
};

export default function PermissionSettings() {
  const { hasPermission, userRole } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<string>('colaborador');

  return (
    <AdminOnly fallback={
      <div className="p-6 text-center">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Acesso Restrito</h2>
        <p className="text-gray-500">Apenas administradores podem acessar as configurações de permissões.</p>
      </div>
    }>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              Permissões do Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configure as permissões para cada hierarquia de usuário
            </p>
          </div>
        </div>

        {/* Seleção de Role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-opus-blue-dark">Hierarquias de Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLES.map((role) => (
                <div
                  key={role.key}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === role.key 
                      ? 'border-opus-blue-dark bg-opus-blue-dark bg-opacity-5' 
                      : 'border-gray-200 hover:border-opus-blue-light'
                  }`}
                  onClick={() => setSelectedRole(role.key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.name}</h3>
                    <Badge className={role.color}>
                      {role.key === userRole ? 'Seu nível' : role.key}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-opus-blue-dark">
              Permissões para {ROLES.find(r => r.key === selectedRole)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {PERMISSION_CONFIG.map((permission) => {
                const Icon = permission.icon;
                const hasThisPermission = DEFAULT_PERMISSIONS[selectedRole as keyof typeof DEFAULT_PERMISSIONS]?.[permission.key as keyof typeof DEFAULT_PERMISSIONS.colaborador];
                
                return (
                  <div key={permission.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${permission.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{permission.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{permission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={hasThisPermission} 
                        disabled={true} // Apenas visualização por enquanto
                      />
                      <span className="text-sm text-gray-500">
                        {hasThisPermission ? 'Permitido' : 'Negado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Resumo das Hierarquias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-opus-blue-dark">Resumo das Hierarquias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 mr-2">
                    Colaborador
                  </Badge>
                  - Usuário Básico
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                  <li>Pode criar tickets</li>
                  <li>Visualiza apenas seus próprios tickets</li>
                  <li>Não tem acesso a relatórios ou configurações</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 mr-2">
                    Supervisor
                  </Badge>
                  - Gerente de Departamento
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                  <li>Gerencia usuários do próprio departamento</li>
                  <li>Visualiza todos os tickets do departamento</li>
                  <li>Pode atender e resolver tickets</li>
                  <li>Acesso a relatórios do departamento</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 mr-2">
                    Administrador
                  </Badge>
                  - Acesso Total
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                  <li>Acesso total a todas as funcionalidades</li>
                  <li>Gerencia todos os usuários e departamentos</li>
                  <li>Visualiza todos os tickets do sistema</li>
                  <li>Acesso a todas as configurações e relatórios</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}