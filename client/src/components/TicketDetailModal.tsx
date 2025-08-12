import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, User, FileText, Calendar, AlertCircle,
  CheckCircle, Building2, Tag, MessageCircle, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface TicketDetailModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({ ticketId, isOpen, onClose }: TicketDetailModalProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados do ticket
  const { data: tickets = [], isLoading: ticketLoading } = useQuery({
    queryKey: ['/api/tickets'],
    enabled: isOpen && !!ticketId,
  });
  
  // Buscar usuários que podem ser atribuídos (com permissão para gerenciar tickets)
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/users/assignable'],
    enabled: isOpen && !!ticketId,
  });

  console.log("🔍 Users query result:", { users, usersLoading, count: users.length });
  
  const ticket = (tickets as any[])?.find((t: any) => t.id === ticketId);

  console.log("Ticket data:", ticket);
  console.log("Ticket assignedToUser:", ticket?.assignedToUser);
  console.log("FormData raw:", ticket?.formData);

  // Parse form data if available
  let parsedFormData = null;
  if (ticket?.formData) {
    try {
      parsedFormData = JSON.parse(ticket.formData);
      console.log("Parsed form data:", parsedFormData);
    } catch (error) {
      console.error("Error parsing form data:", error);
    }
  }

  // Mutation para atribuir responsável
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, assignedTo }: { ticketId: string; assignedTo: string | null }) => {
      console.log("🔄 Attempting assignment:", { ticketId, assignedTo });
      const result = await apiRequest(`/api/tickets/${ticketId}/assign`, 'PATCH', { assignedTo });
      console.log("✅ Assignment result:", result);
      // result is a Response object, need to parse it
      const data = await result.json();
      console.log("✅ Assignment result assignedToUser:", data?.assignedToUser);
      return data;
    },
    onSuccess: (data) => {
      console.log("🎉 Assignment mutation successful:", data);
      // Invalidate multiple cache keys to force refresh
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticketId] });
      queryClient.refetchQueries({ queryKey: ['/api/tickets'] });
      toast({
        title: "Responsável atribuído",
        description: "O ticket foi atribuído com sucesso.",
      });
      setIsAssigning(false);
    },
    onError: (error: any) => {
      console.error("Assignment mutation failed:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir responsável",
        variant: "destructive",
      });
    },
  });



  // Buscar comentários do ticket
  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ['/api/tickets', ticketId, 'comments'],
    enabled: isOpen && !!ticketId,
  });

  // Buscar configurações de status e prioridade
  const { data: statusConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/status'],
    enabled: isOpen,
  });

  // Mantido priorityConfigs apenas para exibir cores/nomes - NÃO para SLA
  const { data: priorityConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/priority'],
    enabled: isOpen,
  });

  // Buscar departamentos
  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: isOpen,
  });

  // Estado local para campos customizados - abordagem direta
  const [customFieldValues, setCustomFieldValues] = useState<any[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
  
  // Buscar campos customizados diretamente quando o modal abrir
  useEffect(() => {
    if (isOpen && ticketId) {
      setCustomFieldsLoading(true);
      console.log("🔍 Fetching custom fields for ticket:", ticketId);
      
      fetch(`/api/tickets/${ticketId}/custom-fields`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          console.log("🔍 Custom fields data received:", data);
          setCustomFieldValues(data || []);
          setCustomFieldsLoading(false);
        })
        .catch(err => {
          console.error("🔍 Error fetching custom fields:", err);
          setCustomFieldValues([]);
          setCustomFieldsLoading(false);
        });
    } else {
      setCustomFieldValues([]);
    }
  }, [isOpen, ticketId]);

  if (ticketLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticket) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Ticket não encontrado.</p>
            <Button onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Função para obter configuração de status
  const getStatusConfig = (statusValue: string) => {
    return statusConfigs?.find(s => s.value === statusValue) || { 
      name: statusValue === 'open' ? 'Aberto' :
            statusValue === 'in_progress' ? 'Em Andamento' :
            statusValue === 'resolved' ? 'Resolvido' :
            statusValue === 'closed' ? 'Fechado' : statusValue, 
      color: '#6B7280',
      textColor: '#FFFFFF'
    };
  };

  // Função para obter configuração de prioridade  
  const getPriorityConfig = (priorityValue: string) => {
    return priorityConfigs?.find(p => p.value === priorityValue) || { 
      name: priorityValue === 'critical' ? 'Crítica' :
            priorityValue === 'high' ? 'Alta' :
            priorityValue === 'medium' ? 'Média' :
            priorityValue === 'low' ? 'Baixa' : priorityValue, 
      color: '#6B7280',
      textColor: '#FFFFFF'
    };
  };

  // Função para obter nome do departamento
  const getDepartmentName = (departmentId: string) => {
    const dept = departments?.find(d => d.id === departmentId);
    return dept ? dept.name : departmentId;
  };

  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <span>Detalhes do Ticket {ticket.ticketNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge 
                style={{ 
                  backgroundColor: statusConfig.color, 
                  color: statusConfig.textColor 
                }}
              >
                {statusConfig.name}
              </Badge>
              <Badge 
                style={{ 
                  backgroundColor: priorityConfig.color, 
                  color: priorityConfig.textColor 
                }}
              >
                {priorityConfig.name}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Criado em {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </div>
          </div>

          {/* Ticket Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Informações do Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-[#2c4257] to-[#6b8fb0] text-white">
                        {(ticket.requesterName || ticket.createdByUser?.name)?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{ticket.requesterName || ticket.createdByUser?.name || 'Nome não informado'}</p>
                      <p className="text-xs text-gray-500">Solicitante</p>
                    </div>
                  </div>
                  
                  {/* Informações de contato detalhadas */}
                  <div className="space-y-2 border-t pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">E-mail:</span>
                      <span className="text-gray-700 font-medium">{ticket.requesterEmail || ticket.createdByUser?.email || 'Não informado'}</span>
                    </div>
                    
                    {ticket.requesterPhone && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Telefone:</span>
                        <span className="text-gray-700 font-medium">{ticket.requesterPhone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Departamento:</span>
                      <span className="text-gray-700 font-medium">
                        {ticket.requesterDepartment?.name || 'Não informado'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Responsável:</p>
                    <p className="text-sm font-medium">{ticket.department?.name || 'Não atribuído'}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Atendente:</p>
                        <p className="text-sm font-medium">{ticket.assignedToUser?.name || 'Não atribuído'}</p>
                      </div>
                      {!isAssigning && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAssigning(true)}
                          className="ml-2"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          {ticket.assignedToUser ? 'Alterar' : 'Atribuir'}
                        </Button>
                      )}
                    </div>
                    
                    {isAssigning && (
                      <div className="mt-3 space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            console.log("🔄 Select onChange triggered:", { value, ticketId: ticket.id });
                            if (value === 'unassign') {
                              console.log("🔄 Unassigning ticket");
                              assignTicketMutation.mutate({ ticketId: ticket.id, assignedTo: null });
                            } else {
                              console.log("🔄 Assigning ticket to user:", value);
                              assignTicketMutation.mutate({ ticketId: ticket.id, assignedTo: value });
                            }
                            setIsAssigning(false);
                          }}
                          disabled={assignTicketMutation.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassign">Não atribuído</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAssigning(false)}
                            disabled={assignTicketMutation.isPending}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ticket.category || 'Não definido'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Subject and Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Assunto</h3>
              <p className="text-gray-700">{ticket.subject}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
          </div>

          {/* Custom Fields from Category - Debug Version */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Informações Específicas da Categoria
                <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
                  {customFieldValues ? `${customFieldValues.length} campos` : 'Carregando...'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customFieldsLoading && (
                <div className="text-sm text-gray-500">Carregando campos customizados...</div>
              )}
              {!customFieldsLoading && (!customFieldValues || customFieldValues.length === 0) && (
                <div className="text-sm text-gray-500">Nenhum campo específico da categoria encontrado.</div>
              )}
              {customFieldValues && customFieldValues.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFieldValues.map((fieldValue: any) => (
                    <div key={fieldValue.id} className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">
                        {fieldValue.customField?.name || 'Campo personalizado'}
                      </label>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm text-gray-800">
                          {fieldValue.value || 'Não informado'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Debug info */}
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                <strong>Debug:</strong> Ticket ID: {ticketId} | 
                Loading: {customFieldsLoading ? 'true' : 'false'} | 
                Fields Count: {customFieldValues?.length || 0} |
                Data: {customFieldValues?.length > 0 ? JSON.stringify(customFieldValues.map(f => ({ name: f.customField?.name, value: f.value })), null, 2) : 'Nenhum campo encontrado'}
              </div>
            </CardContent>
          </Card>

          {/* Form Data Details - Show parsed form data for debugging */}
          {parsedFormData && Object.keys(parsedFormData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Detalhes do Formulário de Abertura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(parsedFormData).map(([key, value]) => {
                    // Skip standard fields that are already shown elsewhere
                    if (['subject', 'description', 'category', 'priority', 'requesterName', 'requesterEmail'].includes(key)) {
                      return null;
                    }
                    
                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <div className="bg-gray-50 p-3 rounded border">
                          <p className="text-sm text-gray-800">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || 'Não informado')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug: Mostrar dados do ticket */}
          {console.log('Ticket data:', ticket)}
          {console.log('FormData raw:', ticket.formData)}

          {/* Dados Completos do Formulário Original */}
          {ticket.formData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Informações Detalhadas do Formulário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    try {
                      const formData = JSON.parse(ticket.formData);
                      return (
                        <div className="space-y-4">
                          {/* Informações Básicas do Solicitante */}
                          {(formData.fullName || formData.email || formData.phone) && (
                            <div className="border-b pb-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3">Dados do Solicitante</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {formData.fullName && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Nome Completo:</span>
                                    <span className="font-medium">{formData.fullName}</span>
                                  </div>
                                )}
                                {formData.email && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">E-mail:</span>
                                    <span className="font-medium">{formData.email}</span>
                                  </div>
                                )}
                                {formData.phone && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Telefone:</span>
                                    <span className="font-medium">{formData.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Campos Customizados da Categoria */}
                          {formData.customFields && Object.keys(formData.customFields).length > 0 && (
                            <div className="border-b pb-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3">Perguntas Específicas da Categoria</h4>
                              <div className="space-y-3">
                                {Object.entries(formData.customFields).map(([fieldId, value]) => {
                                  // Mapeamento direto dos IDs para nomes conhecidos
                                  const fieldNameMap = {
                                    'a9a261ac-57aa-4f03-941e-e2e31219be88': 'Justificativa de Negócio',
                                    'e3db291f-5146-404e-9c97-deed94b6062a': 'Módulo do Sistema',
                                    '576d5f9a-4e5d-491b-9d9d-f69a5e048775': 'Passos para Reproduzir',
                                    '2723bfa7-97ec-4ede-9cd4-66e96333d8e8': 'Versão do Sistema',
                                    'b9029d66-e6f8-445a-b162-b9b2e8eb6229': 'Navegador',
                                    'e69761b7-4633-469f-ab77-81a31e6e8748': 'Tipo de Equipamento',
                                    '7ce8caaa-0e67-4e2f-ac76-d60f80fcaea4': 'Número do Patrimônio',
                                    'ae979ad3-afdb-47ab-8996-320e6aea2994': 'CPF do Funcionário',
                                    'e808f2c5-809c-4477-82ab-c0f778b2f762': 'Período de Referência'
                                  };
                                  
                                  const displayName = fieldNameMap[fieldId as keyof typeof fieldNameMap] || `Campo ${fieldId.substring(0, 8)}...`;
                                  
                                  return (
                                    <div key={fieldId} className="flex flex-col space-y-2">
                                      <span className="text-sm font-semibold text-blue-700">{displayName}:</span>
                                      <div className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                        {typeof value === 'string' && value.includes('\n') ? (
                                          <pre className="whitespace-pre-wrap text-sm">{value}</pre>
                                        ) : (
                                          <span className="text-sm font-medium">{value || 'Não informado'}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }) || []}
                              </div>
                            </div>
                          )}
                          
                          {/* Outros dados do formulário */}
                          {formData.originalRequestBody && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800 mb-3">Informações Adicionais</h4>
                              <div className="space-y-2 text-sm">
                                {Object.entries(formData.originalRequestBody).map(([key, value]) => {
                                  // Pular campos que já foram exibidos
                                  if (['subject', 'description', 'priority', 'fullName', 'email', 'phone', 'customFields'].includes(key)) {
                                    return null;
                                  }
                                  return (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                      <span className="font-medium max-w-xs text-right">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-sm text-gray-500">Dados do formulário não disponíveis</p>;
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          {comments && comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comentários ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-[#2c4257] to-[#6b8fb0] text-white">
                            {comment.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{comment.user?.name || 'Usuário'}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ticket criado</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket atualizado</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(ticket.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {ticket.status === 'resolved' && ticket.resolvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket resolvido</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(ticket.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* SLA Information */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progresso SLA</span>
                    <span className="text-sm">
                      {ticket.slaProgressPercent !== undefined ? 
                        `${Math.round(ticket.slaProgressPercent)}%` :
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        ticket.slaStatus === 'violated' ? 'bg-red-500' :
                        ticket.slaStatus === 'at_risk' ? 'bg-orange-500' :
                        ticket.slaStatus === 'met' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}
                      style={{ 
                        width: `${ticket.slaProgressPercent || 0}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Meta: {ticket.slaHoursTotal || 4}h ({(ticket.slaSource || 'padrão').includes('regra SLA') ? 'configurado' : (ticket.slaSource || 'padrão').replace('padrão (', '').replace(')', '').replace('h', '')})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" disabled>
                Escalonamento (Em Breve)
              </Button>
              <Button 
                onClick={() => {
                  // Navegar para a página do Kanban
                  window.location.href = '/tickets';
                  onClose();
                }}
              >
                Abrir no Kanban
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}