import React from 'react';
import UserCard from '@/components/users/UserCard';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/Button';
import Icon from '@/components/AppIcon';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  lastLogin: string;
  createdAt: string;
  avatar?: string | null;
  phone?: string;
  extension?: string;
  location?: string;
  manager?: string | null;
  permissions?: string[];
  ticketsAssigned?: number;
  ticketsResolved?: number;
  averageResolutionTime?: string;
  satisfactionRating?: number;
}

interface Department {
  id: string;
  name: string;
  userCount: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserDataGridProps {
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onUserMultiSelect: (userIds: string[]) => void;
  onUserEdit: (userId: string) => void;
  onUserDelete: (userId: string) => void;
  onUserSecurity?: (userId: string) => void;
  viewMode: 'grid' | 'list';
  departments: Department[];
  roles: Role[];
}

export default function UserDataGrid({
  users,
  selectedUsers,
  onUserSelect,
  onUserMultiSelect,
  onUserEdit,
  onUserDelete,
  onUserSecurity,
  viewMode,
  departments,
  roles
}: UserDataGridProps) {
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      onUserMultiSelect([]);
    } else {
      onUserMultiSelect(users.map(u => u.id));
    }
  };

  const handleUserCheck = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onUserMultiSelect(newSelection);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrador': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'supervisor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'colaborador': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
        <Icon name="Users" size={48} className="text-slate-400 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Nenhum usuário encontrado
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Não há usuários que correspondam aos filtros aplicados.
        </p>
        <Button iconName="Plus" iconPosition="left">
          Criar Primeiro Usuário
        </Button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        {/* Selection Header */}
        {users.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedUsers.length === users.length && users.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedUsers.length > 0 
                  ? `${selectedUsers.length} de ${users.length} selecionado(s)`
                  : `Selecionar todos (${users.length})`
                }
              </span>
            </div>
          </div>
        )}

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isSelected={selectedUsers.includes(user.id)}
              onSelect={() => onUserSelect(user.id)}
              onCheck={() => handleUserCheck(user.id)}
              onEdit={() => onUserEdit(user.id)}
              onDelete={() => onUserDelete(user.id)}
              onSecurity={onUserSecurity ? () => onUserSecurity(user.id) : undefined}
              departments={departments}
              roles={roles}
            />
          ))}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
        <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-slate-900 dark:text-slate-100">
          <div className="col-span-1 flex items-center">
            <Checkbox
              checked={selectedUsers.length === users.length && users.length > 0}
              onCheckedChange={handleSelectAll}
            />
          </div>
          <div className="col-span-3">Usuário</div>
          <div className="col-span-2">Função</div>
          <div className="col-span-2">Departamento</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Último Login</div>
          <div className="col-span-1">Ações</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {users.map(user => (
          <div
            key={user.id}
            className={`grid grid-cols-12 gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
              selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
          >
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={() => handleUserCheck(user.id)}
              />
            </div>
            
            <div className="col-span-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} className="text-slate-500 dark:text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => onUserSelect(user.id)}
                    className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left"
                  >
                    {user.name}
                  </button>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleName(user.role)}
              </span>
            </div>
            
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-slate-900 dark:text-slate-100">
                {user.department}
              </span>
            </div>
            
            <div className="col-span-1 flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                {getStatusLabel(user.status)}
              </span>
            </div>
            
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {formatDate(user.lastLogin)}
              </span>
            </div>
            
            <div className="col-span-1 flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUserSelect(user.id)}
                iconName="Eye"
                title="Visualizar usuário"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUserEdit(user.id)}
                iconName="Edit"
                title="Editar usuário"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-4">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            {selectedUsers.length > 0 && `${selectedUsers.length} selecionado(s) • `}
            Mostrando {users.length} usuário(s)
          </span>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" disabled iconName="ChevronLeft">
              Anterior
            </Button>
            <span className="px-3 py-1 text-xs">Página 1 de 1</span>
            <Button size="sm" variant="outline" disabled iconName="ChevronRight">
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}