import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import TicketCard from './TicketCard';

const KanbanColumn = ({ 
  column, 
  tickets, 
  onTicketMove, 
  onTicketEdit, 
  onTicketSelect, 
  selectedTickets, 
  canDrag,
  activeFilters,
  onFilterChange 
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'ticket',
    drop: (item) => {
      if (item?.status !== column?.id) {
        onTicketMove(item?.id, column?.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getColumnColor = (status) => {
    switch (status) {
      case 'todo': return 'border-t-secondary';
      case 'attending': return 'border-t-primary';
      case 'paused': return 'border-t-warning';
      case 'completed': return 'border-t-success';
      default: return 'border-t-muted';
    }
  };

  const getColumnIcon = (status) => {
    switch (status) {
      case 'todo': return 'Circle';
      case 'attending': return 'Play';
      case 'paused': return 'Pause';
      case 'completed': return 'CheckCircle';
      default: return 'Circle';
    }
  };

  const priorityOptions = [
    { value: 'all', label: 'Todas as Prioridades' },
    { value: 'Critical', label: 'Crítica' },
    { value: 'High', label: 'Alta' },
    { value: 'Medium', label: 'Média' },
    { value: 'Low', label: 'Baixa' }
  ];

  const agentOptions = [
    { value: 'all', label: 'Todos os Agentes' },
    { value: 'ana.silva', label: 'Ana Silva' },
    { value: 'carlos.santos', label: 'Carlos Santos' },
    { value: 'maria.oliveira', label: 'Maria Oliveira' },
    { value: 'joao.ferreira', label: 'João Ferreira' }
  ];

  const slaOptions = [
    { value: 'all', label: 'Todos os SLAs' },
    { value: 'critical', label: 'SLA Crítico (>90%)' },
    { value: 'warning', label: 'SLA Atenção (70-90%)' },
    { value: 'normal', label: 'SLA Normal (<70%)' }
  ];

  return (
    <div
      ref={drop}
      className={`
        flex flex-col h-full bg-muted/30 rounded-lg border-t-4 ${getColumnColor(column?.id)}
        transition-all duration-200
        ${isOver && canDrop ? 'bg-primary/5 border-primary/20' : ''}
        ${isOver && !canDrop ? 'bg-error/5 border-error/20' : ''}
      `}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border bg-card rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Icon name={getColumnIcon(column?.id)} size={20} className="text-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">{column?.title}</h3>
              <p className="text-sm text-muted-foreground">{column?.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-2 py-1 rounded-full">
              {tickets?.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              iconName="Filter"
              iconSize={16}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={isFilterOpen ? 'bg-muted' : ''}
            />
          </div>
        </div>

        {/* Quick Filters */}
        {isFilterOpen && (
          <div className="space-y-3 pt-3 border-t border-border">
            <Select
              label="Prioridade"
              options={priorityOptions}
              value={activeFilters?.priority || 'all'}
              onChange={(value) => onFilterChange('priority', value)}
              className="text-sm"
            />
            <Select
              label="Agente"
              options={agentOptions}
              value={activeFilters?.agent || 'all'}
              onChange={(value) => onFilterChange('agent', value)}
              className="text-sm"
            />
            <Select
              label="Status SLA"
              options={slaOptions}
              value={activeFilters?.sla || 'all'}
              onChange={(value) => onFilterChange('sla', value)}
              className="text-sm"
            />
          </div>
        )}
      </div>
      {/* Column Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0">
        {tickets?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Icon name="Inbox" size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum ticket nesta coluna</p>
          </div>
        ) : (
          tickets?.map((ticket) => (
            <TicketCard
              key={ticket?.id}
              ticket={ticket}
              onEdit={onTicketEdit}
              onSelect={onTicketSelect}
              isSelected={selectedTickets?.includes(ticket?.id)}
              canDrag={canDrag}
            />
          ))
        )}

        {/* Drop Zone Indicator */}
        {isOver && canDrop && (
          <div className="border-2 border-dashed border-primary bg-primary/5 rounded-lg p-8 text-center">
            <Icon name="Plus" size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-primary font-medium">Solte o ticket aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;