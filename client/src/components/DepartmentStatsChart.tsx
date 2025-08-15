import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface DepartmentStat {
  department: string;
  total: number;
  resolved: number;
  pending: number;
  critical: number;
  slaCompliance: number;
}

export default function DepartmentStatsChart() {
  const { data: departmentStats = [], isLoading } = useQuery<DepartmentStat[]>({
    queryKey: ["/api/dashboard/department-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estatísticas por Departamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Estatísticas por Departamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {departmentStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado departamental disponível</p>
          </div>
        ) : (
          <div className="space-y-6">
            {departmentStats.map((dept) => (
              <div key={dept.department} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {dept.department}
                    </h4>
                  </div>
                  <Badge 
                    variant={dept.slaCompliance >= 90 ? "default" : dept.slaCompliance >= 75 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    SLA: {dept.slaCompliance}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dept.total}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dept.resolved}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Resolvidos</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{dept.pending}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Pendentes</div>
                  </div>
                  
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{dept.critical}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Críticos</div>
                  </div>
                </div>

                {dept.critical > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-800 dark:text-red-200">
                      {dept.critical} ticket{dept.critical > 1 ? 's' : ''} crítico{dept.critical > 1 ? 's' : ''} em aberto
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}