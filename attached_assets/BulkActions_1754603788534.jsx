import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const BulkActions = ({ selectedTickets, onBulkAction, onClearSelection }) => {
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');

  const bulkActionOptions = [
    { value: 'pause', label: 'Pausar SLA' },
    { value: 'resume', label: 'Retomar SLA' },
    { value: 'extend', label: 'Estender SLA' },
    { value: 'reassign', label: 'Reatribuir Responsável' },
    { value: 'escalate', label: 'Escalar Tickets' }
  ];

  const assigneeOptions = [
    { value: 'carlos.silva', label: 'Carlos Silva' },
    { value: 'ana.santos', label: 'Ana Santos' },
    { value: 'pedro.oliveira', label: 'Pedro Oliveira' },
    { value: 'maria.costa', label: 'Maria Costa' },
    { value: 'joao.ferreira', label: 'João Ferreira' }
  ];

  const handleBulkAction = () => {
    if (!bulkAction) return;

    const actionData = {
      action: bulkAction,
      ticketIds: selectedTickets,
      reason: bulkReason,
      assignee: bulkAssignee
    };

    onBulkAction(actionData);
    setShowBulkDialog(false);
    setBulkAction('');
    setBulkReason('');
    setBulkAssignee('');
  };

  if (selectedTickets?.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-enterprise-lg p-4 z-40">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={18} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {selectedTickets?.length} ticket{selectedTickets?.length > 1 ? 's' : ''} selecionado{selectedTickets?.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDialog(true)}
              iconName="Settings"
              iconPosition="left"
              iconSize={14}
            >
              Ações em Lote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
              iconSize={14}
            >
              Limpar Seleção
            </Button>
          </div>
        </div>
      </div>
      {/* Bulk Action Dialog */}
      {showBulkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-enterprise-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">Ações em Lote</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBulkDialog(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Aplicar ação para {selectedTickets?.length} ticket{selectedTickets?.length > 1 ? 's' : ''}
                </p>
              </div>

              <Select
                label="Selecionar Ação"
                options={bulkActionOptions}
                value={bulkAction}
                onChange={setBulkAction}
                placeholder="Escolha uma ação"
                required
              />

              {bulkAction === 'reassign' && (
                <Select
                  label="Novo Responsável"
                  options={assigneeOptions}
                  value={bulkAssignee}
                  onChange={setBulkAssignee}
                  placeholder="Selecione o responsável"
                  required
                />
              )}

              <Input
                label="Motivo/Observação"
                type="text"
                placeholder="Digite o motivo para esta ação (opcional)"
                value={bulkReason}
                onChange={(e) => setBulkReason(e?.target?.value)}
              />

              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowBulkDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="default"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  iconName="Check"
                  iconPosition="left"
                  iconSize={14}
                >
                  Aplicar Ação
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;