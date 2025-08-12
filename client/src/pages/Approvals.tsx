import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  User, 
  Calendar,
  AlertTriangle,
  Eye,
  FileText,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Approval {
  id: string;
  title: string;
  type: 'ticket_creation' | 'status_change' | 'assignment' | 'closure';
  requestedBy: string;
  requestedDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'Alta' | 'Média' | 'Baixa';
  description: string;
  relatedTicket?: string;
  department: string;
}

export default function Approvals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [approvals] = useState<Approval[]>([
    {
      id: '1',
      title: 'Aprovação para fechamento de ticket crítico',
      type: 'closure',
      requestedBy: 'João Silva',
      requestedDate: new Date('2024-12-17T09:30:00'),
      status: 'pending',
      priority: 'Alta',
      description: 'Solicitação de aprovação para fechamento do ticket TK-2024-001 relacionado à falha no sistema de pagamentos.',
      relatedTicket: 'TK-2024-001',
      department: 'TI'
    },
    {
      id: '2',
      title: 'Criação de ticket para nova funcionalidade',
      type: 'ticket_creation',
      requestedBy: 'Maria Santos',
      requestedDate: new Date('2024-12-17T14:15:00'),
      status: 'pending',
      priority: 'Média',
      description: 'Aprovação necessária para criar ticket de desenvolvimento de nova funcionalidade no portal do cliente.',
      department: 'Produto'
    },
    {
      id: '3',
      title: 'Alteração de status para produção',
      type: 'status_change',
      requestedBy: 'Pedro Costa',
      requestedDate: new Date('2024-12-16T16:45:00'),
      status: 'approved',
      priority: 'Alta',
      description: 'Aprovação para mudança de status do ticket TK-2024-015 para produção.',
      relatedTicket: 'TK-2024-015',
      department: 'DevOps'
    },
    {
      id: '4',
      title: 'Reatribuição de ticket especializado',
      type: 'assignment',
      requestedBy: 'Ana Oliveira',
      requestedDate: new Date('2024-12-16T11:20:00'),
      status: 'rejected',
      priority: 'Baixa',
      description: 'Solicitação de reatribuição do ticket TK-2024-008 para equipe especializada.',
      relatedTicket: 'TK-2024-008',
      department: 'Suporte'
    }
  ]);

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (approval.relatedTicket && approval.relatedTicket.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;
    const matchesType = typeFilter === 'all' || approval.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ticket_creation': return 'Criação de Ticket';
      case 'status_change': return 'Mudança de Status';
      case 'assignment': return 'Reatribuição';
      case 'closure': return 'Fechamento';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ticket_creation': return <FileText className="w-4 h-4" />;
      case 'status_change': return <AlertTriangle className="w-4 h-4" />;
      case 'assignment': return <Users className="w-4 h-4" />;
      case 'closure': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleApprove = (id: string) => {
    // Implementar lógica de aprovação
    console.log('Aprovar:', id);
  };

  const handleReject = (id: string) => {
    // Implementar lógica de rejeição
    console.log('Rejeitar:', id);
  };

  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Central de Aprovações</h1>
        <p className="text-gray-600">Gerencie solicitações de aprovação do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Buscar aprovações..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="ticket_creation">Criação de Ticket</SelectItem>
                <SelectItem value="status_change">Mudança de Status</SelectItem>
                <SelectItem value="assignment">Reatribuição</SelectItem>
                <SelectItem value="closure">Fechamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Aprovação ({filteredApprovals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.map((approval) => (
                <TableRow key={approval.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(approval.type)}
                      <span className="text-sm">{getTypeLabel(approval.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{approval.title}</p>
                      {approval.relatedTicket && (
                        <p className="text-xs text-gray-500">Ticket: {approval.relatedTicket}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          {approval.requestedBy.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{approval.requestedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(approval.requestedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getPriorityColor(approval.priority)}`}>
                      {approval.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(approval.status)}`}>
                      {getStatusLabel(approval.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {approval.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(approval.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 text-red-600 hover:text-red-700"
                            onClick={() => handleReject(approval.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredApprovals.length === 0 && (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma aprovação encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Não há solicitações de aprovação no momento.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}