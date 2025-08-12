import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const RequesterInfoSection = ({ 
  formData, 
  onFormChange, 
  errors, 
  clients, 
  units, 
  departments,
  isLoadingClients 
}) => {
  const handleInputChange = (field, value) => {
    onFormChange(field, value);
  };

  const filteredUnits = formData?.client ? units?.filter(unit => unit?.clientId === formData?.client) : [];
  const filteredDepartments = formData?.unit ? departments?.filter(dept => dept?.unitId === formData?.unit) : [];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-enterprise">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="User" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Informações do Solicitante</h2>
          <p className="text-sm text-muted-foreground">Dados do usuário que está solicitando o atendimento</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            type="text"
            placeholder="Digite o nome completo"
            value={formData?.requesterName || ''}
            onChange={(e) => handleInputChange('requesterName', e?.target?.value)}
            error={errors?.requesterName}
            required
            className="w-full"
          />
          
          <Input
            label="E-mail"
            type="email"
            placeholder="usuario@empresa.com"
            value={formData?.requesterEmail || ''}
            onChange={(e) => handleInputChange('requesterEmail', e?.target?.value)}
            error={errors?.requesterEmail}
            required
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData?.requesterPhone || ''}
            onChange={(e) => handleInputChange('requesterPhone', e?.target?.value)}
            error={errors?.requesterPhone}
            className="w-full"
          />
          
          <Input
            label="Ramal (Opcional)"
            type="text"
            placeholder="1234"
            value={formData?.requesterExtension || ''}
            onChange={(e) => handleInputChange('requesterExtension', e?.target?.value)}
            className="w-full"
          />
        </div>

        <Select
          label="Cliente"
          placeholder="Selecione o cliente"
          options={clients?.map(client => ({
            value: client?.id,
            label: client?.name,
            description: client?.document
          }))}
          value={formData?.client || ''}
          onChange={(value) => {
            handleInputChange('client', value);
            handleInputChange('unit', '');
            handleInputChange('department', '');
          }}
          error={errors?.client}
          required
          searchable
          loading={isLoadingClients}
          className="w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Unidade"
            placeholder="Selecione a unidade"
            options={filteredUnits?.map(unit => ({
              value: unit?.id,
              label: unit?.name,
              description: unit?.address
            }))}
            value={formData?.unit || ''}
            onChange={(value) => {
              handleInputChange('unit', value);
              handleInputChange('department', '');
            }}
            error={errors?.unit}
            required
            disabled={!formData?.client}
            searchable
            className="w-full"
          />
          
          <Select
            label="Departamento"
            placeholder="Selecione o departamento"
            options={filteredDepartments?.map(dept => ({
              value: dept?.id,
              label: dept?.name,
              description: dept?.description
            }))}
            value={formData?.department || ''}
            onChange={(value) => handleInputChange('department', value)}
            error={errors?.department}
            required
            disabled={!formData?.unit}
            searchable
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default RequesterInfoSection;