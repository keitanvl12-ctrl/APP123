import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/AppIcon';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Subject {
  id: string;
  categoryId: string;
  name: string;
  description: string;
}

interface TicketType {
  id: string;
  name: string;
  description: string;
}

interface Priority {
  id: string;
  name: string;
  level: string;
  description: string;
  slaInfo?: string;
}

interface CategorizationSectionProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
  errors: any;
  categories: Category[];
  subjects: Subject[];
  ticketTypes: TicketType[];
  priorities: Priority[];
}

export default function CategorizationSection({
  formData,
  onFormChange,
  errors,
  categories,
  subjects,
  ticketTypes,
  priorities
}: CategorizationSectionProps) {
  const handleInputChange = (field: string, value: any) => {
    onFormChange(field, value);
  };

  const filteredSubjects = formData?.category ? subjects?.filter(subject => subject?.categoryId === formData?.category) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-slate-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return 'AlertTriangle';
      case 'high': return 'ArrowUp';
      case 'medium': return 'Minus';
      case 'low': return 'ArrowDown';
      default: return 'Circle';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Icon name="Tag" size={20} className="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Categorização
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Classifique o tipo e prioridade do chamado
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Categoria *
          </label>
          <Select 
            value={formData?.category || ''} 
            onValueChange={(value) => {
              handleInputChange('category', value);
              handleInputChange('subject', '');
            }}
          >
            <SelectTrigger className={errors?.category ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map(category => (
                <SelectItem key={category?.id} value={category?.id}>
                  <div>
                    <div className="font-medium">{category?.name}</div>
                    <div className="text-xs text-slate-500">{category?.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.category && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors?.category}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
            Assunto *
          </label>
          <Select 
            value={formData?.subject || ''} 
            onValueChange={(value) => handleInputChange('subject', value)}
            disabled={!formData?.category}
          >
            <SelectTrigger className={errors?.subject ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione o assunto" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubjects?.map(subject => (
                <SelectItem key={subject?.id} value={subject?.id}>
                  <div>
                    <div className="font-medium">{subject?.name}</div>
                    <div className="text-xs text-slate-500">{subject?.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.subject && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors?.subject}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Tipo do Chamado *
            </label>
            <Select 
              value={formData?.ticketType || ''} 
              onValueChange={(value) => handleInputChange('ticketType', value)}
            >
              <SelectTrigger className={errors?.ticketType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ticketTypes?.map(type => (
                  <SelectItem key={type?.id} value={type?.id}>
                    <div>
                      <div className="font-medium">{type?.name}</div>
                      <div className="text-xs text-slate-500">{type?.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.ticketType && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors?.ticketType}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
              Prioridade *
            </label>
            <Select 
              value={formData?.priority || ''} 
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger className={errors?.priority ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {priorities?.map(priority => (
                  <SelectItem key={priority?.id} value={priority?.id}>
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getPriorityIcon(priority?.level) as any} 
                        size={16} 
                        className={getPriorityColor(priority?.level)} 
                      />
                      <div>
                        <div className="font-medium">{priority?.name}</div>
                        <div className="text-xs text-slate-500">{priority?.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.priority && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors?.priority}
              </p>
            )}
          </div>
        </div>

        {formData?.priority && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                  Informações sobre a Prioridade
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {priorities?.find(p => p?.id === formData?.priority)?.slaInfo || 'SLA padrão será aplicado conforme configuração do sistema.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}