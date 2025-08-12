import React, { useState } from 'react';
import RequesterInfoSection from '@/components/tickets/RequesterInfoSection';
import CategorizationSection from '@/components/tickets/CategorizationSection';
import DescriptionEditor from '@/components/tickets/DescriptionEditor';
import FileAttachmentZone from '@/components/tickets/FileAttachmentZone';
import AssignmentControls from '@/components/tickets/AssignmentControls';
import FormActions from '@/components/tickets/FormActions';
import Icon from '@/components/AppIcon';

export default function CreateTicket() {
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterExtension: '',
    client: '',
    unit: '',
    department: '',
    category: '',
    subject: '',
    ticketType: '',
    priority: '',
    description: '',
    attachments: [],
    serviceDesk: '',
    assignedOperator: '',
    autoAssign: false,
    emailNotification: true,
    customSla: '',
    routingRule: '',
    bulkCreation: false,
    skipValidations: false,
    internalTicket: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock data
  const clients = [
    { id: '1', name: 'Empresa ABC Ltda', document: 'CNPJ: 12.345.678/0001-90' },
    { id: '2', name: 'Corporação XYZ S.A.', document: 'CNPJ: 98.765.432/0001-10' }
  ];

  const units = [
    { id: '1', clientId: '1', name: 'Matriz São Paulo', address: 'Av. Paulista, 1000' },
    { id: '2', clientId: '1', name: 'Filial Rio de Janeiro', address: 'Rua Copacabana, 500' },
    { id: '3', clientId: '2', name: 'Sede Brasília', address: 'SCS Quadra 1, Bloco A' }
  ];

  const departments = [
    { id: '1', unitId: '1', name: 'Tecnologia da Informação', description: 'Suporte técnico e infraestrutura' },
    { id: '2', unitId: '1', name: 'Recursos Humanos', description: 'Gestão de pessoas e processos' },
    { id: '3', unitId: '2', name: 'Comercial', description: 'Vendas e relacionamento' }
  ];

  const categories = [
    { id: '1', name: 'Hardware', description: 'Problemas com equipamentos físicos' },
    { id: '2', name: 'Software', description: 'Aplicações e sistemas' },
    { id: '3', name: 'Rede', description: 'Conectividade e infraestrutura' }
  ];

  const subjects = [
    { id: '1', categoryId: '1', name: 'Computador não liga', description: 'Problemas de inicialização' },
    { id: '2', categoryId: '1', name: 'Monitor sem imagem', description: 'Problemas de vídeo' },
    { id: '3', categoryId: '2', name: 'Erro no sistema', description: 'Falhas de aplicação' }
  ];

  const ticketTypes = [
    { id: '1', name: 'Incidente', description: 'Problema que afeta o serviço' },
    { id: '2', name: 'Solicitação', description: 'Pedido de serviço ou informação' },
    { id: '3', name: 'Mudança', description: 'Alteração em sistemas ou processos' }
  ];

  const priorities = [
    { id: '1', name: 'Baixa', level: 'low', description: 'Sem impacto significativo', slaInfo: 'SLA: 24 horas' },
    { id: '2', name: 'Média', level: 'medium', description: 'Impacto moderado', slaInfo: 'SLA: 8 horas' },
    { id: '3', name: 'Alta', level: 'high', description: 'Impacto alto', slaInfo: 'SLA: 4 horas' },
    { id: '4', name: 'Crítica', level: 'critical', description: 'Impacto crítico', slaInfo: 'SLA: 1 hora' }
  ];

  const operators = [
    { 
      id: '1', 
      name: 'João Silva', 
      department: 'TI', 
      specialties: ['Hardware', 'Rede'], 
      currentTickets: 5,
      status: 'online',
      serviceDeskId: '1'
    },
    { 
      id: '2', 
      name: 'Maria Santos', 
      department: 'Suporte', 
      specialties: ['Software', 'Aplicações'], 
      currentTickets: 3,
      status: 'busy',
      serviceDeskId: '1'
    }
  ];

  const serviceDesks = [
    { id: '1', name: 'Suporte Técnico', activeOperators: 8, defaultSla: 4 },
    { id: '2', name: 'Help Desk', activeOperators: 12, defaultSla: 2 }
  ];

  const templates = [
    { 
      id: '1', 
      name: 'Problema de Login', 
      description: 'Template para problemas de acesso ao sistema',
      content: 'Não consigo fazer login no sistema.\n\nInformações:\n• Sistema: \n• Mensagem de erro: \n• Horário do problema: '
    },
    { 
      id: '2', 
      name: 'Solicitação de Acesso', 
      description: 'Template para pedidos de acesso',
      content: 'Solicito acesso ao seguinte sistema/recurso:\n\nDetalhes:\n• Sistema/Recurso: \n• Justificativa: \n• Prazo necessário: '
    }
  ];

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.requesterName) newErrors.requesterName = 'Nome é obrigatório';
    if (!formData.requesterEmail) newErrors.requesterEmail = 'Email é obrigatório';
    if (!formData.client) newErrors.client = 'Cliente é obrigatório';
    if (!formData.unit) newErrors.unit = 'Unidade é obrigatória';
    if (!formData.department) newErrors.department = 'Departamento é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.subject) newErrors.subject = 'Assunto é obrigatório';
    if (!formData.ticketType) newErrors.ticketType = 'Tipo é obrigatório';
    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';
    if (!formData.description?.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.serviceDesk) newErrors.serviceDesk = 'Mesa de atendimento é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simular criação do ticket
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Ticket criado:', formData);
      
      // Reset form após sucesso
      setFormData({
        requesterName: '',
        requesterEmail: '',
        requesterPhone: '',
        requesterExtension: '',
        client: '',
        unit: '',
        department: '',
        category: '',
        subject: '',
        ticketType: '',
        priority: '',
        description: '',
        attachments: [],
        serviceDesk: '',
        assignedOperator: '',
        autoAssign: false,
        emailNotification: true,
        customSla: '',
        routingRule: '',
        bulkCreation: false,
        skipValidations: false,
        internalTicket: false
      });
      setHasUnsavedChanges(false);
      setErrors({});
      
      alert('Ticket criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      alert('Erro ao criar ticket. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    try {
      // Simular salvamento do rascunho
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Rascunho salvo:', formData);
      setHasUnsavedChanges(false);
      alert('Rascunho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente cancelar?')) {
        // Navegar para lista de tickets ou dashboard
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Criar Novo Chamado
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Preencha todas as informações para criar um novo ticket de suporte
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center space-x-4">
          <Icon name="FileText" size={20} className="text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Progresso do formulário:</span>
              <span className="font-medium">
                {Math.round((Object.values(formData).filter(v => v && v !== '').length / Object.keys(formData).length) * 100)}% preenchido
              </span>
            </div>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        {/* Requester Information */}
        <RequesterInfoSection
          formData={formData}
          onFormChange={handleFormChange}
          errors={errors}
          clients={clients}
          units={units}
          departments={departments}
          isLoadingClients={false}
        />

        {/* Categorization */}
        <CategorizationSection
          formData={formData}
          onFormChange={handleFormChange}
          errors={errors}
          categories={categories}
          subjects={subjects}
          ticketTypes={ticketTypes}
          priorities={priorities}
        />

        {/* Description */}
        <DescriptionEditor
          formData={formData}
          onFormChange={handleFormChange}
          errors={errors}
          templates={templates}
        />

        {/* File Attachments */}
        <FileAttachmentZone
          formData={formData}
          onFormChange={handleFormChange}
          errors={errors}
        />

        {/* Assignment Controls */}
        <AssignmentControls
          formData={formData}
          onFormChange={handleFormChange}
          errors={errors}
          operators={operators}
          serviceDesks={serviceDesks}
          userRole="admin"
        />

        {/* Form Actions */}
        <FormActions
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          isDraftSaving={isDraftSaving}
          formData={formData}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </form>
    </div>
  );
}