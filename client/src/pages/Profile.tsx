import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  Shield,
  Activity,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface TicketData {
  id: string;
  status: string;
  assignedTo?: string;
  requesterId?: string;
  createdAt: string;
}

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Load current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing current user:', error);
      }
    }
  }, []);

  // Fetch user's tickets for statistics
  const { data: tickets = [] } = useQuery<TicketData[]>({
    queryKey: ['/api/tickets'],
    enabled: !!currentUser,
  });

  // Calculate statistics
  const createdTickets = tickets.filter(ticket => ticket.requesterId === currentUser?.id);
  const assignedTickets = tickets.filter(ticket => ticket.assignedTo === currentUser?.id);
  const resolvedTickets = assignedTickets.filter(ticket => ticket.status === 'resolved');
  const pendingTickets = assignedTickets.filter(ticket => 
    ['open', 'in_progress'].includes(ticket.status)
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      case 'colaborador':
        return 'Colaborador';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'supervisor':
        return 'default';
      case 'colaborador':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Perfil do Usuário
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Informações pessoais e estatísticas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-[#2c4257] to-[#6b8fb0] text-white text-2xl font-semibold">
                    {currentUser.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{currentUser.name}</CardTitle>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Função:</span>
                <Badge variant={getRoleBadgeVariant(currentUser.role)}>
                  {getRoleLabel(currentUser.role)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {currentUser.isActive ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Inativo
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Membro desde:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(currentUser.createdAt)}
                </span>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Nível: {getRoleLabel(currentUser.role)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Cadastrado em {formatDate(currentUser.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chamados Criados</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{createdTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total de chamados abertos por você
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chamados Atribuídos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Chamados sob sua responsabilidade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chamados Resolvidos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{resolvedTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Chamados finalizados com sucesso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Chamados aguardando resolução
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Resumo de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignedTickets.length > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Resolução:</span>
                    <span className="text-sm font-bold">
                      {Math.round((resolvedTickets.length / assignedTickets.length) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(resolvedTickets.length / assignedTickets.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {createdTickets.length + assignedTickets.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total de Interações</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentUser.role === 'admin' ? 'Todas' : 'Limitadas'}
                  </div>
                  <div className="text-xs text-muted-foreground">Permissões</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}