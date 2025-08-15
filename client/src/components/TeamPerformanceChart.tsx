import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Target, CheckCircle, Clock } from "lucide-react";

interface TeamMember {
  userId: string;
  name: string;
  department: string;
  resolved: number;
  pending: number;
  total: number;
  efficiency: number;
}

export default function TeamPerformanceChart() {
  const { data: teamPerformance = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/dashboard/team-performance"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Performance da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
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
          <Users className="w-5 h-5" />
          Performance da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamPerformance.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de performance disponível</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamPerformance.map((member) => (
              <div key={member.userId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{member.resolved}</span>
                      <span className="text-gray-500">Resolvidos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">{member.pending}</span>
                      <span className="text-gray-500">Pendentes</span>
                    </div>
                    <Badge 
                      variant={member.efficiency >= 80 ? "default" : member.efficiency >= 60 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {member.efficiency}%
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Eficiência</span>
                    <span>{member.resolved}/{member.total} tickets</span>
                  </div>
                  <Progress 
                    value={member.efficiency} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}