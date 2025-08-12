import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, BarChart3, PieChart, Users, Clock, Target, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function ReportsNew() {
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Query para obter departamentos
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ["/api/departments"],
  });

  // Query para obter usuários
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Queries para relatórios com filtros funcionais
  const { data: departmentPerformance = [], isLoading: loadingDeptPerf } = useQuery({
    queryKey: ["/api/reports/department-performance", dateRange.startDate, dateRange.endDate],
    queryFn: () => 
      fetch(`/api/reports/department-performance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        .then(res => res.json()),
  });

  const { data: userPerformance = [], isLoading: loadingUserPerf } = useQuery({
    queryKey: ["/api/reports/user-performance", dateRange.startDate, dateRange.endDate, selectedDepartment],
    queryFn: () => 
      fetch(`/api/reports/user-performance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&departmentId=${selectedDepartment}`)
        .then(res => res.json()),
  });

  const { data: resolutionTimeAnalysis = [], isLoading: loadingResTime } = useQuery({
    queryKey: ["/api/reports/resolution-time-analysis", dateRange.startDate, dateRange.endDate, selectedDepartment],
    queryFn: () => 
      fetch(`/api/reports/resolution-time-analysis?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&departmentId=${selectedDepartment}`)
        .then(res => res.json()),
  });

  const { data: filteredTickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["/api/reports/filtered-tickets", dateRange.startDate, dateRange.endDate, selectedDepartment, selectedPriority, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        departmentId: selectedDepartment,
        priority: selectedPriority,
        status: selectedStatus,
      });
      return fetch(`/api/reports/filtered-tickets?${params}`)
        .then(res => res.json());
    },
  });

  const COLORS = ['#3b82f6', '#ef4444', '#eab308', '#22c55e'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-2">Análises detalhadas e insights sobre o desempenho do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatório Personalizado
          </Button>
        </div>
      </div>

      {/* Filtros Funcionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros de Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Data Início</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Data Fim</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Departamento</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Prioridade</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs dos Relatórios */}
      <Tabs defaultValue="sla" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="daily">Chamados/Dia</TabsTrigger>
          <TabsTrigger value="aging">Envelhecimento</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        </TabsList>

        {/* Tab SLA */}
        <TabsContent value="sla">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Cumprimento de SLA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-green-600">87%</div>
                      <div className="text-sm text-green-700">SLA Cumprido</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">217 de 250 tickets</div>
                      <Progress value={87} className="w-20 mt-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crítico (4h)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">92%</span>
                        <Progress value={92} className="w-16" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alto (8h)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">89%</span>
                        <Progress value={89} className="w-16" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Médio (24h)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">85%</span>
                        <Progress value={85} className="w-16" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Baixo (72h)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">94%</span>
                        <Progress value={94} className="w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets em Risco de SLA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-red-800">TICK-789432</div>
                        <div className="text-sm text-red-600">Sistema de pagamento offline</div>
                      </div>
                      <Badge variant="destructive">2h restantes</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-orange-800">TICK-789431</div>
                        <div className="text-sm text-orange-600">Erro na integração</div>
                      </div>
                      <Badge variant="secondary">6h restantes</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-yellow-800">TICK-789430</div>
                        <div className="text-sm text-yellow-600">Performance lenta</div>
                      </div>
                      <Badge variant="outline">12h restantes</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Chamados por Dia */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Volume de Chamados por Dia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Seg', received: 45, resolved: 38 },
                      { day: 'Ter', received: 52, resolved: 44 },
                      { day: 'Qua', received: 38, resolved: 42 },
                      { day: 'Qui', received: 61, resolved: 35 },
                      { day: 'Sex', received: 42, resolved: 48 },
                      { day: 'Sáb', received: 18, resolved: 22 },
                      { day: 'Dom', received: 12, resolved: 15 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="received" fill="#3b82f6" name="Recebidos" />
                      <Bar dataKey="resolved" fill="#22c55e" name="Resolvidos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">268</div>
                    <div className="text-sm text-blue-700">Total Semanal</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">244</div>
                    <div className="text-sm text-green-700">Resolvidos</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">38.3</div>
                    <div className="text-sm text-orange-700">Média Diária</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Envelhecimento */}
        <TabsContent value="aging">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Análise de Envelhecimento de Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: '0-24h', value: 45, color: '#22c55e' },
                          { name: '1-3 dias', value: 28, color: '#eab308' },
                          { name: '3-7 dias', value: 18, color: '#f97316' },
                          { name: '7+ dias', value: 9, color: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {[{ name: '0-24h', value: 45, color: '#22c55e' },
                          { name: '1-3 dias', value: 28, color: '#eab308' },
                          { name: '3-7 dias', value: 18, color: '#f97316' },
                          { name: '7+ dias', value: 9, color: '#ef4444' }].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">142 tickets</div>
                        <div className="text-sm text-gray-500">0-24 horas</div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">89 tickets</div>
                        <div className="text-sm text-gray-500">1-3 dias</div>
                      </div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">57 tickets</div>
                        <div className="text-sm text-gray-500">3-7 dias</div>
                      </div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-red-600">28 tickets</div>
                        <div className="text-sm text-red-500">Mais de 7 dias</div>
                      </div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Departamentos */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Performance por Departamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDeptPerf ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Carregando dados...</div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">Nenhum departamento configurado ainda</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Usuários */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Performance dos Usuários</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUserPerf ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPerformance.map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <Badge variant={
                            user.role === 'admin' ? 'default' :
                            user.role === 'supervisor' ? 'secondary' : 'outline'
                          }>
                            {user.role === 'admin' ? 'Administrador' :
                             user.role === 'supervisor' ? 'Supervisor' : 'Colaborador'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{user.tickets || 0}</div>
                          <div className="text-gray-500">Tickets</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{user.resolved || 0}</div>
                          <div className="text-gray-500">Resolvidos</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{user.efficiency || 0}%</div>
                          <div className="text-gray-500">Eficiência</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Satisfação */}
        <TabsContent value="satisfaction">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Índice de Satisfação Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-blue-600 mb-4">4.7</div>
                  <div className="text-lg text-gray-600 mb-2">de 5.0</div>
                  <div className="text-sm text-gray-500">Baseado em 847 avaliações</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição das Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm w-8">5★</span>
                    <Progress value={68} className="flex-1" />
                    <span className="text-sm w-8">68%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm w-8">4★</span>
                    <Progress value={22} className="flex-1" />
                    <span className="text-sm w-8">22%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm w-8">3★</span>
                    <Progress value={7} className="flex-1" />
                    <span className="text-sm w-8">7%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm w-8">2★</span>
                    <Progress value={2} className="flex-1" />
                    <span className="text-sm w-8">2%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm w-8">1★</span>
                    <Progress value={1} className="flex-1" />
                    <span className="text-sm w-8">1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Principais Comentários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-sm font-medium">Maria S.</div>
                      <div className="text-yellow-400">★★★★★</div>
                    </div>
                    <div className="text-sm text-gray-600">"Atendimento excelente e rápido!"</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-sm font-medium">João P.</div>
                      <div className="text-yellow-400">★★★★☆</div>
                    </div>
                    <div className="text-sm text-gray-600">"Problema resolvido rapidamente"</div>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-sm font-medium">Ana C.</div>
                      <div className="text-yellow-400">★★★★★</div>
                    </div>
                    <div className="text-sm text-gray-600">"Equipe muito profissional"</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo dos Tickets Filtrados</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Tickets:</span>
                      <span className="font-semibold">{filteredTickets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolvidos:</span>
                      <span className="font-semibold text-green-600">
                        {filteredTickets.filter((t: any) => t.status === 'resolved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Em Progresso:</span>
                      <span className="font-semibold text-blue-600">
                        {filteredTickets.filter((t: any) => t.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Abertos:</span>
                      <span className="font-semibold text-orange-600">
                        {filteredTickets.filter((t: any) => t.status === 'open').length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hierarquia do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-red-700">Administrador</div>
                      <div className="text-sm text-red-600">Acesso total ao sistema</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-blue-700">Supervisor</div>
                      <div className="text-sm text-blue-600">Gerencia equipe e relatórios</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-green-700">Colaborador</div>
                      <div className="text-sm text-green-600">Atende e resolve tickets</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}