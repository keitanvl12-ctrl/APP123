import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const TicketGrid = ({ tickets, selectedTickets, onTicketSelect, onTicketPreview, searchQuery }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const priorityConfig = {
    critical: { label: 'Crítica', color: 'text-red-600 bg-red-50', icon: 'AlertTriangle' },
    high: { label: 'Alta', color: 'text-orange-600 bg-orange-50', icon: 'ArrowUp' },
    medium: { label: 'Média', color: 'text-yellow-600 bg-yellow-50', icon: 'Minus' },
    low: { label: 'Baixa', color: 'text-green-600 bg-green-50', icon: 'ArrowDown' }
  };

  const statusConfig = {
    todo: { label: 'A Fazer', color: 'text-gray-600 bg-gray-50' },
    attending: { label: 'Atendendo', color: 'text-blue-600 bg-blue-50' },
    paused: { label: 'Pausado', color: 'text-yellow-600 bg-yellow-50' },
    completed: { label: 'Concluído', color: 'text-green-600 bg-green-50' }
  };

  const getSLAColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSLATextColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes <= 0) return 'Vencido';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const sortedTickets = useMemo(() => {
    let filteredTickets = tickets;
    
    if (searchQuery) {
      filteredTickets = tickets?.filter(ticket =>
        ticket?.subject?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        ticket?.requester?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        ticket?.id?.toString()?.includes(searchQuery)
      );
    }

    return [...filteredTickets]?.sort((a, b) => {
      if (sortConfig?.key === 'id') {
        return sortConfig?.direction === 'asc' ? a?.id - b?.id : b?.id - a?.id;
      }
      
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      
      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tickets, sortConfig, searchQuery]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowSelect = (ticketId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected?.has(ticketId)) {
      newSelected?.delete(ticketId);
    } else {
      newSelected?.add(ticketId);
    }
    setSelectedRows(newSelected);
    onTicketSelect(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    if (selectedRows?.size === sortedTickets?.length) {
      setSelectedRows(new Set());
      onTicketSelect([]);
    } else {
      const allIds = new Set(sortedTickets.map(t => t.id));
      setSelectedRows(allIds);
      onTicketSelect(Array.from(allIds));
    }
  };

  const SortableHeader = ({ label, sortKey, className = "" }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-enterprise ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <Icon 
          name={sortConfig?.key === sortKey && sortConfig?.direction === 'desc' ? "ChevronDown" : "ChevronUp"} 
          size={12}
          className={sortConfig?.key === sortKey ? 'text-primary' : 'text-muted-foreground'}
        />
      </div>
    </th>
  );

  return (
    <div className="bg-card rounded-lg border border-border shadow-enterprise h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">
              Tickets ({sortedTickets?.length})
            </h2>
            {selectedRows?.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedRows?.size} selecionados
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" iconName="Download">
              Exportar
            </Button>
            <Button variant="ghost" size="sm" iconName="RefreshCw">
              Atualizar
            </Button>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedRows?.size === sortedTickets?.length && sortedTickets?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <SortableHeader label="ID" sortKey="id" className="w-20" />
              <SortableHeader label="Assunto" sortKey="subject" className="min-w-64" />
              <SortableHeader label="Solicitante" sortKey="requester" className="w-48" />
              <SortableHeader label="Responsável" sortKey="assignee" className="w-48" />
              <SortableHeader label="Prioridade" sortKey="priority" className="w-32" />
              <SortableHeader label="Status" sortKey="status" className="w-32" />
              <SortableHeader label="SLA" sortKey="slaPercentage" className="w-32" />
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedTickets?.map((ticket) => (
              <tr
                key={ticket?.id}
                className={`hover:bg-muted/50 transition-enterprise cursor-pointer ${
                  selectedRows?.has(ticket?.id) ? 'bg-primary/5' : ''
                }`}
                onClick={() => onTicketPreview(ticket)}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows?.has(ticket?.id)}
                    onChange={(e) => {
                      e?.stopPropagation();
                      handleRowSelect(ticket?.id);
                    }}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">#{ticket?.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-foreground truncate">{ticket?.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{ticket?.category}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={ticket?.requesterAvatar}
                      alt={ticket?.requester}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-foreground">{ticket?.requester}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {ticket?.assignee ? (
                    <div className="flex items-center space-x-2">
                      <Image
                        src={ticket?.assigneeAvatar}
                        alt={ticket?.assignee}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-foreground">{ticket?.assignee}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Não atribuído</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${priorityConfig?.[ticket?.priority]?.color}`}>
                    <Icon name={priorityConfig?.[ticket?.priority]?.icon} size={12} />
                    <span>{priorityConfig?.[ticket?.priority]?.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[ticket?.status]?.color}`}>
                    {statusConfig?.[ticket?.status]?.label}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${getSLAColor(ticket?.slaPercentage)}`}
                          style={{ width: `${Math.min(ticket?.slaPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${getSLATextColor(ticket?.slaPercentage)}`}>
                        {ticket?.slaPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeRemaining(ticket?.timeRemaining)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e?.stopPropagation();
                        // Handle play/pause action
                      }}
                      className="w-6 h-6"
                    >
                      <Icon name={ticket?.status === 'attending' ? "Pause" : "Play"} size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e?.stopPropagation();
                        // Handle edit action
                      }}
                      className="w-6 h-6"
                    >
                      <Icon name="Edit" size={12} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Keyboard Shortcuts Help */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span><kbd className="px-1 py-0.5 bg-muted rounded">j/k</kbd> navegar</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">espaço</kbd> preview</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded">a</kbd> atribuir</span>
          </div>
          <span>Última atualização: {new Date()?.toLocaleTimeString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketGrid;