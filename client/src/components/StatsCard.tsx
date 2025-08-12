import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  onClick?: () => void;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor,
  iconBgColor,
  onClick
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-error";
      default:
        return "text-gray-50";
    }
  };

  const getChangeIcon = () => {
    if (changeType === "positive") return "↗";
    if (changeType === "negative") return "↘";
    return "";
  };

  return (
    <div 
      className={`bg-card border border-border rounded p-6 shadow-enterprise transition-enterprise hover:shadow-enterprise-lg ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold text-foreground mb-2">{value}</p>
          <div className={`inline-flex items-center text-xs font-medium ${getChangeColor()}`}>
            <span className="mr-1">{getChangeIcon()}</span>
            {change}
          </div>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded flex items-center justify-center`}>
          <Icon className={iconColor} size={20} />
        </div>
      </div>
    </div>
  );
}
