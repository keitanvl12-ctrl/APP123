import React from 'react';
import Icon from '../../../components/AppIcon';

const ProductivityWidget = () => {
  const todayStats = {
    resolved: 12,
    target: 15,
    avgResponseTime: '8m 32s',
    slaCompliance: 94
  };

  const weeklyTrend = [
    { day: 'Seg', resolved: 8, target: 10 },
    { day: 'Ter', resolved: 12, target: 10 },
    { day: 'Qua', resolved: 15, target: 10 },
    { day: 'Qui', resolved: 9, target: 10 },
    { day: 'Sex', resolved: 12, target: 10 },
    { day: 'Sáb', resolved: 6, target: 8 },
    { day: 'Dom', resolved: 4, target: 5 }
  ];

  const getProgressColor = (value, target) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressPercentage = (value, target) => {
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-enterprise">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Produtividade</h3>
        <Icon name="TrendingUp" size={20} className="text-green-600" />
      </div>
      {/* Today's Performance */}
      <div className="space-y-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Tickets Resolvidos Hoje</span>
            <span className="text-lg font-bold text-foreground">
              {todayStats?.resolved}/{todayStats?.target}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(todayStats?.resolved, todayStats?.target)}`}
              style={{ width: `${getProgressPercentage(todayStats?.resolved, todayStats?.target)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {todayStats?.target - todayStats?.resolved > 0 
              ? `${todayStats?.target - todayStats?.resolved} restantes para atingir a meta`
              : 'Meta atingida! 🎉'
            }
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground">{todayStats?.avgResponseTime}</div>
            <div className="text-xs text-muted-foreground">Tempo Médio de Resposta</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">{todayStats?.slaCompliance}%</div>
            <div className="text-xs text-muted-foreground">Conformidade SLA</div>
          </div>
        </div>
      </div>
      {/* Weekly Trend */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Tendência Semanal</h4>
        <div className="space-y-2">
          {weeklyTrend?.map((day, index) => (
            <div key={day?.day} className="flex items-center space-x-3">
              <span className="text-xs text-muted-foreground w-8">{day?.day}</span>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(day?.resolved, day?.target)}`}
                    style={{ width: `${getProgressPercentage(day?.resolved, day?.target)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-foreground font-medium w-8">
                  {day?.resolved}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Performance Badges */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Performance Excelente</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Award" size={14} className="text-yellow-500" />
            <span className="text-xs text-muted-foreground">Top Performer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityWidget;