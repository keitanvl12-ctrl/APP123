import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CategorizationSection = ({ 
  formData, 
  onFormChange, 
  errors, 
  categories, 
  subjects, 
  ticketTypes,
  priorities 
}) => {
  const handleInputChange = (field, value) => {
    onFormChange(field, value);
  };

  const filteredSubjects = formData?.category ? subjects?.filter(subject => subject?.categoryId === formData?.category) : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return 'AlertTriangle';
      case 'high': return 'ArrowUp';
      case 'medium': return 'Minus';
      case 'low': return 'ArrowDown';
      default: return 'Circle';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-enterprise">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
          <Icon name="Tag" size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Categorização</h2>
          <p className="text-sm text-muted-foreground">Classifique o tipo e prioridade do chamado</p>
        </div>
      </div>
      <div className="space-y-4">
        <Select
          label="Categoria"
          placeholder="Selecione a categoria"
          options={categories?.map(category => ({
            value: category?.id,
            label: category?.name,
            description: category?.description
          }))}
          value={formData?.category || ''}
          onChange={(value) => {
            handleInputChange('category', value);
            handleInputChange('subject', '');
          }}
          error={errors?.category}
          required
          searchable
          className="w-full"
        />

        <Select
          label="Assunto"
          placeholder="Selecione o assunto"
          options={filteredSubjects?.map(subject => ({
            value: subject?.id,
            label: subject?.name,
            description: subject?.description
          }))}
          value={formData?.subject || ''}
          onChange={(value) => handleInputChange('subject', value)}
          error={errors?.subject}
          required
          disabled={!formData?.category}
          searchable
          className="w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo do Chamado"
            placeholder="Selecione o tipo"
            options={ticketTypes?.map(type => ({
              value: type?.id,
              label: type?.name,
              description: type?.description
            }))}
            value={formData?.ticketType || ''}
            onChange={(value) => handleInputChange('ticketType', value)}
            error={errors?.ticketType}
            required
            className="w-full"
          />

          <Select
            label="Prioridade"
            placeholder="Selecione a prioridade"
            options={priorities?.map(priority => ({
              value: priority?.id,
              label: (
                <div className="flex items-center space-x-2">
                  <Icon name={getPriorityIcon(priority?.level)} size={16} className={getPriorityColor(priority?.level)} />
                  <span>{priority?.name}</span>
                </div>
              ),
              description: priority?.description
            }))}
            value={formData?.priority || ''}
            onChange={(value) => handleInputChange('priority', value)}
            error={errors?.priority}
            required
            className="w-full"
          />
        </div>

        {formData?.priority && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Informações sobre a Prioridade</h4>
                <p className="text-sm text-muted-foreground">
                  {priorities?.find(p => p?.id === formData?.priority)?.slaInfo || 'SLA padrão será aplicado conforme configuração do sistema.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorizationSection;