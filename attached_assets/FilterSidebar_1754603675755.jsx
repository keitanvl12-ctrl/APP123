import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onClearFilters,
  ticketCounts 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterChange = (key, value, checked) => {
    const currentArray = localFilters?.[key] || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray?.filter(item => item !== value);
    
    handleFilterChange(key, newArray);
  };

  const priorityOptions = [
    { value: 'Critical', label: 'Crítica', count: ticketCounts?.priority?.Critical || 0 },
    { value: 'High', label: 'Alta', count: ticketCounts?.priority?.High || 0 },
    { value: 'Medium', label: 'Média', count: ticketCounts?.priority?.Medium || 0 },
    { value: 'Low', label: 'Baixa', count: ticketCounts?.priority?.Low || 0 }
  ];

  const statusOptions = [
    { value: 'todo', label: 'A Fazer', count: ticketCounts?.status?.todo || 0 },
    { value: 'attending', label: 'Em Atendimento', count: ticketCounts?.status?.attending || 0 },
    { value: 'paused', label: 'Pausado', count: ticketCounts?.status?.paused || 0 },
    { value: 'completed', label: 'Concluído', count: ticketCounts?.status?.completed || 0 }
  ];

  const agentOptions = [
    { value: 'ana.silva', label: 'Ana Silva', count: ticketCounts?.agent?.['ana.silva'] || 0 },
    { value: 'carlos.santos', label: 'Carlos Santos', count: ticketCounts?.agent?.['carlos.santos'] || 0 },
    { value: 'maria.oliveira', label: 'Maria Oliveira', count: ticketCounts?.agent?.['maria.oliveira'] || 0 },
    { value: 'joao.ferreira', label: 'João Ferreira', count: ticketCounts?.agent?.['joao.ferreira'] || 0 }
  ];

  const categoryOptions = [
    { value: 'technical', label: 'Técnico', count: ticketCounts?.category?.technical || 0 },
    { value: 'billing', label: 'Financeiro', count: ticketCounts?.category?.billing || 0 },
    { value: 'general', label: 'Geral', count: ticketCounts?.category?.general || 0 },
    { value: 'feature', label: 'Funcionalidade', count: ticketCounts?.category?.feature || 0 }
  ];

  const slaStatusOptions = [
    { value: 'critical', label: 'SLA Crítico (>90%)', count: ticketCounts?.sla?.critical || 0 },
    { value: 'warning', label: 'SLA Atenção (70-90%)', count: ticketCounts?.sla?.warning || 0 },
    { value: 'normal', label: 'SLA Normal (<70%)', count: ticketCounts?.sla?.normal || 0 }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-card border-l border-border shadow-enterprise-lg z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-72
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={20} className="text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Filtros Avançados</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              iconName="X"
              iconSize={16}
              onClick={onClose}
              className="lg:hidden"
            />
          </div>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search */}
            <div>
              <Input
                label="Buscar Tickets"
                type="search"
                placeholder="ID, assunto, solicitante..."
                value={localFilters?.search || ''}
                onChange={(e) => handleFilterChange('search', e?.target?.value)}
                className="mb-2"
              />
            </div>

            {/* Priority Filter */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Prioridade</h3>
              <div className="space-y-2">
                {priorityOptions?.map((option) => (
                  <div key={option?.value} className="flex items-center justify-between">
                    <Checkbox
                      label={option?.label}
                      checked={(localFilters?.priorities || [])?.includes(option?.value)}
                      onChange={(e) => handleArrayFilterChange('priorities', option?.value, e?.target?.checked)}
                    />
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {option?.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Status</h3>
              <div className="space-y-2">
                {statusOptions?.map((option) => (
                  <div key={option?.value} className="flex items-center justify-between">
                    <Checkbox
                      label={option?.label}
                      checked={(localFilters?.statuses || [])?.includes(option?.value)}
                      onChange={(e) => handleArrayFilterChange('statuses', option?.value, e?.target?.checked)}
                    />
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {option?.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Filter */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Agente Responsável</h3>
              <div className="space-y-2">
                {agentOptions?.map((option) => (
                  <div key={option?.value} className="flex items-center justify-between">
                    <Checkbox
                      label={option?.label}
                      checked={(localFilters?.agents || [])?.includes(option?.value)}
                      onChange={(e) => handleArrayFilterChange('agents', option?.value, e?.target?.checked)}
                    />
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {option?.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Categoria</h3>
              <div className="space-y-2">
                {categoryOptions?.map((option) => (
                  <div key={option?.value} className="flex items-center justify-between">
                    <Checkbox
                      label={option?.label}
                      checked={(localFilters?.categories || [])?.includes(option?.value)}
                      onChange={(e) => handleArrayFilterChange('categories', option?.value, e?.target?.checked)}
                    />
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {option?.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Status Filter */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Status SLA</h3>
              <div className="space-y-2">
                {slaStatusOptions?.map((option) => (
                  <div key={option?.value} className="flex items-center justify-between">
                    <Checkbox
                      label={option?.label}
                      checked={(localFilters?.slaStatuses || [])?.includes(option?.value)}
                      onChange={(e) => handleArrayFilterChange('slaStatuses', option?.value, e?.target?.checked)}
                    />
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {option?.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Período</h3>
              <div className="space-y-3">
                <Input
                  label="Data Inicial"
                  type="date"
                  value={localFilters?.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
                />
                <Input
                  label="Data Final"
                  type="date"
                  value={localFilters?.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              fullWidth
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={16}
              onClick={onClearFilters}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="default"
              fullWidth
              iconName="Filter"
              iconPosition="left"
              iconSize={16}
              onClick={onClose}
              className="lg:hidden"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;