import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Button from '@/components/Button';
import Icon from '@/components/AppIcon';

interface FilterPanelProps {
  filters: {
    status: string;
    role: string;
    department: string;
    lastLogin: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  departments: Array<{
    id: string;
    name: string;
    userCount: number;
  }>;
  roles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  userStats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    operators: number;
    regularUsers: number;
  };
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  departments,
  roles,
  userStats
}: FilterPanelProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      role: 'all',
      department: 'all',
      lastLogin: 'all',
      search: ''
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key === 'search' ? value !== '' : value !== 'all'
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            iconName="X"
            iconPosition="left"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
          Buscar
        </label>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Nome ou email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
          Status
        </label>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ativo ({userStats.active})</span>
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Inativo ({userStats.inactive})</span>
              </div>
            </SelectItem>
            <SelectItem value="pending">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pendente</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Role Filter */}
      <div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
          Função
        </label>
        <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as funções" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.id}>
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-xs text-slate-500">{role.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department Filter */}
      <div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
          Departamento
        </label>
        <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.name}>
                <div className="flex items-center justify-between w-full">
                  <span>{dept.name}</span>
                  <span className="text-xs text-slate-500">({dept.userCount})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Last Login Filter */}
      <div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
          Último Login
        </label>
        <Select value={filters.lastLogin} onValueChange={(value) => handleFilterChange('lastLogin', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Qualquer período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer período</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="older">Mais de 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
          Estatísticas Rápidas
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={14} className="text-slate-500" />
              <span className="text-slate-600 dark:text-slate-400">Total</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {userStats.total}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Ativos</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {userStats.active}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={14} className="text-purple-500" />
              <span className="text-slate-600 dark:text-slate-400">Admins</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {userStats.admins}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Headphones" size={14} className="text-blue-500" />
              <span className="text-slate-600 dark:text-slate-400">Operadores</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {userStats.operators}
            </span>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
          Por Departamento
        </h4>
        <div className="space-y-2">
          {departments.slice(0, 5).map(dept => (
            <div key={dept.id} className="flex items-center justify-between text-sm">
              <span 
                className="text-slate-600 dark:text-slate-400 truncate cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => handleFilterChange('department', dept.name)}
              >
                {dept.name}
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {dept.userCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
            Filtros Ativos
          </h4>
          <div className="space-y-1">
            {filters.search && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Busca: "{filters.search}"
              </div>
            )}
            {filters.status && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Status: {filters.status === 'active' ? 'Ativo' : filters.status === 'inactive' ? 'Inativo' : 'Pendente'}
              </div>
            )}
            {filters.role && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Função: {roles.find(r => r.id === filters.role)?.name}
              </div>
            )}
            {filters.department && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Depto: {filters.department}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}