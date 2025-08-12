import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, XCircle, MessageSquare, User, Calendar, ArrowRight } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  requester: {
    name: string;
    department: string;
    role: string;
  };
  priority: 'Alta' | 'Média' | 'Baixa';
  category: string;
  createdAt: string;
  status: 'Aguardando Aprovação' | 'Aprovado' | 'Rejeitado';
  currentApprover: string;
  approvalFlow: ApprovalStep[];
  comments: Comment[];
}

interface ApprovalStep {
  id: string;
  approver: string;
  role: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  timestamp?: string;
  comments?: string;
  order: number;
}

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  type: 'internal' | 'approval';
}

export default function WorkflowApprovals() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [filter, setFilter] = useState('pending');

  const tickets: Ticket[] = [
    {
      id: 'TK001234',
      subject: 'Solicitação de aprovação para implementação',
      description: 'Esta solicitação necessita de aprovação sequencial dos responsáveis. Implementação de novo sistema requer validação técnica e orçamentária.',
      requester: {
        name: 'Marco (Usuário)',
        department: 'Tecnologia',
        role: 'Analista'
      },
      priority: 'Alta',
      category: 'Aprovação Sequencial',
      createdAt: '2025-01-07T18:30:00',
      status: 'Aguardando Aprovação',
      currentApprover: 'Felipe (Usuário Operador)',
      approvalFlow: [
        {
          id: '1',
          approver: 'Aprovação Sequencial',
          role: 'Supervisor',
          status: 'Pendente',
          order: 1
        },
        {
          id: '2',
          approver: 'Marco (Usuário)',
          role: 'Solicitante',
          status: 'Aprovado',
          timestamp: '2025-01-07T18:30:00',
          order: 2
        },
        {
          id: '3',
          approver: 'Felipe (Usuário Operador)',
          role: 'Operador',
          status: 'Pendente',
          order: 3
        }
      ],
      comments: [
        {
          id: '1',
          author: 'Marco (Usuário)',
          message: 'Solicitação urgente para implementação do novo módulo.',
          timestamp: '2025-01-07T18:30:00',
          type: 'internal'
        }
      ]
    },
    {
      id: 'TK001235',
      subject: 'Aprovação de orçamento para projeto',
      description: 'Necessário aprovação de orçamento no valor de R$ 50.000 para aquisição de equipamentos.',
      requester: {
        name: 'Ana Silva',
        department: 'Financeiro',
        role: 'Coordenadora'
      },
      priority: 'Média',
      category: 'Aprovação Financeira',
      createdAt: '2025-01-07T17:00:00',
      status: 'Aprovado',
      currentApprover: 'Concluído',
      approvalFlow: [
        {
          id: '1',
          approver: 'João Santos',
          role: 'Gerente',
          status: 'Aprovado',
          timestamp: '2025-01-07T17:30:00',
          comments: 'Aprovado conforme orçamento anual',
          order: 1
        },
        {
          id: '2',
          approver: 'Maria Costa',
          role: 'Diretora',
          status: 'Aprovado',
          timestamp: '2025-01-07T18:00:00',
          comments: 'Aprovação final liberada',
          order: 2
        }
      ],
      comments: []
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    switch (filter) {
      case 'pending': return ticket.status === 'Aguardando Aprovação';
      case 'approved': return ticket.status === 'Aprovado';
      case 'rejected': return ticket.status === 'Rejeitado';
      default: return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando Aprovação': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejeitado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'Aprovado': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejeitado': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Pendente': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleApproval = (action: 'approve' | 'reject') => {
    // Implementation for approval/rejection
    console.log(`${action} ticket ${selectedTicket?.id} with comment: ${approvalComment}`);
    setApprovalComment('');
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Aprovações</h1>
          <p className="text-gray-600 mt-1">Gerencie tickets que necessitam aprovação</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as solicitações</SelectItem>
              <SelectItem value="pending">Aguardando aprovação</SelectItem>
              <SelectItem value="approved">Aprovadas</SelectItem>
              <SelectItem value="rejected">Rejeitadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'Aguardando Aprovação').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'Aprovado').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.status === 'Rejeitado').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600">#{ticket.id}</p>
                  </div>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{ticket.requester.name}</span>
                    </div>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ticket Details */}
        {selectedTicket && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">#{selectedTicket.id}</h3>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{selectedTicket.subject}</h2>
                <p className="text-gray-600 mb-4">{selectedTicket.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Solicitante:</span>
                    <p className="font-medium">{selectedTicket.requester.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Departamento:</span>
                    <p className="font-medium">{selectedTicket.requester.department}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Prioridade:</span>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Data de criação:</span>
                    <p className="font-medium">
                      {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Approval Flow */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Fluxo de Aprovação</h3>
                <div className="space-y-3">
                  {selectedTicket.approvalFlow
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{step.approver}</span>
                          <span className="text-sm text-gray-500">{step.role}</span>
                        </div>
                        {step.comments && (
                          <p className="text-sm text-gray-600 mt-1">{step.comments}</p>
                        )}
                        {step.timestamp && (
                          <p className="text-xs text-gray-400">
                            {new Date(step.timestamp).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                      {index < selectedTicket.approvalFlow.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Actions */}
              {selectedTicket.status === 'Aguardando Aprovação' && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Ação de Aprovação</h3>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Adicione um comentário (opcional)"
                        value={approvalComment}
                        onChange={(e) => setApprovalComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApproval('approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleApproval('reject')}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}