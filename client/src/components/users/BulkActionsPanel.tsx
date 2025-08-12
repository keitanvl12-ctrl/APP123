import React, { useState } from 'react';
import Button from '@/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/AppIcon';

interface BulkActionsPanelProps {
  selectedUsers: string[];
  onBulkAction: (action: string, userIds: string[]) => void;
  onClear: () => void;
}

export default function BulkActionsPanel({
  selectedUsers,
  onBulkAction,
  onClear
}: BulkActionsPanelProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const bulkActions = [
    {
      id: 'activate',
      name: 'Ativar Usuários',
      description: 'Ativar contas de usuário selecionadas',
      icon: 'UserCheck',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'deactivate',
      name: 'Desativar Usuários',
      description: 'Desativar contas de usuário selecionadas',
      icon: 'UserX',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      id: 'reset_password',
      name: 'Redefinir Senha',
      description: 'Enviar link de redefinição de senha',
      icon: 'Key',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'change_role',
      name: 'Alterar Função',
      description: 'Alterar função dos usuários selecionados',
      icon: 'Shield',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'change_department',
      name: 'Alterar Departamento',
      description: 'Mover usuários para outro departamento',
      icon: 'Building',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 'send_notification',
      name: 'Enviar Notificação',
      description: 'Enviar mensagem para os usuários',
      icon: 'Mail',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      id: 'export_data',
      name: 'Exportar Dados',
      description: 'Exportar informações dos usuários selecionados',
      icon: 'Download',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-700'
    },
    {
      id: 'delete',
      name: 'Excluir Usuários',
      description: 'Remover permanentemente os usuários (cuidado!)',
      icon: 'Trash2',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  const handleExecuteAction = async () => {
    if (!selectedAction) return;

    // Confirmação para ações destrutivas
    if (['delete', 'deactivate'].includes(selectedAction)) {
      const action = bulkActions.find(a => a.id === selectedAction);
      const confirmMessage = `Tem certeza de que deseja ${action?.name.toLowerCase()} ${selectedUsers.length} usuário(s)? Esta ação não pode ser desfeita.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setIsExecuting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular processamento
      onBulkAction(selectedAction, selectedUsers);
      setSelectedAction('');
      alert(`Ação executada com sucesso em ${selectedUsers.length} usuário(s)!`);
    } catch (error) {
      console.error('Erro ao executar ação em lote:', error);
      alert('Erro ao executar a ação. Tente novamente.');
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedActionData = bulkActions.find(action => action.id === selectedAction);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Icon name="Settings" size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ações em Lote
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedUsers.length} usuário(s) selecionado(s)
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          iconName="X"
          iconPosition="left"
        >
          Cancelar Seleção
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Action Selection */}
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
            Selecione uma ação
          </label>
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma ação..." />
            </SelectTrigger>
            <SelectContent>
              {bulkActions.map(action => (
                <SelectItem key={action.id} value={action.id}>
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${action.bgColor}`}>
                      <Icon name={action.icon as any} size={14} className={action.color} />
                    </div>
                    <div>
                      <div className="font-medium">{action.name}</div>
                      <div className="text-xs text-slate-500">{action.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Execute Button */}
        <div className="flex items-end">
          <Button
            onClick={handleExecuteAction}
            disabled={!selectedAction || isExecuting}
            iconName={isExecuting ? "Loader2" : "Play"}
            iconPosition="left"
            className={selectedActionData ? selectedActionData.bgColor : ''}
          >
            {isExecuting ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Executando...
              </>
            ) : (
              'Executar Ação'
            )}
          </Button>
        </div>
      </div>

      {/* Action Preview */}
      {selectedActionData && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="flex items-start space-x-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${selectedActionData.bgColor}`}>
              <Icon name={selectedActionData.icon as any} size={20} className={selectedActionData.color} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                {selectedActionData.name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {selectedActionData.description}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Esta ação será aplicada a {selectedUsers.length} usuário(s) selecionado(s).
                {['delete', 'deactivate'].includes(selectedAction) && (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {' '}Atenção: Esta ação não pode ser desfeita.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Users Count */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={14} />
          <span>
            {selectedUsers.length} usuário(s) será(ão) afetado(s)
          </span>
        </div>
        
        {selectedUsers.length > 10 && (
          <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <Icon name="AlertTriangle" size={14} />
            <span>Ação em lote com muitos usuários</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Ações Rápidas:
          </span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedAction('activate');
                handleExecuteAction();
              }}
              disabled={isExecuting}
              iconName="UserCheck"
              iconPosition="left"
            >
              Ativar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedAction('deactivate');
                handleExecuteAction();
              }}
              disabled={isExecuting}
              iconName="UserX"
              iconPosition="left"
            >
              Desativar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedAction('export_data');
                handleExecuteAction();
              }}
              disabled={isExecuting}
              iconName="Download"
              iconPosition="left"
            >
              Exportar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}