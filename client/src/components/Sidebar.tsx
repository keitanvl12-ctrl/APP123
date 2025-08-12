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
import { usePermissions } from '@/hooks/usePermissions';

interface NavigationItem {
  path: string;
  icon: any;
  label: string;
  permission?: string;
  permissions?: string[];
}

const getAllNavigationItems = (): NavigationItem[] => [
  // Dashboard - sempre visível
  { path: "/", icon: LayoutDashboard, label: "Painel" },
  
  // Tickets - baseado em permissões de visualização
  { path: "/tickets", icon: List, label: "Todos os Tickets", permissions: ['tickets_view_own', 'tickets_view_department', 'tickets_view_all'] },
  { path: "/kanban", icon: Columns, label: "Quadro Kanban", permissions: ['tickets_view_own', 'tickets_view_department', 'tickets_view_all'] },
  
  // Relatórios - baseado em permissões de relatórios
  { path: "/analytics", icon: BarChart3, label: "Análises", permissions: ['reports_view_basic', 'reports_view_department', 'reports_view_all'] },
  
  // Equipe - baseado em permissões de usuários
  { path: "/team", icon: Users, label: "Equipe", permission: 'users_view' },
  
  // Configurações básicas - permissão de tickets
  { path: "/config", icon: Settings, label: "Status e Prioridades", permissions: ['tickets_view_department', 'tickets_view_all'] },
  
  // === ADMINISTRAÇÃO ===
  // Departamentos
  { path: "/departments", icon: Building2, label: "Departamentos", permission: 'departments_view' },
  
  // Usuários
  { path: "/users", icon: Users, label: "Usuários", permission: 'users_view' },
  
  // Funções e permissões
  { path: "/roles", icon: Shield, label: "Funções", permission: 'system_manage_roles' },
  { path: "/permissions", icon: Settings, label: "Função", permission: 'system_manage_roles' },
  { path: "/hierarchy", icon: Shield, label: "Hierarquias", permission: 'system_access_admin' },
  
  // Configurações do sistema
  { path: "/settings", icon: Settings, label: "Configurações", permission: 'system_manage_config' }
];

export default function Sidebar() {
  const [location] = useLocation();
  const currentUser = getCurrentUser();
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  // Filtrar itens de navegação baseado nas permissões do usuário
  const navigationItems = getAllNavigationItems().filter(item => {
    // Se não tem permissão definida, sempre mostrar (ex: Dashboard)
    if (!item.permission && !item.permissions) return true;
    
    // Verificar permissão única
    if (item.permission) {
      return hasPermission(item.permission);
    }
    
    // Verificar múltiplas permissões (OR - pelo menos uma)
    if (item.permissions) {
      return hasAnyPermission(item.permissions);
    }
    
    return false;
  });

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
