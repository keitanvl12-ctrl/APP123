import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, User, FileText, Calendar, AlertCircle,
  CheckCircle, Building2, Tag, MessageCircle, UserPlus,
  Edit, Trash2, Settings, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketModalProps {
  ticket: any;
  children: React.ReactNode;
  onUpdate?: (ticket: any) => void;
  onEdit?: (ticket: any) => void;
  onDelete?: (ticketId: string) => void;
  userRole?: string;
}

export default function TicketModal({ ticket, children, onUpdate, onEdit, onDelete, userRole = 'admin' }: TicketModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    subject: '',
    description: '',
    priority: '',
    status: '',
    assignedTo: 'unassigned'
  });
  const [users, setUsers] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o ticket ${ticket.ticketNumber}? Esta ação não pode ser desfeita.`)) {
      try {
        const response = await fetch(`/api/tickets/${ticket.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          toast({
            title: "Ticket excluído",
            description: "O ticket foi excluído com sucesso."
          });
          setIsOpen(false);
          onDelete?.(ticket.id);
        } else {
          throw new Error('Falha ao excluir ticket');
        }
      } catch (error) {
        console.error('Erro ao excluir ticket:', error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o ticket. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEdit = () => {
    setEditData({
      subject: ticket.subject || '',
      description: ticket.description || '',
      priority: ticket.priority || '',
      status: ticket.status || '',
      assignedTo: ticket.assignedTo || 'unassigned'
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Preparar dados com assignedTo tratado corretamente
      const dataToSend = {
        ...editData,
        assignedTo: editData.assignedTo === 'unassigned' ? null : editData.assignedTo
      };
      
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        toast({
          title: "Ticket atualizado",
          description: "O ticket foi atualizado com sucesso."
        });
        setIsEditing(false);
        if (onUpdate) {
          onUpdate();
        }
        // Fechar o modal
        setIsOpen(false);
      } else {
        throw new Error('Falha ao atualizar ticket');
      }
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o ticket. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      subject: ticket.subject || '',
      description: ticket.description || '',
      priority: ticket.priority || '',
      status: ticket.status || '',
      assignedTo: ticket.assignedTo || 'unassigned'
    });
  };

  // Buscar campos customizados e usuários quando o modal abrir
  useEffect(() => {
    if (isOpen && ticket?.id) {
      setLoading(true);
      console.log("🔍 Buscando campos customizados para:", ticket.ticketNumber);
      console.log("📋 Subcategoria do ticket:", ticket.subcategoryId);
      
      // Função para tentar buscar campos via fallback usando todos os campos
      const tryFallbackFieldMapping = async () => {
        try {
          const response = await fetch('/api/custom-fields', { credentials: 'include' });
          const allFields = await response.json();
          console.log("📦 Buscando via fallback - todos os campos:", allFields);
          
          if (ticket.formData) {
            const formData = typeof ticket.formData === 'string' ? JSON.parse(ticket.formData) : ticket.formData;
            const customFields = formData.customFields || formData.originalRequestBody?.customFields || {};
            
            const mappedFields = Object.entries(customFields)
              .filter(([_, value]) => value && value !== '')
              .map(([fieldId, value]) => {
                const field = allFields.find((f: any) => f.id === fieldId);
                if (field) {
                  return {
                    customField: field,
                    value: String(value)
                  };
                } else {
                  console.warn(`⚠️ Campo não encontrado no banco: ${fieldId}, pulando...`);
                  return null;
                }
              })
              .filter(field => field !== null); // Remove campos não encontrados
            
            console.log("✅ Campos mapeados via fallback:", mappedFields);
            setCustomFields(mappedFields);
          } else {
            setCustomFields([]);
          }
        } catch (error) {
          console.error("❌ Erro no fallback:", error);
          setCustomFields([]);
        }
        setLoading(false);
      };

      // Buscar campos customizados baseados na subcategoria do ticket
      if (ticket.subcategoryId) {
        fetch(`/api/custom-fields/subcategory/${ticket.subcategoryId}`, {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(fields => {
            console.log("✅ Campos customizados da subcategoria encontrados:", fields);
            
            if (fields.length > 0) {
              // Extrair valores dos campos customizados do formData do ticket
              try {
                const formData = ticket.formData ? (typeof ticket.formData === 'string' ? JSON.parse(ticket.formData) : ticket.formData) : {};
                const customFieldsData = formData.customFields || formData.originalRequestBody?.customFields || {};
                
                // Mapear apenas os campos que têm valores preenchidos
                const fieldsWithValues = fields
                  .map(field => ({
                    customField: field,
                    value: customFieldsData[field.id]
                  }))
                  .filter(item => item.value && item.value !== '' && item.value !== null && item.value !== undefined);
                
                console.log("✅ Campos mapeados com valores do formData:", fieldsWithValues);
                setCustomFields(fieldsWithValues);
                setLoading(false);
              } catch (error) {
                console.error("❌ Erro ao processar formData, tentando fallback:", error);
                tryFallbackFieldMapping();
              }
            } else {
              // Se não encontrou campos na subcategoria, tentar fallback
              console.log("⚠️ Nenhum campo na subcategoria, tentando fallback");
              tryFallbackFieldMapping();
            }
          })
          .catch(err => {
            console.error("❌ Erro ao buscar campos da subcategoria, tentando fallback:", err);
            tryFallbackFieldMapping();
          });
      } else {
        console.log("ℹ️ Ticket sem subcategoria definida, tentando fallback");
        tryFallbackFieldMapping();
      }

      // Buscar usuários atribuíveis (não solicitantes)
      fetch('/api/users/assignable', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          console.log("✅ Usuários atribuíveis encontrados:", data);
          setUsers(data || []);
        })
        .catch(err => {
          console.error("❌ Erro ao buscar usuários atribuíveis:", err);
          setUsers([]);
        });
    }
  }, [isOpen, ticket?.id]);

  // Timer para atualizar o SLA em tempo real (apenas para tickets não pausados e não resolvidos)
  useEffect(() => {
    if (!isOpen || !ticket?.id || ticket.status === 'resolved' || ticket.status === 'on_hold') {
      return;
    }

    const interval = setInterval(() => {
      console.log('📊 Atualizando progresso SLA para ticket:', ticket.ticketNumber);
      // Forçar reload de tickets do Kanban para pegar progresso atualizado
      if (onUpdate) {
        onUpdate();
      }
    }, 15000); // Atualizar a cada 15 segundos

    return () => clearInterval(interval);
  }, [isOpen, ticket?.id, ticket?.status, onUpdate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Não definida';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'A Fazer';
      case 'in_progress': return 'Atendendo';
      case 'on_hold': return 'Pausado';
      case 'resolved': return 'Resolvido';
      default: return 'Desconhecido';
    }
  };

  if (!ticket) return <>{children}</>;

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pr-8">
            <DialogTitle className="flex justify-between items-start">
              <div className="flex flex-col space-y-2">
                <span className="text-xl font-semibold">Chamado {ticket.ticketNumber}</span>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                </div>
              </div>
              
              {/* Botões de Ação - Apenas para Administradores */}
              {userRole === 'admin' && (
                <div className="flex items-center space-x-2 mt-2">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveEdit}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Salvar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Principais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Informações Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Título</label>
                  {isEditing ? (
                    <Input
                      value={editData.subject}
                      onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{ticket.subject}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Descrição</label>
                  {isEditing ? (
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{ticket.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Prioridade</label>
                    {isEditing ? (
                      <Select 
                        value={editData.priority} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`${getPriorityColor(ticket.priority)} mt-1`}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    {isEditing ? (
                      <Select 
                        value={editData.status} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">A Fazer</SelectItem>
                          <SelectItem value="in_progress">Atendendo</SelectItem>
                          <SelectItem value="on_hold">Pausado</SelectItem>
                          <SelectItem value="resolved">Resolvido</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`${getStatusColor(ticket.status)} mt-1`}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Categoria</label>
                    <p className="text-sm text-gray-900">{ticket.categoryName || 'Não informada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subcategoria</label>
                    <p className="text-sm text-gray-900">{ticket.subcategoryName || 'Não informada'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Departamento Solicitante</label>
                    <p className="text-sm text-gray-900">{ticket.requesterDepartment?.name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Departamento Responsável</label>
                    <p className="text-sm text-gray-900">{ticket.responsibleDepartment?.name || 'TI'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CAMPOS CUSTOMIZADOS - SEÇÃO DESTACADA */}
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader className="bg-blue-100/50">
                <CardTitle className="text-lg font-semibold flex items-center text-blue-800">
                  <Tag className="w-5 h-5 mr-2" />
                  Informações Específicas da Subcategoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 mt-4">
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Carregando campos customizados...</p>
                  </div>
                ) : customFields.length > 0 ? (
                  <div className="space-y-4">
                    {customFields.map((field, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                        <label className="text-sm font-semibold text-blue-700 block mb-2">
                          {field.customField?.name || `Campo ${index + 1}`}:
                        </label>
                        <div className="bg-blue-50 p-3 rounded border">
                          <p className="text-sm text-blue-900 font-medium">
                            {field.value || 'Não informado'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Nenhum campo específico foi preenchido neste ticket.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Atribuições */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Atribuições
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Responsável</label>
                    {isEditing ? (
                      <Select 
                        value={editData.assignedTo} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, assignedTo: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Não atribuído</SelectItem>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-900">{ticket.assignedToUser?.name || 'Não atribuído'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Solicitante</label>
                    <p className="text-sm text-gray-900">{ticket.createdByUser?.name || 'Administrador'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Criação</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {format(new Date(ticket.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {ticket.tags && ticket.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ticket.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SLA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  SLA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progresso SLA</span>
                    <span className={`text-sm font-medium ${
                      ticket.slaStatus === 'violated' ? 'text-red-600' : 
                      (ticket.slaProgressPercent || 0) > 80 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {Math.round(ticket.slaProgressPercent || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div 
                      className={`h-2 rounded transition-all duration-300 ${
                        ticket.slaStatus === 'violated' ? 'bg-red-500' : 
                        (ticket.slaProgressPercent || 0) > 80 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(ticket.slaProgressPercent || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Meta: {ticket.slaHoursTotal || 4}h ({(ticket.slaSource || 'padrão').includes('regra SLA') ? 'configurado' : 'padrão'})</span>
                    <span>{ticket.slaStatus === 'violated' ? 'Vencido' : 'Dentro do prazo'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}