import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/AppIcon';

interface Operator {
  id: string;
  name: string;
  department: string;
  specialties: string[];
  currentTickets: number;
  status: 'online' | 'busy' | 'offline';
  serviceDeskId: string;
}

interface ServiceDesk {
  id: string;
  name: string;
  activeOperators: number;
  defaultSla: number;
}

interface AssignmentControlsProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
  errors: any;
  operators: Operator[];
  serviceDesks: ServiceDesk[];
  userRole: string;
}

export default function AssignmentControls({
  formData,
  onFormChange,
  errors,
  operators,
  serviceDesks,
  userRole
}: AssignmentControlsProps) {
  const handleInputChange = (field: string, value: any) => {
    onFormChange(field, value);
  };

  const filteredOperators = formData?.serviceDesk ? 
    operators?.filter(op => op?.serviceDeskId === formData?.serviceDesk) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'busy': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return 'CheckCircle';
      case 'busy': return 'Clock';
      case 'offline': return 'XCircle';
      default: return 'Circle';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <Icon name="Users" size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Atribuição e Roteamento
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure como o chamado será distribuído e tratado
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Service Desk Selection */}
        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Mesa de Atendimento *
          </label>
          <Select 
            value={formData?.serviceDesk || ''} 
            onValueChange={(value) => {
              handleInputChange('serviceDesk', value);
              handleInputChange('assignedOperator', '');
            }}
          >
            <SelectTrigger className={errors?.serviceDesk ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione a mesa de atendimento" />
            </SelectTrigger>
            <SelectContent>
              {serviceDesks?.map(desk => (
                <SelectItem key={desk?.id} value={desk?.id}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{desk?.name}</div>
                      <div className="text-xs text-slate-500">
                        {desk?.activeOperators} operadores ativos • SLA padrão: {desk?.defaultSla}h
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.serviceDesk && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors?.serviceDesk}
            </p>
          )}
        </div>

        {/* Assignment Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Atribuição Automática
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sistema escolhe automaticamente o melhor operador disponível
              </p>
            </div>
            <Switch
              checked={formData?.autoAssign || false}
              onCheckedChange={(checked) => {
                handleInputChange('autoAssign', checked);
                if (checked) {
                  handleInputChange('assignedOperator', '');
                }
              }}
            />
          </div>

          {/* Manual Assignment */}
          {!formData?.autoAssign && (
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                Operador Específico
              </label>
              <Select 
                value={formData?.assignedOperator || ''} 
                onValueChange={(value) => handleInputChange('assignedOperator', value)}
                disabled={!formData?.serviceDesk || formData?.autoAssign}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um operador (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <span className="text-slate-500">Deixar para distribuição automática</span>
                  </SelectItem>
                  {filteredOperators?.map(operator => (
                    <SelectItem key={operator?.id} value={operator?.id}>
                      <div className="flex items-center space-x-3 w-full">
                        <Icon 
                          name={getStatusIcon(operator?.status) as any} 
                          size={12} 
                          className={getStatusColor(operator?.status)} 
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{operator?.name}</span>
                            <span className="text-xs text-slate-500">
                              {operator?.currentTickets} chamados
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {operator?.department} • {operator?.specialties?.join(', ')}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
            Configurações Avançadas
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Notificação por E-mail
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Enviar e-mail para o solicitante quando o chamado for criado
                </p>
              </div>
              <Switch
                checked={formData?.emailNotification !== false}
                onCheckedChange={(checked) => handleInputChange('emailNotification', checked)}
              />
            </div>

            {userRole === 'admin' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Chamado Interno
                    </label>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Marcar como chamado interno da equipe
                    </p>
                  </div>
                  <Switch
                    checked={formData?.internalTicket || false}
                    onCheckedChange={(checked) => handleInputChange('internalTicket', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Pular Validações
                    </label>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ignorar algumas validações automáticas do sistema
                    </p>
                  </div>
                  <Switch
                    checked={formData?.skipValidations || false}
                    onCheckedChange={(checked) => handleInputChange('skipValidations', checked)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Auto Assignment Preview */}
        {formData?.autoAssign && formData?.serviceDesk && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start space-x-3">
              <Icon name="Cpu" size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                  Critérios de Atribuição Automática
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Especialidade do operador na categoria selecionada</li>
                  <li>• Carga atual de trabalho (número de chamados em aberto)</li>
                  <li>• Status de disponibilidade (online/ocupado)</li>
                  <li>• Balanceamento de carga entre a equipe</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Operator Availability */}
        {formData?.serviceDesk && !formData?.autoAssign && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="flex items-center space-x-3 mb-3">
              <Icon name="Users" size={16} className="text-slate-600 dark:text-slate-400" />
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Status da Equipe
              </h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {filteredOperators?.filter(op => op?.status === 'online')?.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Disponíveis</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {filteredOperators?.filter(op => op?.status === 'busy')?.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Ocupados</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                  {filteredOperators?.reduce((acc, op) => acc + op?.currentTickets, 0)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Chamados Ativos</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {Math.round(filteredOperators?.reduce((acc, op) => acc + op?.currentTickets, 0) / Math.max(filteredOperators?.length, 1))}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Média por Operador</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}