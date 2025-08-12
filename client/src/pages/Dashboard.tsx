import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import { Ticket, Hourglass, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Timer, Target, Activity } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import TicketTrendsChart from "@/components/TicketTrendsChart";
import PriorityBreakdown from "@/components/PriorityBreakdown";
// Removed RecentTicketsTable as requested
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats, Department } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [chartPeriod, setChartPeriod] = useState("7");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const queryClient = useQueryClient();
  
  // Enable real-time dashboard synchronization
  useDashboardSync();

  const navigateToTickets = (filter?: string) => {
    let path = '/tickets';
    if (filter) {
      path += `?filter=${filter}`;
    }
    setLocation(path);
  };

  // Build query parameters for filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (dateFilter) params.append('dateFilter', dateFilter);
    if (priorityFilter !== 'all') params.append('priority', priorityFilter);
    if (departmentFilter !== 'all') params.append('department', departmentFilter);
    return params.toString();
  };

  const queryParams = buildQueryParams();

  // Dashboard stats with real-time updates
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", queryParams],
    queryFn: async () => {
      const url = `/api/dashboard/stats${queryParams ? `?${queryParams}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds as backup
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale for immediate updates
  });

  // Fetch departments for filter dropdown
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Real-time sync is now handled by useDashboardSync hook

  // Enhanced indicators data
  const performanceIndicators = [
    {
      title: "SLA Compliance",
      value: "94.2%",
      target: "95%",
      change: "+2.1%",
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-50",
      progress: 94.2
    },
    {
      title: "Tempo Médio de Resolução",
      value: "4.2h",
      target: "4h",
      change: "-0.3h",
      trend: "down",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      progress: 89
    },
    {
      title: "Taxa de Satisfação",
      value: "4.8/5",
      target: "4.5/5",
      change: "+0.2",
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      progress: 96
    },
    {
      title: "Tickets Escalados",
      value: "12",
      target: "< 15",
      change: "-3",
      trend: "down",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      progress: 80
    }
  ];

  // Fetch real team performance data
  const { data: teamMetrics } = useQuery<any[]>({
    queryKey: ["/api/dashboard/team-performance"],
    initialData: []
  });

  // Fetch real department stats data
  const { data: departmentStats } = useQuery<any[]>({
    queryKey: ["/api/dashboard/department-stats"], 
    initialData: []
  });

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header with filters */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de tickets</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros Avançados</span>
          </button>
          <Select value={chartPeriod} onValueChange={setChartPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros do Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Período</Label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Prioridade</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as Prioridades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Prioridades</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Departamento</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Departamentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Departamentos</SelectItem>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Primary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Tickets"
            value={isLoading ? '...' : stats?.totalTickets || 0}
            change={isLoading ? '...' : stats?.totalTicketsChange || '+0%'}
            changeType="positive"
            icon={Ticket}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            onClick={() => navigateToTickets('all')}
          />
          <StatsCard
            title="Tickets Abertos"
            value={isLoading ? '...' : stats?.openTickets || 0}
            change={isLoading ? '...' : stats?.openTicketsChange || '+0%'}
            changeType="negative"
            icon={Hourglass}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
            onClick={() => navigateToTickets('open')}
          />
          <StatsCard
            title="Resolvidos Hoje"
            value={isLoading ? '...' : stats?.resolvedToday || 0}
            change={isLoading ? '...' : stats?.resolvedTodayChange || '+0%'}
            changeType="positive"
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            onClick={() => navigateToTickets('resolved')}
          />
          <StatsCard
            title="Críticos Pendentes"
            value={isLoading ? '...' : stats?.criticalTickets || 0}
            change={isLoading ? '...' : '-0'}
            changeType="negative"
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBgColor="bg-red-50"
            onClick={() => navigateToTickets('critical')}
          />
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceIndicators.map((indicator, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${indicator.bgColor}`}>
                    <Target className={`w-5 h-5 ${indicator.color}`} />
                  </div>
                  <Badge variant={indicator.trend === "up" ? "default" : "secondary"}>
                    {indicator.change}
                    <TrendingUp className="w-3 h-3 ml-1" />
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-600">{indicator.title}</h3>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{indicator.value}</span>
                    <span className="text-sm text-gray-500">meta: {indicator.target}</span>
                  </div>
                  <Progress value={indicator.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Trends Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Tendências de Tickets</h2>
              <Select value={chartPeriod} onValueChange={setChartPeriod}>
                <SelectTrigger className="w-40 text-sm border-border">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TicketTrendsChart days={parseInt(chartPeriod)} filters={{ dateFilter, priorityFilter, departmentFilter }} />
          </div>

          {/* Priority Breakdown */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Distribuição por Prioridade</h2>
            <PriorityBreakdown filters={{ dateFilter, priorityFilter, departmentFilter }} />
          </div>
        </div>

        {/* Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Performance da Equipe</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMetrics.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                       onClick={() => navigateToTickets(`user-${member.name}`)}>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <Badge variant="outline">{member.efficiency}%</Badge>
                      </div>
                      <div className="flex text-sm text-gray-600 space-x-4">
                        <span>Atribuídos: {member.tickets}</span>
                        <span>Resolvidos: {member.resolved}</span>
                      </div>
                      <Progress value={member.efficiency} className="h-2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Statistics */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>Estatísticas por Departamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                       onClick={() => navigateToTickets(`dept-${dept.name}`)}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{dept.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={dept.sla >= 90 ? "default" : "destructive"}>
                          SLA: {dept.sla}%
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{dept.tickets}</div>
                        <div className="text-gray-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{dept.resolved}</div>
                        <div className="text-gray-600">Resolvidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600">{dept.pending}</div>
                        <div className="text-gray-600">Pendentes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-card border border-border rounded-lg shadow-enterprise overflow-hidden">
          {/* Recent Tickets section removed as requested */}
        </div>
      </div>
    </div>
  );
}
