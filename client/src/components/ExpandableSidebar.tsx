import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3, 
  UserCheck,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface ExpandableSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function ExpandableSidebar({ currentPath, onNavigate }: ExpandableSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/' },
    { icon: <Ticket className="w-5 h-5" />, label: 'Tickets', href: '/tickets', badge: 12 },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Aprovações', href: '/approvals', badge: 3 },
    { icon: <Users className="w-5 h-5" />, label: 'Usuários', href: '/users' },
    { icon: <Building2 className="w-5 h-5" />, label: 'Departamentos', href: '/departments' },
    { icon: <FileText className="w-5 h-5" />, label: 'Categorias', href: '/categories' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Relatórios', href: '/reports' },
    { icon: <UserCheck className="w-5 h-5" />, label: 'Perfil', href: '/profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Configurações', href: '/settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <div 
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col relative ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      style={{ 
        minWidth: isExpanded ? '256px' : '64px',
        maxWidth: isExpanded ? '256px' : '64px'
      }}
    >
      {/* Header */}
      <div className={`border-b border-gray-200 ${isExpanded ? 'p-4' : 'p-2'}`}>
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'flex-col space-y-2'}`}>
          {isExpanded ? (
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">TicketFlow Pro</h2>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.href} className="relative group">
              <Button
                variant="ghost"
                onClick={() => onNavigate(item.href)}
                className={`w-full ${isExpanded ? 'justify-start' : 'justify-center'} p-3 ${
                  active 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''} w-full`}>
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            active 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Button>
              
              {/* Tooltip para sidebar colapsada */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-1 text-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-gray-200 ${isExpanded ? 'p-4' : 'p-2'}`}>
        {isExpanded ? (
          <div className="text-xs text-gray-500 text-center">
            <p>Versão 2.1.0</p>
            <p className="mt-1">© 2024 TicketFlow Pro</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-bold">v2</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}