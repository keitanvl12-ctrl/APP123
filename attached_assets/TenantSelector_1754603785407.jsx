import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const TenantSelector = ({ onTenantChange, selectedTenant, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock tenant data - in real app this would come from API
  const tenantOptions = [
    {
      value: 'empresa-matriz',
      label: 'Empresa Matriz',
      description: 'Sede principal - São Paulo'
    },
    {
      value: 'filial-rj',
      label: 'Filial Rio de Janeiro',
      description: 'Unidade RJ - Centro'
    },
    {
      value: 'filial-mg',
      label: 'Filial Minas Gerais',
      description: 'Unidade BH - Savassi'
    },
    {
      value: 'filial-rs',
      label: 'Filial Rio Grande do Sul',
      description: 'Unidade POA - Centro'
    }
  ];

  const handleTenantChange = (value) => {
    const tenant = tenantOptions?.find(t => t?.value === value);
    onTenantChange(tenant);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Building2" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Organização</span>
        </div>
        
        <button
          type="button"
          onClick={toggleExpanded}
          className="text-xs text-muted-foreground hover:text-foreground transition-enterprise"
          disabled={isLoading}
        >
          {isExpanded ? 'Ocultar opções' : 'Ver todas'}
        </button>
      </div>
      {/* Tenant Selector */}
      <Select
        label="Selecione sua empresa"
        description="Escolha a organização para fazer login"
        placeholder="Selecione uma empresa..."
        options={tenantOptions}
        value={selectedTenant?.value || ''}
        onChange={handleTenantChange}
        disabled={isLoading}
        searchable={tenantOptions?.length > 5}
        required
        className="transition-enterprise"
      />
      {/* Selected Tenant Info */}
      {selectedTenant && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
              <Icon name="Building2" size={16} className="text-primary" />
            </div>
            
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-medium text-foreground">{selectedTenant?.label}</h4>
              <p className="text-xs text-muted-foreground">{selectedTenant?.description}</p>
              
              {/* Tenant Features */}
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={10} />
                  <span>Multi-usuário</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Shield" size={10} />
                  <span>SSO Ativo</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Database" size={10} />
                  <span>Backup Diário</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Expanded Options */}
      {isExpanded && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Organizações Disponíveis
          </h5>
          
          <div className="grid gap-2">
            {tenantOptions?.map((tenant) => (
              <button
                key={tenant?.value}
                onClick={() => handleTenantChange(tenant?.value)}
                disabled={isLoading}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg border transition-enterprise text-left
                  ${selectedTenant?.value === tenant?.value
                    ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-6 h-6 rounded
                  ${selectedTenant?.value === tenant?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  <Icon name="Building2" size={12} />
                </div>
                
                <div className="flex-1">
                  <div className="text-sm font-medium">{tenant?.label}</div>
                  <div className="text-xs text-muted-foreground">{tenant?.description}</div>
                </div>
                
                {selectedTenant?.value === tenant?.value && (
                  <Icon name="Check" size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Help Text */}
      <div className="text-xs text-muted-foreground text-center">
        Não encontra sua empresa? Entre em contato com o administrador do sistema
      </div>
    </div>
  );
};

export default TenantSelector;