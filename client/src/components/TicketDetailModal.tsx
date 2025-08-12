
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, User, FileText, Calendar, AlertCircle,
  CheckCircle, Building2, Tag, MessageCircle, UserPlus,
  Loader2, Database, Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface TicketDetailModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  formData?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedToUser?: any;
  createdByUser?: any;
  department?: any;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  requesterDepartment?: any;
  slaProgressPercent?: number;
  slaStatus?: string;
  slaHoursTotal?: number;
  slaSource?: string;
}

interface CustomFieldValue {
  id: string;
  value: string;
  customField: {
    id: string;
    name: string;
    type: string;
    required: boolean;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface DebugInfo {
  ticketLoaded: boolean;
  customFieldsLoaded: boolean;
  commentsLoaded: boolean;
  usersLoaded: boolean;
  configsLoaded: boolean;
  totalRequests: number;
  errors: string[];
}

export default function TicketDetailModal({ ticketId, isOpen, onClose }: TicketDetailModalProps) {
  // Core data states
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldValue[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  
  // Configuration states
  const [statusConfigs, setStatusConfigs] = useState<any[]>([]);
  const [priorityConfigs, setPriorityConfigs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  
  // UI states
  const [isAssigning, setIsAssigning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    ticketLoaded: false,
    customFieldsLoaded: false,
    commentsLoaded: false,
    usersLoaded: false,
    configsLoaded: false,
    totalRequests: 0,
    errors: []
  });
  
  const { toast } = useToast();

  // Helper function to update debug info
  const updateDebug = (updates: Partial<DebugInfo>) => {
    setDebugInfo(prev => ({ ...prev, ...updates }));
  };

  const addDebugError = (error: string) => {
    setDebugInfo(prev => ({ 
      ...prev, 
      errors: [...prev.errors, error],
      totalRequests: prev.totalRequests + 1
    }));
  };

  // Direct fetch function with error handling
  const fetchData = async (url: string, description: string): Promise<any> => {
    try {
      setDebugInfo(prev => ({ ...prev, totalRequests: prev.totalRequests + 1 }));
      console.log(`🔄 Fetching ${description} from:`, url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ ${description} loaded:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${description}:`, error);
      addDebugError(`${description}: ${error.message}`);
      return null;
    }
  };

  // Load all ticket data when modal opens
  useEffect(() => {
    if (!isOpen || !ticketId) {
      // Reset states when modal closes
      setTicket(null);
      setCustomFields([]);
      setComments([]);
      setAssignableUsers([]);
      setDebugInfo({
        ticketLoaded: false,
        customFieldsLoaded: false,
        commentsLoaded: false,
        usersLoaded: false,
        configsLoaded: false,
        totalRequests: 0,
        errors: []
      });
      return;
    }

    const loadTicketData = async () => {
      setLoading(true);
      console.log('🚀 Loading ticket data for ID:', ticketId);

      // Load ticket details
      const ticketsData = await fetchData('/api/tickets', 'All tickets');
      if (ticketsData) {
        const foundTicket = ticketsData.find((t: any) => t.id === ticketId);
        if (foundTicket) {
          setTicket(foundTicket);
          updateDebug({ ticketLoaded: true });
          console.log('🎯 Ticket found:', foundTicket);
        } else {
          addDebugError('Ticket not found in tickets list');
        }
      }

      // Load custom fields specifically for this ticket
      setCustomFieldsLoading(true);
      const customFieldsData = await fetchData(`/api/tickets/${ticketId}/custom-fields`, 'Custom fields');
      if (customFieldsData) {
        setCustomFields(customFieldsData);
        updateDebug({ customFieldsLoaded: true });
        console.log('🎯 Custom fields loaded:', customFieldsData.length, 'fields');
      } else {
        setCustomFields([]);
        updateDebug({ customFieldsLoaded: true });
      }
      setCustomFieldsLoading(false);

      // Load comments
      const commentsData = await fetchData(`/api/tickets/${ticketId}/comments`, 'Comments');
      if (commentsData) {
        setComments(commentsData);
        updateDebug({ commentsLoaded: true });
      }

      // Load assignable users
      const usersData = await fetchData('/api/users/assignable', 'Assignable users');
      if (usersData) {
        setAssignableUsers(usersData);
        updateDebug({ usersLoaded: true });
      }

      // Load configurations
      const [statusData, priorityData, departmentsData] = await Promise.all([
        fetchData('/api/config/status', 'Status configs'),
        fetchData('/api/config/priority', 'Priority configs'),
        fetchData('/api/departments', 'Departments')
      ]);

      if (statusData) setStatusConfigs(statusData);
      if (priorityData) setPriorityConfigs(priorityData);
      if (departmentsData) setDepartments(departmentsData);
      updateDebug({ configsLoaded: true });

      setLoading(false);
    };

    loadTicketData();
  }, [isOpen, ticketId]);

  // Assignment functionality
  const handleAssignUser = async (userId: string | null) => {
    if (!ticket) return;

    setAssignmentLoading(true);
    try {
      console.log('🔄 Assigning ticket:', ticket.id, 'to user:', userId);
      
      const response = await fetch(`/api/tickets/${ticket.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ assignedTo: userId })
      });

      if (!response.ok) {
        throw new Error(`Failed to assign ticket: ${response.statusText}`);
      }

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      
      toast({
        title: "Responsável atribuído",
        description: userId ? "Ticket atribuído com sucesso" : "Atribuição removida",
      });
      
      setIsAssigning(false);
    } catch (error) {
      console.error('❌ Assignment failed:', error);
      toast({
        title: "Erro na atribuição",
        description: "Não foi possível atribuir o responsável",
        variant: "destructive",
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Helper functions for display
  const getStatusConfig = (status: string) => {
    return statusConfigs.find(s => s.value === status) || {
      name: status,
      color: '#6B7280',
      textColor: '#FFFFFF'
    };
  };

  const getPriorityConfig = (priority: string) => {
    return priorityConfigs.find(p => p.value === priority) || {
      name: priority,
      color: '#6B7280',
      textColor: '#FFFFFF'
    };
  };

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || departmentId;
  };

  // Parse form data for additional details
  const parsedFormData = React.useMemo(() => {
    if (!ticket?.formData) return null;
    try {
      return JSON.parse(ticket.formData);
    } catch (error) {
      console.error('Error parsing form data:', error);
      return null;
    }
  }, [ticket?.formData]);

  // Loading state
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Carregando detalhes do ticket...</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>📊 Total de requisições: {debugInfo.totalRequests}</p>
                  <p>🎫 Ticket: {debugInfo.ticketLoaded ? '✅' : '⏳'}</p>
                  <p>🏷️ Campos customizados: {debugInfo.customFieldsLoaded ? '✅' : '⏳'}</p>
                  <p>💬 Comentários: {debugInfo.commentsLoaded ? '✅' : '⏳'}</p>
                  <p>👥 Usuários: {debugInfo.usersLoaded ? '✅' : '⏳'}</p>
                  <p>⚙️ Configurações: {debugInfo.configsLoaded ? '✅' : '⏳'}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (!ticket) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              Erro ao carregar ticket
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Não foi possível carregar os detalhes do ticket.</p>
            {debugInfo.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 mb-2">Erros encontrados:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {debugInfo.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <span>Ticket {ticket.ticketNumber}</span>
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              ID: {ticket.id.substring(0, 8)}...
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority Header */}
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

          {/* PRIORITY SECTION: Custom Fields Information */}
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardHeader className="bg-blue-100/50">
              <CardTitle className="text-lg font-bold flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Informações Específicas da Categoria
                <div className="ml-auto flex items-center space-x-2">
                  {customFieldsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Badge variant="outline" className="bg-white">
                    {customFields.length} {customFields.length === 1 ? 'campo' : 'campos'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {customFieldsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                    <p className="text-sm text-gray-600">Carregando campos customizados...</p>
                  </div>
                </div>
              ) : customFields.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">Nenhum campo específico encontrado</p>
                  <p className="text-sm text-gray-500">
                    Este ticket não possui campos customizados da categoria
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {customFields.map((fieldValue) => (
                      <div key={fieldValue.id} className="space-y-2">
                        <label className="text-sm font-semibold text-blue-700 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {fieldValue.customField?.name || 'Campo sem nome'}
                        </label>
                        <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-800 font-medium">
                            {fieldValue.value || 'Valor não informado'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          Tipo: {fieldValue.customField?.type || 'N/A'} • 
                          {fieldValue.customField?.required ? ' Obrigatório' : ' Opcional'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Debug Information */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Ticket ID:</span>
                    <p className="font-mono">{ticketId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status Carregamento:</span>
                    <p className={customFieldsLoading ? 'text-orange-600' : 'text-green-600'}>
                      {customFieldsLoading ? 'Carregando...' : 'Concluído'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Total Campos:</span>
                    <p>{customFields.length}</p>
                  </div>
                  <div>
                    <span className="font-medium">Categoria:</span>
                    <p>{ticket.category || 'Não definida'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Ticket Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Solicitante
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
                          disabled={assignmentLoading}
                        >
                          {assignmentLoading ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-1" />
                          )}
                          {ticket.assignedToUser ? 'Alterar' : 'Atribuir'}
                        </Button>
                      )}
                    </div>
                    
                    {isAssigning && (
                      <div className="mt-3 space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            const userId = value === 'unassign' ? null : value;
                            handleAssignUser(userId);
                          }}
                          disabled={assignmentLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassign">Não atribuído</SelectItem>
                            {assignableUsers.map((user) => (
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
                            disabled={assignmentLoading}
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

          {/* Form Data from Ticket Creation */}
          {parsedFormData && Object.keys(parsedFormData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Dados do Formulário de Abertura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Basic Requester Info */}
                  {(parsedFormData.fullName || parsedFormData.email || parsedFormData.phone) && (
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Dados do Solicitante</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {parsedFormData.fullName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nome Completo:</span>
                            <span className="font-medium">{parsedFormData.fullName}</span>
                          </div>
                        )}
                        {parsedFormData.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">E-mail:</span>
                            <span className="font-medium">{parsedFormData.email}</span>
                          </div>
                        )}
                        {parsedFormData.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Telefone:</span>
                            <span className="font-medium">{parsedFormData.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Fields from Form */}
                  {parsedFormData.customFields && Object.keys(parsedFormData.customFields).length > 0 && (
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Perguntas Específicas da Categoria (Formulário)</h4>
                      <div className="space-y-3">
                        {Object.entries(parsedFormData.customFields).map(([fieldId, value]) => {
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
                                {typeof value === 'string' && (value as string).includes('\n') ? (
                                  <pre className="whitespace-pre-wrap text-sm">{value}</pre>
                                ) : (
                                  <span className="text-sm font-medium">{(value as string) || 'Não informado'}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          {comments.length > 0 && (
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

          {/* Timeline and SLA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Histórico e SLA
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
                    Meta: {ticket.slaHoursTotal || 4}h ({(ticket.slaSource || 'padrão').includes('regra SLA') ? 'configurado' : 'padrão'})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug Information Panel */}
          <Card className="border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Database className="w-4 h-4 mr-2" />
                Informações de Debug
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium">Total Requisições:</span>
                  <p>{debugInfo.totalRequests}</p>
                </div>
                <div>
                  <span className="font-medium">Ticket:</span>
                  <p className={debugInfo.ticketLoaded ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.ticketLoaded ? '✅ Carregado' : '❌ Erro'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Campos Customizados:</span>
                  <p className={debugInfo.customFieldsLoaded ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.customFieldsLoaded ? `✅ ${customFields.length} campos` : '❌ Erro'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Comentários:</span>
                  <p className={debugInfo.commentsLoaded ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.commentsLoaded ? `✅ ${comments.length} comentários` : '❌ Erro'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Usuários:</span>
                  <p className={debugInfo.usersLoaded ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.usersLoaded ? `✅ ${assignableUsers.length} usuários` : '❌ Erro'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Configurações:</span>
                  <p className={debugInfo.configsLoaded ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.configsLoaded ? '✅ Carregadas' : '❌ Erro'}
                  </p>
                </div>
              </div>
              {debugInfo.errors.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs font-medium text-red-800 mb-1">Erros:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {debugInfo.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
