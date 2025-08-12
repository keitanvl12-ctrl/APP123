import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '../AppIcon';

interface SLAFiltersState {
  priority: string;
  status: string;
  department: string;
  timeRange: string;
}

interface SLAFiltersProps {
  filters: SLAFiltersState;
  onFiltersChange: (filters: SLAFiltersState) => void;
}

export default function SLAFilters({ filters, onFiltersChange }: SLAFiltersProps) {
  const priorityOptions = [
    { value: 'all', label: 'Todas as Prioridades' },
    { value: 'critical', label: 'Crítica' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'open', label: 'Aberto' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'pending', label: 'Pendente' },
    { value: 'resolved', label: 'Resolvido' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'Todos os Departamentos' },
    { value: 'TI', label: 'TI' },
    { value: 'RH', label: 'Recursos Humanos' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Suporte', label: 'Suporte' }
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Última Hora' },
    { value: '24h', label: 'Últimas 24 Horas' },
    { value: '7d', label: 'Últimos 7 Dias' },
    { value: '30d', label: 'Últimos 30 Dias' },
    { value: 'all', label: 'Todos os Períodos' }
  ];

  const handleFilterChange = (key: keyof SLAFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      priority: 'all',
      status: 'all',
      department: 'all',
      timeRange: '24h'
    });
  };

  const hasActiveFilters = filters.priority !== 'all' || 
                          filters.status !== 'all' || 
                          filters.department !== 'all' || 
                          filters.timeRange !== '24h';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Filtros SLA
          </h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Prioridade
          </label>
          <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione prioridade" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Status
          </label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Departamento
          </label>
          <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione departamento" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Período
          </label>
          <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione período" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Ações rápidas:</span>
          <button
            onClick={() => onFiltersChange({ ...filters, status: 'open', timeRange: '24h' })}
            className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Violações SLA
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, priority: 'critical', status: 'open' })}
            className="px-3 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
          >
            Tickets Críticos
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, timeRange: '1h' })}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Urgentes
          </button>
        </div>
      </div>
    </div>
  );
}