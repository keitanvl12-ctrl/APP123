import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const BulkActionsPanel = ({ selectedUsers, onBulkAction, onClose }) => {
  const [activeAction, setActiveAction] = useState('');
  const [actionData, setActionData] = useState({});

  const bulkActions = [
    { value: 'status', label: 'Alterar Status', icon: 'UserCheck' },
    { value: 'department', label: 'Alterar Departamento', icon: 'Building' },
    { value: 'role', label: 'Alterar Função', icon: 'Shield' },
    { value: 'permissions', label: 'Aplicar Permissões', icon: 'Key' },
    { value: 'export', label: 'Exportar Dados', icon: 'Download' },
    { value: 'delete', label: 'Excluir Usuários', icon: 'Trash2' }
  ];

  const statusOptions = [
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
    { value: 'Suspenso', label: 'Suspenso' },
    { value: 'Pendente', label: 'Pendente' }
  ];

  const departmentOptions = [
    { value: 'TI', label: 'Tecnologia da Informação' },
    { value: 'Suporte', label: 'Suporte Técnico' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'RH', label: 'Recursos Humanos' },
    { value: 'Financeiro', label: 'Financeiro' }
  ];

  const roleOptions = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Atendente', label: 'Atendente' },
    { value: 'Usuário', label: 'Usuário' }
  ];

  const handleActionChange = (action) => {
    setActiveAction(action);
    setActionData({});
  };

  const handleExecute = () => {
    onBulkAction(activeAction, actionData, selectedUsers);
    onClose();
  };

  const renderActionForm = () => {
    switch (activeAction) {
      case 'status':
        return (
          <Select
            label="Novo Status"
            options={statusOptions}
            value={actionData?.status || ''}
            onChange={(value) => setActionData({ ...actionData, status: value })}
            placeholder="Selecione o status"
          />
        );
      
      case 'department':
        return (
          <Select
            label="Novo Departamento"
            options={departmentOptions}
            value={actionData?.department || ''}
            onChange={(value) => setActionData({ ...actionData, department: value })}
            placeholder="Selecione o departamento"
            searchable
          />
        );
      
      case 'role':
        return (
          <Select
            label="Nova Função"
            options={roleOptions}
            value={actionData?.role || ''}
            onChange={(value) => setActionData({ ...actionData, role: value })}
            placeholder="Selecione a função"
          />
        );
      
      case 'permissions':
        return (
          <div className="space-y-4">
            <Select
              label="Template de Permissões"
              options={[
                { value: 'admin', label: 'Administrador Completo' },
                { value: 'supervisor', label: 'Supervisor de Equipe' },
                { value: 'agent', label: 'Agente de Suporte' },
                { value: 'readonly', label: 'Somente Leitura' }
              ]}
              value={actionData?.template || ''}
              onChange={(value) => setActionData({ ...actionData, template: value })}
              placeholder="Selecione um template"
            />
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                As permissões serão aplicadas substituindo as configurações atuais dos usuários selecionados.
              </p>
            </div>
          </div>
        );
      
      case 'export':
        return (
          <div className="space-y-4">
            <Select
              label="Formato de Exportação"
              options={[
                { value: 'csv', label: 'CSV (Excel)' },
                { value: 'pdf', label: 'PDF' },
                { value: 'json', label: 'JSON' }
              ]}
              value={actionData?.format || 'csv'}
              onChange={(value) => setActionData({ ...actionData, format: value })}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Campos a Exportar:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Nome', 'Email', 'Departamento', 'Função', 'Status', 'Data Criação']?.map((field) => (
                  <label key={field} className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>{field}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'delete':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-error">Ação Irreversível</h4>
                  <p className="text-xs text-error/80 mt-1">
                    Esta ação excluirá permanentemente {selectedUsers?.length} usuário(s) e todos os dados associados.
                  </p>
                </div>
              </div>
            </div>
            <Input
              label="Digite 'CONFIRMAR' para prosseguir"
              type="text"
              value={actionData?.confirmation || ''}
              onChange={(e) => setActionData({ ...actionData, confirmation: e?.target?.value })}
              placeholder="CONFIRMAR"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const canExecute = () => {
    switch (activeAction) {
      case 'status':
        return actionData?.status;
      case 'department':
        return actionData?.department;
      case 'role':
        return actionData?.role;
      case 'permissions':
        return actionData?.template;
      case 'export':
        return actionData?.format;
      case 'delete':
        return actionData?.confirmation === 'CONFIRMAR';
      default:
        return false;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-enterprise-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Ações em Lote</h2>
          <p className="text-sm text-muted-foreground">
            {selectedUsers?.length} usuário(s) selecionado(s)
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          iconName="X"
          iconSize={16}
        />
      </div>
      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Selecione uma Ação
          </label>
          <div className="grid grid-cols-2 gap-2">
            {bulkActions?.map((action) => (
              <button
                key={action?.value}
                onClick={() => handleActionChange(action?.value)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-enterprise ${
                  activeAction === action?.value
                    ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Icon name={action?.icon} size={16} />
                <span className="text-sm font-medium">{action?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Form */}
        {activeAction && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Configurar Ação: {bulkActions?.find(a => a?.value === activeAction)?.label}
            </h3>
            {renderActionForm()}
          </div>
        )}

        {/* Selected Users Preview */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Usuários Selecionados</h3>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedUsers?.slice(0, 5)?.map((userId) => (
              <div key={userId} className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon name="User" size={12} />
                <span>Usuário ID: {userId}</span>
              </div>
            ))}
            {selectedUsers?.length > 5 && (
              <p className="text-xs text-muted-foreground">
                ... e mais {selectedUsers?.length - 5} usuário(s)
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant={activeAction === 'delete' ? 'destructive' : 'default'}
          disabled={!canExecute()}
          onClick={handleExecute}
          iconName={activeAction === 'delete' ? 'Trash2' : 'Play'}
          iconPosition="left"
        >
          {activeAction === 'delete' ? 'Excluir Usuários' : 'Executar Ação'}
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsPanel;