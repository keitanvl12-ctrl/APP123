import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DashboardToolbar = ({ 
  selectedTickets, 
  onBulkAction, 
  searchQuery, 
  onSearchChange,
  onRefresh,
  onExport 
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);

  const bulkActions = [
    { id: 'assign', label: 'Atribuir', icon: 'User' },
    { id: 'priority', label: 'Alterar Prioridade', icon: 'AlertTriangle' },
    { id: 'status', label: 'Alterar Status', icon: 'Activity' },
    { id: 'close', label: 'Fechar Tickets', icon: 'X' }
  ];

  const handleBulkAction = (actionId) => {
    onBulkAction(actionId, selectedTickets);
    setShowBulkActions(false);
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Search and Filters */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <Input
              type="search"
              placeholder="Buscar tickets por ID, assunto ou solicitante..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
          </div>

          {/* Advanced Search Toggle */}
          <Button variant="ghost" size="sm" iconName="Filter">
            Filtros Avançados
          </Button>
        </div>

        {/* Center Section - Bulk Actions */}
        {selectedTickets?.length > 0 && (
          <div className="flex items-center space-x-2 mx-4">
            <span className="text-sm text-muted-foreground">
              {selectedTickets?.length} ticket{selectedTickets?.length > 1 ? 's' : ''} selecionado{selectedTickets?.length > 1 ? 's' : ''}
            </span>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="MoreHorizontal"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                Ações em Lote
              </Button>
              
              {showBulkActions && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-enterprise-lg z-50">
                  <div className="py-2">
                    {bulkActions?.map((action) => (
                      <button
                        key={action?.id}
                        onClick={() => handleBulkAction(action?.id)}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-enterprise"
                      >
                        <Icon name={action?.icon} size={16} />
                        <span>{action?.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center space-x-4 mr-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">23</div>
              <div className="text-xs text-muted-foreground">Abertos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">15</div>
              <div className="text-xs text-muted-foreground">Em Andamento</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">7</div>
              <div className="text-xs text-muted-foreground">SLA Crítico</div>
            </div>
          </div>

          {/* Action Buttons */}
          <Button variant="ghost" size="sm" iconName="RefreshCw" onClick={onRefresh}>
            Atualizar
          </Button>
          
          <Button variant="ghost" size="sm" iconName="Download" onClick={onExport}>
            Exportar
          </Button>

          <Button variant="default" size="sm" iconName="Plus">
            Novo Ticket
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Icon name="Bell" size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Icon name="Settings" size={18} />
          </Button>
        </div>
      </div>
      {/* Integration Status Bar */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-6">
          {/* System Status */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Sistema Online</span>
          </div>

          {/* Integration Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Mail" size={14} className="text-green-600" />
              <span className="text-xs text-muted-foreground">Email Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Database" size={14} className="text-green-600" />
              <span className="text-xs text-muted-foreground">CRM Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Webhook" size={14} className="text-yellow-600" />
              <span className="text-xs text-muted-foreground">API Limitado</span>
            </div>
          </div>
        </div>

        {/* Real-time Updates */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">
            Última atualização: {new Date()?.toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>
      {/* Overlay for Bulk Actions Menu */}
      {showBulkActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowBulkActions(false)}
        />
      )}
    </div>
  );
};

export default DashboardToolbar;