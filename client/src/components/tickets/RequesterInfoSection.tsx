import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/AppIcon';

interface Client {
  id: string;
  name: string;
  document: string;
}

interface Unit {
  id: string;
  clientId: string;
  name: string;
  address: string;
}

interface Department {
  id: string;
  unitId: string;
  name: string;
  description: string;
}

interface RequesterInfoSectionProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
  errors: any;
  clients: Client[];
  units: Unit[];
  departments: Department[];
  isLoadingClients: boolean;
}

export default function RequesterInfoSection({
  formData,
  onFormChange,
  errors,
  clients,
  units,
  departments,
  isLoadingClients
}: RequesterInfoSectionProps) {
  const handleInputChange = (field: string, value: any) => {
    onFormChange(field, value);
  };

  const filteredUnits = formData?.client ? units?.filter(unit => unit?.clientId === formData?.client) : [];
  const filteredDepartments = formData?.unit ? departments?.filter(dept => dept?.unitId === formData?.unit) : [];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon name="User" size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Informações do Solicitante
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dados do usuário que está solicitando o atendimento
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Nome Completo *
            </label>
            <Input
              type="text"
              placeholder="Digite o nome completo"
              value={formData?.requesterName || ''}
              onChange={(e) => handleInputChange('requesterName', e?.target?.value)}
              className={`w-full ${errors?.requesterName ? 'border-red-500' : ''}`}
            />
            {errors?.requesterName && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors?.requesterName}
              </p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              E-mail *
            </label>
            <Input
              type="email"
              placeholder="usuario@empresa.com"
              value={formData?.requesterEmail || ''}
              onChange={(e) => handleInputChange('requesterEmail', e?.target?.value)}
              className={`w-full ${errors?.requesterEmail ? 'border-red-500' : ''}`}
            />
            {errors?.requesterEmail && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors?.requesterEmail}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Telefone
            </label>
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData?.requesterPhone || ''}
              onChange={(e) => handleInputChange('requesterPhone', e?.target?.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Ramal (Opcional)
            </label>
            <Input
              type="text"
              placeholder="1234"
              value={formData?.requesterExtension || ''}
              onChange={(e) => handleInputChange('requesterExtension', e?.target?.value)}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Cliente *
          </label>
          <Select 
            value={formData?.client || ''} 
            onValueChange={(value) => {
              handleInputChange('client', value);
              handleInputChange('unit', '');
              handleInputChange('department', '');
            }}
          >
            <SelectTrigger className={errors?.client ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map(client => (
                <SelectItem key={client?.id} value={client?.id}>
                  <div>
                    <div className="font-medium">{client?.name}</div>
                    <div className="text-xs text-slate-500">{client?.document}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.client && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors?.client}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Unidade *
            </label>
            <Select 
              value={formData?.unit || ''} 
              onValueChange={(value) => {
                handleInputChange('unit', value);
                handleInputChange('department', '');
              }}
              disabled={!formData?.client}
            >
              <SelectTrigger className={errors?.unit ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {filteredUnits?.map(unit => (
                  <SelectItem key={unit?.id} value={unit?.id}>
                    <div>
                      <div className="font-medium">{unit?.name}</div>
                      <div className="text-xs text-slate-500">{unit?.address}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.unit && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors?.unit}
              </p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Departamento *
            </label>
            <Select 
              value={formData?.department || ''} 
              onValueChange={(value) => handleInputChange('department', value)}
              disabled={!formData?.unit}
            >
              <SelectTrigger className={errors?.department ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o departamento" />
              </SelectTrigger>
              <SelectContent>
                {filteredDepartments?.map(dept => (
                  <SelectItem key={dept?.id} value={dept?.id}>
                    <div>
                      <div className="font-medium">{dept?.name}</div>
                      <div className="text-xs text-slate-500">{dept?.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.department && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors?.department}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}