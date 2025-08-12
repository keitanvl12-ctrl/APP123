import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ filters, onFiltersChange, onSavePreset, savedPresets, onLoadPreset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
    { value: 'Suspenso', label: 'Suspenso' },
    { value: 'Pendente', label: 'Pendente' }
  ];

  const departmentOptions = [
    { value: '', label: 'Todos os Departamentos' },
    { value: 'TI', label: 'Tecnologia da Informação' },
    { value: 'Suporte', label: 'Suporte Técnico' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'RH', label: 'Recursos Humanos' },
    { value: 'Financeiro', label: 'Financeiro' }
  ];

  const roleOptions = [
    { value: '', label: 'Todas as Funções' },
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Atendente', label: 'Atendente' },
    { value: 'Usuário', label: 'Usuário' }
  ];

  const activityOptions = [
    { value: '', label: 'Qualquer Período' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Último Mês' },
    { value: 'quarter', label: 'Último Trimestre' },
    { value: 'never', label: 'Nunca Acessou' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      department: '',
      role: '',
      activity: '',
      dateFrom: '',
      dateTo: '',
      hasAvatar: false,
      hasSignature: false,
      ldapSync: false
    });
  };

  const handleSavePreset = () => {
    if (presetName?.trim()) {
      onSavePreset(presetName, filters);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters)?.filter(value => 
      value !== '' && value !== false
    )?.length;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-enterprise">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={16} />
          <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowAdvanced(!showAdvanced)}
            iconName={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            Avançado
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={handleClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Limpar
          </Button>
        </div>
      </div>
      {/* Basic Filters */}
      <div className="p-4 space-y-4">
        <Input
          label="Buscar Usuários"
          type="search"
          placeholder="Nome, email ou ID..."
          value={filters?.search || ''}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={filters?.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
          />
          <Select
            label="Departamento"
            options={departmentOptions}
            value={filters?.department || ''}
            onChange={(value) => handleFilterChange('department', value)}
            searchable
          />
          <Select
            label="Função"
            options={roleOptions}
            value={filters?.role || ''}
            onChange={(value) => handleFilterChange('role', value)}
          />
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Última Atividade"
                options={activityOptions}
                value={filters?.activity || ''}
                onChange={(value) => handleFilterChange('activity', value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Período Personalizado</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Data inicial"
                    value={filters?.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Data final"
                    value={filters?.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Filtros Adicionais</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Checkbox
                  label="Possui Foto"
                  checked={filters?.hasAvatar || false}
                  onChange={(e) => handleFilterChange('hasAvatar', e?.target?.checked)}
                />
                <Checkbox
                  label="Possui Assinatura"
                  checked={filters?.hasSignature || false}
                  onChange={(e) => handleFilterChange('hasSignature', e?.target?.checked)}
                />
                <Checkbox
                  label="Sincronizado LDAP"
                  checked={filters?.ldapSync || false}
                  onChange={(e) => handleFilterChange('ldapSync', e?.target?.checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Saved Presets */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Filtros Salvos</label>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowSavePreset(!showSavePreset)}
              iconName="Save"
              iconPosition="left"
            >
              Salvar Atual
            </Button>
          </div>

          {showSavePreset && (
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Nome do filtro..."
                value={presetName}
                onChange={(e) => setPresetName(e?.target?.value)}
                className="flex-1"
              />
              <Button
                variant="default"
                size="xs"
                onClick={handleSavePreset}
                disabled={!presetName?.trim()}
              >
                Salvar
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {savedPresets?.map((preset) => (
              <button
                key={preset?.id}
                onClick={() => onLoadPreset(preset)}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-enterprise"
              >
                <Icon name="Filter" size={12} />
                <span>{preset?.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;