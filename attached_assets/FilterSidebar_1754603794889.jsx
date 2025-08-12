import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ isCollapsed, onToggleCollapse, filters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    priority: true,
    sla: true,
    assignment: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const statusOptions = [
    { id: 'todo', label: 'A Fazer', count: 23, color: 'bg-gray-500' },
    { id: 'attending', label: 'Atendendo', count: 15, color: 'bg-blue-500' },
    { id: 'paused', label: 'Pausado', count: 8, color: 'bg-yellow-500' },
    { id: 'completed', label: 'Concluído', count: 42, color: 'bg-green-500' }
  ];

  const priorityOptions = [
    { id: 'critical', label: 'Crítica', count: 5, color: 'bg-red-600' },
    { id: 'high', label: 'Alta', count: 12, color: 'bg-orange-500' },
    { id: 'medium', label: 'Média', count: 28, color: 'bg-yellow-500' },
    { id: 'low', label: 'Baixa', count: 43, color: 'bg-green-500' }
  ];

  const slaOptions = [
    { id: 'violation', label: 'Violação SLA', count: 7, color: 'bg-red-500' },
    { id: 'warning', label: 'Alerta SLA', count: 12, color: 'bg-yellow-500' },
    { id: 'normal', label: 'Normal', count: 69, color: 'bg-green-500' }
  ];

  const savedPresets = [
    { id: 'my-tickets', label: 'Meus Tickets', count: 18 },
    { id: 'urgent', label: 'Urgentes', count: 9 },
    { id: 'overdue', label: 'Atrasados', count: 5 }
  ];

  const FilterSection = ({ title, icon, sectionKey, options, type = 'checkbox' }) => {
    const isExpanded = expandedSections?.[sectionKey];
    
    return (
      <div className="border-b border-border pb-4 mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full p-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-enterprise"
        >
          <div className="flex items-center space-x-2">
            <Icon name={icon} size={16} />
            {!isCollapsed && <span>{title}</span>}
          </div>
          {!isCollapsed && (
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={14} 
              className="transition-transform"
            />
          )}
        </button>
        {isExpanded && !isCollapsed && (
          <div className="mt-2 space-y-2 pl-6">
            {options?.map((option) => (
              <div key={option?.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters?.[sectionKey]?.includes(option?.id) || false}
                    onChange={(e) => onFilterChange(sectionKey, option?.id, e?.target?.checked)}
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${option?.color}`}></div>
                    <span className="text-xs text-foreground">{option?.label}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {option?.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="transition-enterprise"
          >
            <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && (
          <>
            {/* Saved Presets */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Filtros Salvos</h3>
              <div className="space-y-2">
                {savedPresets?.map((preset) => (
                  <button
                    key={preset?.id}
                    className="flex items-center justify-between w-full p-2 text-sm text-foreground hover:bg-muted rounded-lg transition-enterprise"
                  >
                    <span className="truncate">{preset?.label}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex-shrink-0">
                      {preset?.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Sections */}
            <FilterSection
              title="Status"
              icon="Activity"
              sectionKey="status"
              options={statusOptions}
            />

            <FilterSection
              title="Prioridade"
              icon="AlertTriangle"
              sectionKey="priority"
              options={priorityOptions}
            />

            <FilterSection
              title="SLA"
              icon="Clock"
              sectionKey="sla"
              options={slaOptions}
            />

            {/* SLA Violations Alert */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="AlertTriangle" size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-800">Alertas SLA</span>
              </div>
              <p className="text-xs text-red-700 mb-2">
                7 tickets com violação de SLA requerem atenção imediata
              </p>
              <Button variant="outline" size="xs" className="text-red-700 border-red-300 hover:bg-red-100">
                Ver Tickets
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground mb-3">Ações Rápidas</h3>
              <Button variant="ghost" size="sm" iconName="Plus" iconPosition="left" className="w-full justify-start text-xs">
                Novo Ticket
              </Button>
              <Button variant="ghost" size="sm" iconName="Download" iconPosition="left" className="w-full justify-start text-xs">
                Exportar Lista
              </Button>
              <Button variant="ghost" size="sm" iconName="Settings" iconPosition="left" className="w-full justify-start text-xs">
                Configurações
              </Button>
            </div>
          </>
        )}

        {/* Collapsed State Icons */}
        {isCollapsed && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Filter" size={20} className="text-muted-foreground" />
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">7</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;