import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TicketModal = ({ ticket, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
    status: 'todo',
    assignedAgent: '',
    category: '',
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (ticket) {
      setFormData({
        subject: ticket?.subject || '',
        description: ticket?.description || '',
        priority: ticket?.priority || 'Medium',
        status: ticket?.status || 'todo',
        assignedAgent: ticket?.assignedAgent?.id || '',
        category: ticket?.category || '',
        tags: ticket?.tags || []
      });
    }
  }, [ticket]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ ...ticket, ...formData });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este ticket?')) {
      setIsLoading(true);
      try {
        await onDelete(ticket?.id);
        onClose();
      } catch (error) {
        console.error('Erro ao excluir ticket:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const priorityOptions = [
    { value: 'Low', label: 'Baixa' },
    { value: 'Medium', label: 'Média' },
    { value: 'High', label: 'Alta' },
    { value: 'Critical', label: 'Crítica' }
  ];

  const statusOptions = [
    { value: 'todo', label: 'A Fazer' },
    { value: 'attending', label: 'Em Atendimento' },
    { value: 'paused', label: 'Pausado' },
    { value: 'completed', label: 'Concluído' }
  ];

  const agentOptions = [
    { value: '', label: 'Não atribuído' },
    { value: 'ana.silva', label: 'Ana Silva' },
    { value: 'carlos.santos', label: 'Carlos Santos' },
    { value: 'maria.oliveira', label: 'Maria Oliveira' },
    { value: 'joao.ferreira', label: 'João Ferreira' }
  ];

  const categoryOptions = [
    { value: 'technical', label: 'Técnico' },
    { value: 'billing', label: 'Financeiro' },
    { value: 'general', label: 'Geral' },
    { value: 'feature', label: 'Funcionalidade' }
  ];

  const mockComments = [
    {
      id: 1,
      author: { name: 'Ana Silva', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
      content: 'Iniciando análise do problema reportado pelo cliente.',
      timestamp: new Date(Date.now() - 3600000),
      isInternal: false
    },
    {
      id: 2,
      author: { name: 'Carlos Santos', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
      content: 'Identificado problema na configuração do sistema. Aplicando correção.',
      timestamp: new Date(Date.now() - 1800000),
      isInternal: true
    }
  ];

  const mockHistory = [
    {
      id: 1,
      action: 'Ticket criado',
      user: 'Sistema',
      timestamp: new Date(Date.now() - 86400000),
      details: 'Ticket criado automaticamente via formulário web'
    },
    {
      id: 2,
      action: 'Status alterado',
      user: 'Ana Silva',
      timestamp: new Date(Date.now() - 7200000),
      details: 'De "A Fazer" para "Em Atendimento"'
    },
    {
      id: 3,
      action: 'Prioridade alterada',
      user: 'Carlos Santos',
      timestamp: new Date(Date.now() - 3600000),
      details: 'De "Média" para "Alta"'
    }
  ];

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-enterprise-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Ticket" size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Ticket #{ticket?.id}
              </h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket?.priority === 'Critical' ? 'bg-error text-error-foreground' :
              ticket?.priority === 'High' ? 'bg-warning text-warning-foreground' :
              ticket?.priority === 'Medium' ? 'bg-accent text-accent-foreground' :
              'bg-secondary text-secondary-foreground'
            }`}>
              {ticket?.priority}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            iconSize={20}
            onClick={onClose}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'details', label: 'Detalhes', icon: 'FileText' },
              { id: 'comments', label: 'Comentários', icon: 'MessageCircle' },
              { id: 'history', label: 'Histórico', icon: 'Clock' },
              { id: 'attachments', label: 'Anexos', icon: 'Paperclip' }
            ]?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span className="font-medium">{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Assunto"
                    value={formData?.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e?.target?.value })}
                    required
                  />
                  
                  <Select
                    label="Prioridade"
                    options={priorityOptions}
                    value={formData?.priority}
                    onChange={(value) => setFormData({ ...formData, priority: value })}
                  />
                  
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData?.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                  />
                </div>
                
                <div className="space-y-4">
                  <Select
                    label="Agente Responsável"
                    options={agentOptions}
                    value={formData?.assignedAgent}
                    onChange={(value) => setFormData({ ...formData, assignedAgent: value })}
                  />
                  
                  <Select
                    label="Categoria"
                    options={categoryOptions}
                    value={formData?.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Solicitante
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <Image
                        src={ticket?.requester?.avatar}
                        alt={ticket?.requester?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{ticket?.requester?.name}</p>
                        <p className="text-sm text-muted-foreground">{ticket?.requester?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData?.description}
                  onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Descreva o problema ou solicitação..."
                />
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {mockComments?.map((comment) => (
                <div key={comment?.id} className="flex space-x-3">
                  <Image
                    src={comment?.author?.avatar}
                    alt={comment?.author?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">{comment?.author?.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {comment?.timestamp?.toLocaleString('pt-BR')}
                      </span>
                      {comment?.isInternal && (
                        <span className="text-xs bg-warning text-warning-foreground px-2 py-1 rounded">
                          Interno
                        </span>
                      )}
                    </div>
                    <p className="text-foreground">{comment?.content}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-border pt-4">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Adicionar comentário..."
                />
                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-muted-foreground">Comentário interno</span>
                  </label>
                  <Button variant="default" size="sm">
                    Adicionar Comentário
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {mockHistory?.map((entry) => (
                <div key={entry?.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">{entry?.action}</span>
                      <span className="text-sm text-muted-foreground">por {entry?.user}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{entry?.details}</p>
                    <span className="text-xs text-muted-foreground">
                      {entry?.timestamp?.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="text-center py-8">
              <Icon name="Paperclip" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum anexo encontrado</p>
              <Button variant="outline" iconName="Upload" iconPosition="left">
                Adicionar Anexo
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <Button
              variant="destructive"
              iconName="Trash2"
              iconPosition="left"
              iconSize={16}
              onClick={handleDelete}
              disabled={isLoading}
            >
              Excluir
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              iconName="Save"
              iconPosition="left"
              iconSize={16}
              loading={isLoading}
              onClick={handleSave}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;