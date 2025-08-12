import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TrendData } from "@shared/schema";

interface TicketTrendsChartProps {
  days: number;
  filters?: {
    dateFilter: string;
    priorityFilter: string;
    departmentFilter: string;
  };
}

export default function TicketTrendsChart({ days, filters }: TicketTrendsChartProps) {
  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('days', days.toString());
    if (filters?.dateFilter) params.append('dateFilter', filters.dateFilter);
    if (filters?.priorityFilter && filters.priorityFilter !== 'all') params.append('priority', filters.priorityFilter);
    if (filters?.departmentFilter && filters.departmentFilter !== 'all') params.append('department', filters.departmentFilter);
    return params.toString();
  };

  const queryParams = buildQueryParams();

  const { data: trendData, isLoading } = useQuery<TrendData[]>({
    queryKey: ["/api/dashboard/trends", queryParams],
    queryFn: () => fetch(`/api/dashboard/trends?${queryParams}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-50">Loading chart...</div>
      </div>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-500">Sem dados disponíveis</div>
      </div>
    );
  }



  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            className="text-xs"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            className="text-xs"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "#374151", fontWeight: "600" }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="rect"
          />
          <Area
            type="monotone"
            dataKey="created"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorCreated)"
            strokeWidth={2}
            name="Criados"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke="#22c55e"
            fillOpacity={1}
            fill="url(#colorResolved)"
            strokeWidth={2}
            name="Resolvidos"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
