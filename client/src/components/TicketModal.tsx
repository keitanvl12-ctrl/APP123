import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, Edit, Save, X, Paperclip, MessageCircle, Clock, User, 
  FileText, Image, Download, Upload, Calendar, AlertCircle,
  CheckCircle, Pause, Play, MoreHorizontal, Send, Receipt, XCircle, AlertTriangle
} from 'lucide-react';
import ServiceOrderModal from './ServiceOrderModal';
import TicketFinalizationModal from './TicketFinalizationModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';


interface TicketModalProps {
  ticket: any;
  children: React.ReactNode;
  onUpdate?: (ticket: any) => void;
}

export function TicketModal({ ticket, children, onUpdate }: TicketModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showServiceOrder, setShowServiceOrder] = useState(false);
  const [showFinalization, setShowFinalization] = useState(false);
  const [finalizationData, setFinalizationData] = useState({
    resolutionComment: '',
    hoursWorked: '',
    equipmentRetired: '',
    materialsUsed: ''
  });

  // Função para calcular horas trabalhadas (tempo ativo - tempo pausado)
  const calculateWorkedHours = () => {
    if (!ticket.createdAt) return '0:00';
    
    const createdAt = new Date(ticket.createdAt);
    const now = new Date();
    
    // Calcular tempo total em milissegundos
    let totalActiveTime = now.getTime() - createdAt.getTime();
    
    // Se há comentários, verificar tempos de pausa
    if (comments && comments.length > 0) {
      let pausedTime = 0;
      let pauseStart = null;
      
      // Ordenar comentários por data
      const sortedComments = [...comments].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      for (const comment of sortedComments) {
        const commentTime = new Date(comment.createdAt).getTime();
        
        // Detectar início de pausa
        if (comment.content.includes('PAUSADO') || comment.content.includes('PAUSA')) {
          pauseStart = commentTime;
        }
        
        // Detectar fim de pausa
        if ((comment.content.includes('RETOMADO') || comment.content.includes('REABERTO')) && pauseStart) {
          pausedTime += commentTime - pauseStart;
          pauseStart = null;
        }
      }
      
      // Se ainda está pausado
      if (ticket.status === 'on_hold' && pauseStart) {
        pausedTime += now.getTime() - pauseStart;
      }
      
      totalActiveTime -= pausedTime;
    }
    
    // Converter para horas e minutos
    const hours = Math.floor(totalActiveTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalActiveTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar comentários do ticket
  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ['/api/tickets', ticket.id, 'comments'],
    enabled: isOpen && !!ticket.id,
  });

  // Buscar usuários para saber quem está logado
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: isOpen,
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

  // Buscar categorias com SLA
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    enabled: isOpen,
  });

  // Usuário atual (assumindo que é o primeiro admin para demo)
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  // Buscar regras SLA configuradas
  const { data: slaRules } = useQuery<any[]>({
    queryKey: ['/api/sla/rules'],
    enabled: isOpen,
  });

  // Calcular SLA SEMPRE usando dados do backend - NÃO calcular localmente
  const calculateSLA = () => {
    // USAR EXCLUSIVAMENTE os dados já calculados pelo backend
    const slaHours = editedTicket.slaHoursTotal || 4; // Padrão de 4h conforme solicitado
    const source = editedTicket.slaSource || "(padrão)";
    
    // Se não tem dados do backend, usar 4h padrão
    if (!editedTicket.slaHoursTotal) {
      console.warn('Ticket sem dados SLA do backend, usando 4h padrão:', editedTicket.ticketNumber);
    }

    // Usar dados já calculados pelo backend
    const percentage = editedTicket.slaProgressPercent || 0;
    const isViolation = editedTicket.slaStatus === 'violated';
    const timeRemaining = (editedTicket.slaHoursRemaining || 0) * 60 * 60 * 1000; // Convert hours to ms

    return { 
      percentage: Math.max(percentage, 0), 
      timeRemaining: Math.abs(timeRemaining), 
      isViolation,
      slaHours,
      source
    };
  };

  const slaData = calculateSLA();

  // Função para formatar tempo restante
  const formatTimeRemaining = (ms: number, isViolation: boolean) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (isViolation) {
      return `Vencido há ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m restantes`;
  };

  // Mutation para criar comentário
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) throw new Error('Usuário não encontrado');
      
      return apiRequest(`/api/tickets/${ticket.id}/comments`, 'POST', {
        content,
        userId: currentUser.id,
        ticketId: ticket.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticket.id, 'comments'] });
      setNewComment('');
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi adicionado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar comentário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para salvar ticket
  const saveTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/tickets/${ticket.id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setIsEditing(false);
      if (onUpdate) onUpdate(editedTicket);
      toast({
        title: 'Ticket atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar alterações. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveTicketMutation.mutate(editedTicket);
  };

  const handleCancel = () => {
    setEditedTicket(ticket);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  // Função para converter cor hex para classes de badge
  const hexToBadgeClasses = (hex: string) => {
    const colorMap: Record<string, string> = {
      '#3b82f6': 'border-blue-200 text-blue-800 bg-blue-50',
      '#f59e0b': 'border-amber-200 text-amber-800 bg-amber-50',
      '#10b981': 'border-emerald-200 text-emerald-800 bg-emerald-50',
      '#6b7280': 'border-gray-200 text-gray-800 bg-gray-50',
      '#8b5cf6': 'border-violet-200 text-violet-800 bg-violet-50',
      '#ef4444': 'border-red-200 text-red-800 bg-red-50',
      '#dc2626': 'border-red-200 text-red-800 bg-red-50',
      '#f87171': 'border-red-200 text-red-800 bg-red-50',
      '#f97316': 'border-orange-200 text-orange-800 bg-orange-50',
      '#06b6d4': 'border-cyan-200 text-cyan-800 bg-cyan-50',
      '#84cc16': 'border-lime-200 text-lime-800 bg-lime-50',
      '#ec4899': 'border-pink-200 text-pink-800 bg-pink-50',
    };
    return colorMap[hex] || 'border-gray-200 text-gray-800 bg-gray-50';
  };

  const getStatusColor = (status: string) => {
    const config = statusConfigs?.find(s => s.value === status || s.name === status);
    if (config?.color) {
      return hexToBadgeClasses(config.color);
    }
    return 'border-gray-200 text-gray-800 bg-gray-50';
  };

  const getPriorityColor = (priority: string) => {
    const config = priorityConfigs?.find(p => p.value === priority || p.name === priority);
    if (config?.color) {
      return hexToBadgeClasses(config.color);
    }
    return 'border-gray-200 text-gray-800 bg-gray-50';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Aqui você adicionaria a lógica para upload dos arquivos
      console.log('Uploading files:', files);
    }
  };

  // Função para adicionar nova tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = editedTicket.tags || [];
    
    // Verificar se a tag já existe (não case-sensitive)
    if (currentTags.some((tag: string) => tag.toLowerCase() === newTag.toLowerCase())) {
      toast({
        title: 'Tag já existe',
        description: 'Esta tag já foi adicionada ao ticket.',
        variant: 'destructive',
      });
      return;
    }
    
    // Adicionar nova tag
    setEditedTicket({
      ...editedTicket,
      tags: [...currentTags, newTag.trim()]
    });
    
    setNewTag('');
    
    toast({
      title: 'Tag adicionada',
      description: `A tag "${newTag.trim()}" foi adicionada com sucesso.`,
    });
  };

  // Função para remover tag
  const handleRemoveTag = (indexToRemove: number) => {
    const currentTags = editedTicket.tags || [];
    const tagToRemove = currentTags[indexToRemove];
    
    const updatedTags = currentTags.filter((_: string, index: number) => index !== indexToRemove);
    
    setEditedTicket({
      ...editedTicket,
      tags: updatedTags
    });
    
    toast({
      title: 'Tag removida',
      description: `A tag "${tagToRemove}" foi removida com sucesso.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center space-x-3">
            <span className="text-xl font-bold">Chamado {ticket.ticketNumber}</span>
            <Badge variant="outline" className={`${getStatusColor(editedTicket.status)}`}>
              {statusConfigs?.find(s => s.value === editedTicket.status)?.name || editedTicket.status}
            </Badge>
            <Badge variant="outline" className={`${getPriorityColor(editedTicket.priority)}`}>
              {priorityConfigs?.find(p => p.value === editedTicket.priority)?.name || editedTicket.priority}
            </Badge>
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {/* Botão Ordem de Serviço */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowServiceOrder(true)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Ordem de Serviço
            </Button>

            {/* Botão Finalizar Ticket */}
            {ticket.status !== 'resolved' && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setShowFinalization(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar
              </Button>
            )}
            
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={saveTicketMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveTicketMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="comments">Comentários</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Principais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Título</Label>
                    {isEditing ? (
                      <Input
                        value={editedTicket.subject}
                        onChange={(e) => setEditedTicket({...editedTicket, subject: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{editedTicket.subject}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedTicket.description || ''}
                        onChange={(e) => setEditedTicket({...editedTicket, description: e.target.value})}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-700">{editedTicket.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      {isEditing ? (
                        <Select value={editedTicket.status} onValueChange={(value) => setEditedTicket({...editedTicket, status: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusConfigs?.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">{statusConfigs?.find(s => s.value === editedTicket.status)?.name || editedTicket.status}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Prioridade</Label>
                      {isEditing ? (
                        <Select value={editedTicket.priority} onValueChange={(value) => setEditedTicket({...editedTicket, priority: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityConfigs?.map(priority => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">{priorityConfigs?.find(p => p.value === editedTicket.priority)?.name || editedTicket.priority}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Departamento Solicitante</Label>
                      {isEditing ? (
                        <Select value={editedTicket.requesterDepartmentId || ""} onValueChange={(value) => setEditedTicket({...editedTicket, requesterDepartmentId: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">
                          {departments?.find(d => d.id === editedTicket.requesterDepartmentId)?.name || 'Não informado'}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Departamento Responsável</Label>
                      {isEditing ? (
                        <Select value={editedTicket.responsibleDepartmentId || ""} onValueChange={(value) => setEditedTicket({...editedTicket, responsibleDepartmentId: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">
                          {departments?.find(d => d.id === editedTicket.responsibleDepartmentId)?.name || 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">SLA</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso SLA</span>
                        <span className={slaData.isViolation ? 'text-red-600 font-semibold' : slaData.percentage > 80 ? 'text-yellow-600 font-semibold' : 'text-green-600'}>
                          {Math.round(slaData.percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            slaData.isViolation 
                              ? 'bg-red-500 dark:bg-red-600' 
                              : slaData.percentage > 80 
                                ? 'bg-yellow-500 dark:bg-yellow-600'
                                : 'bg-green-500 dark:bg-green-600'
                          }`}
                          style={{ width: `${Math.min(slaData.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">
                          Meta: {slaData.slaHours}h ({slaData.source.includes('regra SLA') ? 'configurado' : slaData.source.replace('padrão (', '').replace(')', '').replace('h', '')})
                        </span>
                        <span className={slaData.isViolation ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {formatTimeRemaining(slaData.timeRemaining, slaData.isViolation)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Atribuições */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Atribuições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Responsável</Label>
                    <div className="mt-2 flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {editedTicket.assignedToUser?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{editedTicket.assignedToUser?.name || 'Não atribuído'}</p>
                        <p className="text-xs text-gray-500">{editedTicket.department?.name || 'Sem departamento'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Solicitante</Label>
                    <p className="mt-1 text-sm text-gray-700">{editedTicket.createdByUser?.name || 'Desconhecido'}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Data de Criação</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{new Date(editedTicket.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        {/* Tags existentes - editáveis */}
                        <div className="flex flex-wrap gap-1">
                          {editedTicket.tags?.map((tag: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs flex items-center gap-1 pr-1"
                            >
                              {tag}
                              <X 
                                className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                onClick={() => handleRemoveTag(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Campo para nova tag */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nova tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="text-xs h-8"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleAddTag}
                            className="h-8 text-xs"
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {editedTicket.tags?.length > 0 ? (
                          editedTicket.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">Nenhuma tag adicionada</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comentários ({comments?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de comentários */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {commentsLoading ? (
                    <p className="text-center text-gray-500">Carregando comentários...</p>
                  ) : comments?.length === 0 ? (
                    <p className="text-center text-gray-500">Nenhum comentário ainda</p>
                  ) : (
                    comments?.map((comment: any) => (
                      <div key={comment.id} className="border-l-2 border-blue-200 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {comment.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{comment.user?.name}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Adicionar novo comentário */}
                <div className="border-t pt-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || createCommentMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Paperclip className="w-5 h-5" />
                  <span>Anexos (0)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivos
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Histórico</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket criado</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(editedTicket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  {editedTicket.updatedAt && editedTicket.updatedAt !== editedTicket.createdAt && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ticket atualizado</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(editedTicket.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Service Order Modal */}
      <ServiceOrderModal
        ticket={ticket}
        isOpen={showServiceOrder}
        onClose={() => setShowServiceOrder(false)}
        finalizationData={null}
      />

      {/* Modal de Finalização - Componente Separado */}
      <TicketFinalizationModal
        ticket={ticket}
        isOpen={showFinalization}
        onClose={() => setShowFinalization(false)}
        comments={comments}
        users={users}
      />
    </Dialog>
  );
}

export default TicketModal;