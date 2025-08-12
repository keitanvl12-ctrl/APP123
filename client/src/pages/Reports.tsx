import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, BarChart3, PieChart, Users, Clock, Target, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Dados de exemplo para demonstração dos relatórios
  const ticketsByDate = [
    { date: '2024-01-01', created: 12, resolved: 8, pending: 4 },
    { date: '2024-01-02', created: 15, resolved: 12, pending: 7 },
    { date: '2024-01-03', created: 8, resolved: 10, pending: 5 },
    { date: '2024-01-04', created: 18, resolved: 14, pending: 9 },
    { date: '2024-01-05', created: 22, resolved: 18, pending: 13 },
    { date: '2024-01-06', created: 10, resolved: 15, pending: 8 },
    { date: '2024-01-07', created: 14, resolved: 12, pending: 10 },
    { date: '2024-01-08', created: 16, resolved: 13, pending: 13 },
    { date: '2024-01-09', created: 20, resolved: 17, pending: 16 },
    { date: '2024-01-10', created: 25, resolved: 22, pending: 19 },
    { date: '2024-01-11', created: 12, resolved: 18, pending: 13 },
    { date: '2024-01-12', created: 9, resolved: 14, pending: 8 },
    { date: '2024-01-13', created: 19, resolved: 16, pending: 11 },
    { date: '2024-01-14', created: 23, resolved: 20, pending: 14 },
    { date: '2024-01-15', created: 17, resolved: 19, pending: 12 }
  ];

  const ticketsByDepartment = [
    { name: 'TI', tickets: 145, resolved: 132, pending: 13, avgTime: '2.4h' },
    { name: 'RH', tickets: 89, resolved: 84, pending: 5, avgTime: '1.8h' },
    { name: 'Financeiro', tickets: 67, resolved: 61, pending: 6, avgTime: '3.2h' },
    { name: 'Operações', tickets: 123, resolved: 110, pending: 13, avgTime: '2.9h' },
    { name: 'Comercial', tickets: 78, resolved: 72, pending: 6, avgTime: '2.1h' }
  ];

  const ticketsByPriority = [
    { name: 'Crítica', value: 23, color: '#ef4444' },
    { name: 'Alta', value: 67, color: '#f97316' },
    { name: 'Média', value: 156, color: '#eab308' },
    { name: 'Baixa', value: 89, color: '#22c55e' }
  ];

  const resolutionTimeAnalysis = [
    { category: '< 1 hora', count: 45, percentage: 18 },
    { category: '1-4 horas', count: 125, percentage: 50 },
    { category: '4-8 horas', count: 58, percentage: 23 },
    { category: '8-24 horas', count: 18, percentage: 7 },
    { category: '> 24 horas', count: 4, percentage: 2 }
  ];

  const satisfactionTrends = [
    { month: 'Jul', score: 4.2 },
    { month: 'Ago', score: 4.4 },
    { month: 'Set', score: 4.3 },
    { month: 'Out', score: 4.6 },
    { month: 'Nov', score: 4.7 },
    { month: 'Dez', score: 4.8 },
    { month: 'Jan', score: 4.8 }
  ];

  const topPerformers = [
    { name: 'Maria Santos', tickets: 89, satisfaction: 4.9, efficiency: 96 },
    { name: 'João Silva', tickets: 76, satisfaction: 4.7, efficiency: 92 },
    { name: 'Ana Costa', tickets: 68, satisfaction: 4.8, efficiency: 89 },
    { name: 'Pedro Lima', tickets: 54, satisfaction: 4.6, efficiency: 87 },
    { name: 'Carlos Souza', tickets: 45, satisfaction: 4.5, efficiency: 85 }
  ];

  const exportReport = (format: string) => {
    console.log(`Exportando relatório em formato ${format}`);
    alert(`Relatório exportado em formato ${format.toUpperCase()}`);
  };

  const generateCustomReport = () => {
    console.log('Gerando relatório personalizado...');
    alert('Relatório personalizado será gerado e enviado por email');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-2">Análises detalhadas e insights sobre o desempenho do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={generateCustomReport}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatório Personalizado
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros de Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Departamento</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Departamentos</SelectItem>
                  <SelectItem value="ti">TI</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="operacoes">Operações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Prioridade</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Intervalo Personalizado</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios em Abas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tickets-by-date">Por Data</TabsTrigger>
          <TabsTrigger value="department">Departamentos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Tickets</p>
                    <p className="text-3xl font-bold text-blue-600">1,247</p>
                    <p className="text-sm text-green-600">+12% vs mês anterior</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Resolução</p>
                    <p className="text-3xl font-bold text-green-600">94.2%</p>
                    <p className="text-sm text-green-600">+2.1% vs mês anterior</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tempo Médio</p>
                    <p className="text-3xl font-bold text-orange-600">4.2h</p>
                    <p className="text-sm text-red-600">+0.3h vs mês anterior</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Satisfação</p>
                    <p className="text-3xl font-bold text-purple-600">4.8/5</p>
                    <p className="text-sm text-green-600">+0.2 vs mês anterior</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={ticketsByPriority}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                    >
                      {ticketsByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Tempo de Resolução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resolutionTimeAnalysis.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-gray-600">{item.count} tickets</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                    <span className="ml-4 text-sm font-semibold">{item.percentage}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tickets por Data */}
        <TabsContent value="tickets-by-date" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Tickets por Data - Análise Temporal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={ticketsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Data: ${new Date(value).toLocaleDateString('pt-BR')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Criados" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolvidos" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pendentes" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">245</div>
                <div className="text-sm text-gray-600">Tickets Criados</div>
                <div className="text-xs text-green-600 mt-1">+15% vs período anterior</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">218</div>
                <div className="text-sm text-gray-600">Tickets Resolvidos</div>
                <div className="text-xs text-green-600 mt-1">+8% vs período anterior</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">27</div>
                <div className="text-sm text-gray-600">Tickets Pendentes</div>
                <div className="text-xs text-red-600 mt-1">+12% vs período anterior</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise por Departamento */}
        <TabsContent value="department" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ticketsByDepartment.map((dept, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{dept.name}</h3>
                      <Badge variant="outline">{dept.avgTime} tempo médio</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{dept.tickets}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{dept.resolved}</div>
                        <div className="text-sm text-gray-600">Resolvidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{dept.pending}</div>
                        <div className="text-sm text-gray-600">Pendentes</div>
                      </div>
                    </div>
                    <Progress value={(dept.resolved / dept.tickets) * 100} className="h-2" />
                    <div className="text-xs text-gray-600 mt-1">
                      Taxa de resolução: {((dept.resolved / dept.tickets) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance da Equipe */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Top Performers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{performer.name}</h4>
                        <p className="text-sm text-gray-600">{performer.tickets} tickets resolvidos</p>
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{performer.satisfaction}</div>
                        <div className="text-gray-600">Satisfação</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{performer.efficiency}%</div>
                        <div className="text-gray-600">Eficiência</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satisfação do Cliente */}
        <TabsContent value="satisfaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Satisfação do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={satisfactionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[4, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Tendências */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências e Previsões</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={ticketsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" fill="#3b82f6" name="Criados" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolvidos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights Automatizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                  <p className="text-sm font-medium text-green-800">📈 Volume crescendo 15% nas últimas 2 semanas</p>
                </div>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm font-medium text-blue-800">⏰ Pico de tickets entre 10h-12h</p>
                </div>
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm font-medium text-yellow-800">⚠️ Departamento TI com aumento de 23% em tickets críticos</p>
                </div>
                <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                  <p className="text-sm font-medium text-purple-800">🎯 Meta de SLA sendo superada consistentemente</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsões para Próximos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Volume Esperado</span>
                  <span className="text-lg font-bold text-blue-600">~380 tickets</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pico Esperado</span>
                  <span className="text-lg font-bold text-orange-600">Semana 3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recursos Necessários</span>
                  <span className="text-lg font-bold text-green-600">+2 analistas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">SLA Projetado</span>
                  <span className="text-lg font-bold text-purple-600">94.8%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}