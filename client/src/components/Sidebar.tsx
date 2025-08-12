import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  List, 
  Columns, 
  BarChart3, 
  Users, 
  Settings, 
  Ticket,
  LogOut,
  User,
  Bell,
  Shield,
  Building2
} from "lucide-react";
import { getCurrentUser } from '@/lib/userService';

const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { path: "/", icon: LayoutDashboard, label: "Painel" },
    { path: "/tickets", icon: List, label: "Todos os Tickets" },
    { path: "/kanban", icon: Columns, label: "Quadro Kanban" },
    { path: "/analytics", icon: BarChart3, label: "Análises" },
    { path: "/team", icon: Users, label: "Equipe" },
    { path: "/config", icon: Settings, label: "Status e Prioridades" },
  ];

  // Adicionar seção de administração apenas para administradores
  if (userRole === 'administrador') {
    baseItems.push({ path: "/departments", icon: Building2, label: "Departamentos" });
    baseItems.push({ path: "/users", icon: Users, label: "Usuários" });
    baseItems.push({ path: "/roles", icon: Shield, label: "Funções" });
    baseItems.push({ path: "/permissions", icon: Settings, label: "Função" });
    baseItems.push({ path: "/hierarchy", icon: Shield, label: "Hierarquias" });
  }

  baseItems.push({ path: "/settings", icon: Settings, label: "Configurações" });

  return baseItems;
};

export default function Sidebar() {
  const [location] = useLocation();
  const currentUser = getCurrentUser();
  const navigationItems = getNavigationItems(currentUser.role);

  return (
    <aside className="w-64 bg-white border-r border-border flex-shrink-0 flex flex-col shadow-enterprise">
      {/* Logo and Brand */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-opus-blue-dark rounded flex items-center justify-center">
            <Ticket className="text-white" size={16} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">TicketFlow Pro</h1>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2 space-y-1 flex-1">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium transition-enterprise cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" 
               style={{ background: 'linear-gradient(135deg, #2c4257 0%, #6b8fb0 100%)' }}>
            <span>JS</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.role === 'administrador' ? 'Administrador' : 
               currentUser.role === 'supervisor' ? 'Supervisor' : 'Colaborador'}
            </p>
          </div>
          <div className="flex space-x-1">
            <button className="p-1 text-muted-foreground hover:text-primary transition-enterprise">
              <Bell size={16} />
            </button>
            <button className="p-1 text-muted-foreground hover:text-destructive transition-enterprise">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
