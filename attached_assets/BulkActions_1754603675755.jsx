import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ 
  selectedTickets, 
  onBulkAction, 
  onClearSelection,
  totalTickets 
}) => {
  const [bulkAction, setBulkAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActionOptions = [
    { value: '', label: 'Selecionar ação...' },
    { value: 'move-todo', label: 'Mover para A Fazer' },
    { value: 'move-attending', label: 'Mover para Em Atendimento' },
    { value: 'move-paused', label: 'Mover para Pausado' },
    { value: 'move-completed', label: 'Mover para Concluído' },
    { value: 'assign-agent', label: 'Atribuir Agente' },
    { value: 'change-priority', label: 'Alterar Prioridade' },
    { value: 'add-comment', label: 'Adicionar Comentário' },
    { value: 'export', label: 'Exportar Selecionados' },
    { value: 'delete', label: 'Excluir Tickets' }
  ];

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTickets?.length === 0) return;

    setIsProcessing(true);
    try {
      await onBulkAction(bulkAction, selectedTickets);
      setBulkAction('');
    } catch (error) {
      console.error('Erro ao executar ação em lote:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAll = () => {
    // This would be handled by parent component
    onBulkAction('select-all', []);
  };

  if (selectedTickets?.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-enterprise-lg p-4 min-w-96">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full">
              <Icon name="Check" size={16} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {selectedTickets?.length} ticket{selectedTickets?.length !== 1 ? 's' : ''} selecionado{selectedTickets?.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-muted-foreground">
                de {totalTickets} tickets totais
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            iconSize={16}
            onClick={onClearSelection}
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Select
              options={bulkActionOptions}
              value={bulkAction}
              onChange={setBulkAction}
              placeholder="Selecionar ação..."
            />
          </div>
          
          <Button
            variant="default"
            iconName="Play"
            iconPosition="left"
            iconSize={16}
            loading={isProcessing}
            disabled={!bulkAction || isProcessing}
            onClick={handleBulkAction}
          >
            Executar
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              iconName="Square"
              iconPosition="left"
              iconSize={14}
              onClick={handleSelectAll}
            >
              Selecionar Todos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Download"
              iconPosition="left"
              iconSize={14}
              onClick={() => onBulkAction('export', selectedTickets)}
            >
              Exportar
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Info" size={14} />
            <span>Use Shift+Click para seleção em lote</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;