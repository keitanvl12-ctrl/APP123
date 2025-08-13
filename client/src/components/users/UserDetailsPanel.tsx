import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Activity, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  Star, 
  Edit, 
  Save, 
  X, 
  Settings,
  Award,
  Target,
  TrendingUp,
  Users,
  Ticket
} from 'lucide-react';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  lastLogin: string;
  createdAt: string;
  avatar?: string | null;
  phone?: string;
  extension?: string;
  location?: string;
  manager?: string | null;
  permissions?: string[];
  ticketsAssigned?: number;
  ticketsResolved?: number;
  averageResolutionTime?: string;
  satisfactionRating?: number;
}

interface Department {
  id: string;
  name: string;
  userCount: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserDetailsPanelProps {
  userId: string;
  onClose: () => void;
  user?: UserType;
  departments: Department[];
  roles: Role[];
  isEditing?: boolean;
  onUserUpdate?: (updatedUser: any) => void;
}

export default function UserDetailsPanel({
  userId,
  onClose,
  user,
  departments,
  roles,
  isEditing: initialIsEditing = false,
  onUserUpdate
}: UserDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    extension: user?.extension || '',
    role: user?.role || '',
    department: user?.department || '',
    status: user?.status || 'active',
    location: user?.location || '',
    manager: user?.manager || ''
  });

  useEffect(() => {
    setIsEditing(initialIsEditing);
  }, [initialIsEditing]);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Usuário não encontrado</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              O usuário selecionado não pôde ser carregado.
            </p>
            <Button onClick={onClose} className="w-full">Fechar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      console.log('Salvando dados do usuário:', formData);
      
      // Usar userId do prop ao invés de user.id
      const userIdToUpdate = userId || user?.id;
      
      if (!userIdToUpdate) {
        throw new Error('ID do usuário não encontrado');
      }

      // Fazer chamada para API de atualização de usuário  
      const response = await fetch(`/api/users/${userIdToUpdate}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          departmentId: formData.department,
          phone: formData.phone,
          extension: formData.extension,
          location: formData.location
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log('Usuário atualizado com sucesso:', updatedUser);
      
      setIsEditing(false);
      setHasUnsavedChanges(false);
      
      // Atualizar formData com os dados salvos
      setFormData({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        extension: updatedUser.extension || '',
        role: updatedUser.role,
        department: updatedUser.departmentId || '',
        status: updatedUser.status || 'active',
        location: updatedUser.location || '',
        manager: updatedUser.manager || ''
      });
      
      // Notificar componente pai da atualização
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      alert('Dados do usuário salvos com sucesso!');
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert(`Erro ao salvar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      extension: user?.extension || '',
      role: user?.role || '',
      department: user?.department || '',
      status: user?.status || 'active',
      location: user?.location || '',
      manager: user?.manager || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleName = (roleId: string) => {
    switch (roleId) {
      case 'administrador': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'colaborador': return 'Colaborador';
      default: return roleId;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrador': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'supervisor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'colaborador': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mock performance data
  const performanceData = [
    { month: 'Jan', tickets: 45, satisfaction: 4.5 },
    { month: 'Fev', tickets: 52, satisfaction: 4.7 },
    { month: 'Mar', tickets: 48, satisfaction: 4.6 },
    { month: 'Abr', tickets: 61, satisfaction: 4.8 },
    { month: 'Mai', tickets: 55, satisfaction: 4.7 },
    { month: 'Jun', tickets: 67, satisfaction: 4.9 }
  ];

  const weeklyActivity = [
    { day: 'Seg', hours: 8.5 },
    { day: 'Ter', hours: 7.2 },
    { day: 'Qua', hours: 8.8 },
    { day: 'Qui', hours: 6.5 },
    { day: 'Sex', hours: 8.0 },
    { day: 'Sáb', hours: 2.5 },
    { day: 'Dom', hours: 0 }
  ];

  const recentActivity = [
    { 
      id: '1', 
      type: 'ticket_resolved', 
      icon: CheckCircle,
      title: 'Ticket #1234 resolvido', 
      description: 'Problema de rede solucionado com sucesso', 
      timestamp: '2024-01-15T14:30:00Z',
      color: 'text-green-600'
    },
    { 
      id: '2', 
      type: 'login', 
      icon: Activity,
      title: 'Login realizado', 
      description: 'Acesso ao sistema às 09:00', 
      timestamp: '2024-01-15T09:00:00Z',
      color: 'text-blue-600'
    },
    { 
      id: '3', 
      type: 'ticket_assigned', 
      icon: Users,
      title: 'Novo ticket atribuído', 
      description: 'Ticket #1235 - Solicitação de acesso', 
      timestamp: '2024-01-14T16:45:00Z',
      color: 'text-orange-600'
    },
    { 
      id: '4', 
      type: 'profile_updated', 
      icon: Settings,
      title: 'Perfil atualizado', 
      description: 'Informações de contato modificadas', 
      timestamp: '2024-01-14T11:20:00Z',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header com Gradiente OPUS */}
        <div className="relative p-6" style={{ background: 'linear-gradient(90deg, #2c4257 0%, #6b8fb0 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/20">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
                  user.status === 'active' ? 'bg-green-500' : 
                  user.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
              </div>
              
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={`${getRoleColor(user.role)} text-sm font-medium`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleName(user.role)}
                  </Badge>
                  <Badge className={`${getStatusColor(user.status)} text-sm font-medium`}>
                    {getStatusLabel(user.status)}
                  </Badge>
                </div>
                <p className="text-white/80 mt-1 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(95vh-8rem)] overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <TabsList className="grid w-full grid-cols-4 bg-transparent">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                  <User className="w-4 h-4 mr-2" />
                  Informações
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                  <Activity className="w-4 h-4 mr-2" />
                  Atividade
                </TabsTrigger>
                <TabsTrigger value="permissions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                  <Shield className="w-4 h-4 mr-2" />
                  Permissões
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-6">
                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Ticket className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{user.ticketsAssigned || 0}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Tickets Ativos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{user.ticketsResolved || 0}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Resolvidos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{user.averageResolutionTime || '0h'}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Tempo Médio</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{user.satisfactionRating || '0.0'}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Satisfação</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Informações Pessoais e Profissionais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Informações Pessoais</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Nome Completo
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">{user.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Email
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                            Telefone
                          </label>
                          {isEditing ? (
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                          ) : (
                            <p className="text-slate-600 dark:text-slate-400">{user.phone || 'Não informado'}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                            Ramal
                          </label>
                          {isEditing ? (
                            <Input
                              value={formData.extension}
                              onChange={(e) => setFormData({...formData, extension: e.target.value})}
                            />
                          ) : (
                            <p className="text-slate-600 dark:text-slate-400">{user.extension || 'Não informado'}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Localização
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {user.location || 'Não informado'}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Informações Profissionais</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Função
                        </label>
                        {isEditing ? (
                          <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${getRoleColor(user.role)} text-sm`}>
                            {getRoleName(user.role)}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Departamento
                        </label>
                        {isEditing ? (
                          <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(dept => (
                                <SelectItem key={dept.id} value={dept.name}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">{user.department}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Status
                        </label>
                        {isEditing ? (
                          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                              <SelectItem value="pending">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${getStatusColor(user.status)} text-sm`}>
                            {getStatusLabel(user.status)}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Gerente
                        </label>
                        <p className="text-slate-600 dark:text-slate-400">{user.manager || 'Não informado'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Membro desde
                        </label>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Último acesso
                        </label>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Activity className="w-4 h-4 mr-2" />
                          {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Performance Mensal</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>Atividade Semanal</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyActivity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Métricas de Performance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Meta Mensal</p>
                          <p className="text-2xl font-bold">85%</p>
                          <p className="text-sm text-green-600">+5% vs mês anterior</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Qualidade</p>
                          <p className="text-2xl font-bold">4.8/5</p>
                          <p className="text-sm text-green-600">Excelente</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Eficiência</p>
                          <p className="text-2xl font-bold">92%</p>
                          <p className="text-sm text-green-600">Acima da média</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Atividade Recente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => {
                        const IconComponent = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800`}>
                              <IconComponent className={`w-5 h-5 ${activity.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                {activity.title}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {activity.description}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Permissões do Sistema</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Gerenciar Usuários</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Criar, editar e excluir usuários</p>
                        </div>
                        <Switch checked={user.permissions?.includes('users.write')} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Visualizar Relatórios</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Acesso aos relatórios do sistema</p>
                        </div>
                        <Switch checked={user.permissions?.includes('reports.read')} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Gerenciar Tickets</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Criar e editar tickets</p>
                        </div>
                        <Switch checked={user.permissions?.includes('tickets.write')} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Configurações do Sistema</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Acesso às configurações administrativas</p>
                        </div>
                        <Switch checked={user.permissions?.includes('admin.settings')} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}