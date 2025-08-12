import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AssignmentControls = ({ 
  formData, 
  onFormChange, 
  errors, 
  operators, 
  serviceDesks,
  userRole 
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleInputChange = (field, value) => {
    onFormChange(field, value);
  };

  const isManager = userRole === 'manager' || userRole === 'admin';

  const getOperatorAvatar = (operatorId) => {
    const operator = operators?.find(op => op?.id === operatorId);
    return operator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${operatorId}`;
  };

  const getOperatorStatus = (operatorId) => {
    const operator = operators?.find(op => op?.id === operatorId);
    return operator?.status || 'offline';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredOperators = formData?.serviceDesk 
    ? operators?.filter(op => op?.serviceDeskId === formData?.serviceDesk)
    : operators;

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-enterprise">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg">
            <Icon name="UserCheck" size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Atribuição e Roteamento</h2>
            <p className="text-sm text-muted-foreground">Configure quem será responsável pelo atendimento</p>
          </div>
        </div>

        {isManager && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            iconName={showAdvancedOptions ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            iconSize={16}
          >
            Opções Avançadas
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <Select
          label="Mesa de Atendimento"
          placeholder="Selecione a mesa de atendimento"
          options={serviceDesks?.map(desk => ({
            value: desk?.id,
            label: desk?.name,
            description: `${desk?.activeOperators} operadores ativos • SLA: ${desk?.defaultSla}h`
          }))}
          value={formData?.serviceDesk || ''}
          onChange={(value) => {
            handleInputChange('serviceDesk', value);
            handleInputChange('assignedOperator', '');
          }}
          error={errors?.serviceDesk}
          required
          className="w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Operador Responsável"
            placeholder="Atribuição automática"
            options={filteredOperators?.map(operator => ({
              value: operator?.id,
              label: (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={getOperatorAvatar(operator?.id)}
                      alt={operator?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(getOperatorStatus(operator?.id))}`}></div>
                  </div>
                  <div>
                    <span className="font-medium">{operator?.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({operator?.currentTickets} tickets)</span>
                  </div>
                </div>
              ),
              description: `${operator?.department} • ${operator?.specialties?.join(', ')}`
            }))}
            value={formData?.assignedOperator || ''}
            onChange={(value) => handleInputChange('assignedOperator', value)}
            error={errors?.assignedOperator}
            disabled={!formData?.serviceDesk}
            searchable
            className="w-full"
          />

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Opções de Atribuição</label>
            
            <Checkbox
              label="Atribuição automática"
              description="Sistema escolhe o melhor operador disponível"
              checked={formData?.autoAssign || false}
              onChange={(e) => handleInputChange('autoAssign', e?.target?.checked)}
            />
            
            <Checkbox
              label="Notificar por email"
              description="Enviar notificação para o operador atribuído"
              checked={formData?.emailNotification || true}
              onChange={(e) => handleInputChange('emailNotification', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Advanced Options for Managers */}
        {isManager && showAdvancedOptions && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-4">Configurações Avançadas</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="SLA Personalizado"
                placeholder="Usar SLA padrão"
                options={[
                  { value: '1', label: '1 hora', description: 'Crítico' },
                  { value: '4', label: '4 horas', description: 'Alto' },
                  { value: '8', label: '8 horas', description: 'Médio' },
                  { value: '24', label: '24 horas', description: 'Baixo' },
                  { value: '72', label: '72 horas', description: 'Planejado' }
                ]}
                value={formData?.customSla || ''}
                onChange={(value) => handleInputChange('customSla', value)}
                className="w-full"
              />

              <Select
                label="Roteamento Especial"
                placeholder="Roteamento padrão"
                options={[
                  { value: 'escalation', label: 'Escalação Automática', description: 'Escala se não atendido em 2h' },
                  { value: 'round_robin', label: 'Round Robin', description: 'Distribui igualmente entre operadores' },
                  { value: 'skill_based', label: 'Por Especialidade', description: 'Baseado nas competências' },
                  { value: 'workload', label: 'Por Carga de Trabalho', description: 'Menor número de tickets' }
                ]}
                value={formData?.routingRule || ''}
                onChange={(value) => handleInputChange('routingRule', value)}
                className="w-full"
              />
            </div>

            <div className="mt-4 space-y-3">
              <Checkbox
                label="Criar múltiplos tickets"
                description="Permite criação em lote com as mesmas configurações"
                checked={formData?.bulkCreation || false}
                onChange={(e) => handleInputChange('bulkCreation', e?.target?.checked)}
              />
              
              <Checkbox
                label="Pular validações automáticas"
                description="Bypass de verificações de duplicatas e regras de negócio"
                checked={formData?.skipValidations || false}
                onChange={(e) => handleInputChange('skipValidations', e?.target?.checked)}
              />
              
              <Checkbox
                label="Ticket interno"
                description="Visível apenas para operadores e administradores"
                checked={formData?.internalTicket || false}
                onChange={(e) => handleInputChange('internalTicket', e?.target?.checked)}
              />
            </div>
          </div>
        )}

        {/* Assignment Preview */}
        {(formData?.serviceDesk || formData?.assignedOperator) && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Resumo da Atribuição</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {formData?.serviceDesk && (
                    <p>• Mesa: {serviceDesks?.find(d => d?.id === formData?.serviceDesk)?.name}</p>
                  )}
                  {formData?.assignedOperator ? (
                    <p>• Operador: {operators?.find(o => o?.id === formData?.assignedOperator)?.name}</p>
                  ) : (
                    <p>• Atribuição: Automática baseada na disponibilidade</p>
                  )}
                  {formData?.customSla && (
                    <p>• SLA: {formData?.customSla} horas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentControls;