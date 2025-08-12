import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SLAFilters = ({ filters, onFiltersChange, onSaveFilter, savedFilters, onLoadFilter }) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  const slaStatusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'normal', label: 'Normal (0-59%)' },
    { value: 'warning', label: 'Atenção (60-79%)' },
    { value: 'critical', label: 'Crítico (80-99%)' },
    { value: 'violated', label: 'Violado (100%+)' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas as Prioridades' },
    { value: 'Crítica', label: 'Crítica' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Média', label: 'Média' },
    { value: 'Baixa', label: 'Baixa' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'Todos os Departamentos' },
    { value: 'TI', label: 'Tecnologia da Informação' },
    { value: 'Suporte', label: 'Suporte Técnico' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'RH', label: 'Recursos Humanos' }
  ];

  const sortOptions = [
    { value: 'timeRemaining', label: 'Tempo Restante (Menor)' },
    { value: 'slaPercentage', label: 'Percentual SLA (Maior)' },
    { value: 'priority', label: 'Prioridade' },
    { value: 'createdAt', label: 'Data de Criação' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSaveFilter = () => {
    if (filterName?.trim()) {
      onSaveFilter(filterName, filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      slaStatus: 'all',
      priority: 'all',
      department: 'all',
      sortBy: 'timeRemaining'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-enterprise mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-primary" />
          <span>Filtros SLA</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            iconName="Save"
            iconPosition="left"
            iconSize={14}
          >
            Salvar Filtro
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            iconName="X"
            iconSize={14}
          >
            Limpar
          </Button>
        </div>
      </div>
      {/* Search and Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Input
          type="search"
          placeholder="Buscar tickets..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="w-full"
        />

        <Select
          options={slaStatusOptions}
          value={filters?.slaStatus}
          onChange={(value) => handleFilterChange('slaStatus', value)}
          placeholder="Status SLA"
        />

        <Select
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
          placeholder="Prioridade"
        />

        <Select
          options={departmentOptions}
          value={filters?.department}
          onChange={(value) => handleFilterChange('department', value)}
          placeholder="Departamento"
        />
      </div>
      {/* Sort and Saved Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
          </div>
          <Select
            options={sortOptions}
            value={filters?.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value)}
            className="w-48"
          />
        </div>

        {savedFilters?.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filtros salvos:</span>
            <div className="flex items-center space-x-1">
              {savedFilters?.map((savedFilter) => (
                <Button
                  key={savedFilter?.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadFilter(savedFilter)}
                  className="text-xs"
                >
                  {savedFilter?.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-enterprise-lg">
            <h4 className="font-semibold text-foreground mb-4">Salvar Filtro</h4>
            <Input
              label="Nome do Filtro"
              type="text"
              placeholder="Digite um nome para o filtro"
              value={filterName}
              onChange={(e) => setFilterName(e?.target?.value)}
              className="mb-4"
            />
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleSaveFilter}
                disabled={!filterName?.trim()}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLAFilters;