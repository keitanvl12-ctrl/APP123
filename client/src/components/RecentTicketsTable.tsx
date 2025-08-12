import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit, MoreHorizontal, User, Calendar, AlertTriangle, Clock, CheckCircle2, Circle, Timer, ArrowRight, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import type { TicketWithDetails } from "@shared/schema";

// Função para converter cor hex para classes de badge
const hexToBadgeClasses = (hex: string) => {
  const colorMap: Record<string, string> = {
    '#3b82f6': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    '#f59e0b': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    '#10b981': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    '#6b7280': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    '#8b5cf6': 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400',
    '#ef4444': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    '#dc2626': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    '#f87171': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    '#f97316': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    '#06b6d4': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    '#84cc16': 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-400',
    '#ec4899': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  };
  return colorMap[hex] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

interface RecentTicketsTableProps {
  limit?: number;
}

export default function RecentTicketsTable({ limit = 10 }: RecentTicketsTableProps) {
  const { data: tickets = [], isLoading } = useQuery<TicketWithDetails[]>({
    queryKey: ["/api/tickets"],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para deletar ticket
  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Falha ao excluir ticket');
      }
    },
    onSuccess: () => {
      toast({
        title: "Ticket excluído",
        description: "O ticket foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: (error) => {
      console.error('Erro ao excluir ticket:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.')) {
      deleteTicketMutation.mutate(ticketId);
    }
  };

  // Buscar configurações dinâmicas
  const { data: statusConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/status'],
  });

  const { data: priorityConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/priority'],
  });

  const recentTickets = tickets.slice(0, limit);

  // Funções para obter cores e labels dinâmicos
  const getStatusColor = (status: string) => {
    const config = statusConfigs?.find(s => s.value === status);
    if (config?.color) {
      return hexToBadgeClasses(config.color);
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusLabel = (status: string) => {
    const config = statusConfigs?.find(s => s.value === status);
    return config?.name || status;
  };

  const getPriorityColor = (priority: string) => {
    const config = priorityConfigs?.find(p => p.value === priority);
    if (config?.color) {
      return hexToBadgeClasses(config.color);
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPriorityLabel = (priority: string) => {
    const config = priorityConfigs?.find(p => p.value === priority);
    return config?.name || priority;
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hoje";
    if (diffDays === 2) return "Ontem";
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Tickets Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Tickets Recentes</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recentTickets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Nenhum ticket encontrado
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Quando novos tickets forem criados, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentTickets.map((ticket, index) => {
              
              return (
                <div key={ticket.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header com ID e Status */}
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
                          #{ticket.ticketNumber}
                        </span>
                        <Badge className={`${getStatusColor(ticket.status)} text-xs font-medium`}>
                          <span>{getStatusLabel(ticket.status)}</span>
                        </Badge>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-xs font-medium`}>
                          <span>{getPriorityLabel(ticket.priority)}</span>
                        </Badge>
                      </div>
                      
                      {/* Título do Ticket */}
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">
                        {ticket.subject}
                      </h3>
                      
                      {/* Informações do Ticket */}
                      <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Solicitante:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {ticket.createdByUser?.name || 'Usuário'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span>Departamento:</span>
                          <Badge variant="outline" className="text-xs">
                            {ticket.department?.name || 'Não especificado'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Assignee */}
                      {ticket.assignedToUser && (
                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Atribuído para:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {getInitials(ticket.assignedToUser.name)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {ticket.assignedToUser.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Ações */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-blue-600"
                        title="Visualizar ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-green-600"
                        title="Editar ticket"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                            title="Mais opções"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar ticket
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDeleteTicket(ticket.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Footer com estatísticas rápidas */}
        {recentTickets.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-slate-600 dark:text-slate-400">
                  Mostrando {recentTickets.length} de {tickets.length} tickets
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {recentTickets.filter(t => t.status === 'open').length} Abertos
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {recentTickets.filter(t => t.status === 'in_progress').length} Em Progresso
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {recentTickets.filter(t => t.status === 'resolved').length} Resolvidos
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}