import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Icon from './AppIcon';
import Button from './Button';

interface SidebarProps {
  isOpen?: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
  onOpenTicketModal: () => void;
}

const NewSidebar: React.FC<SidebarProps> = ({ 
  isOpen = false, 
  onClose, 
  isCollapsed = false, 
  onToggleCollapse,
  onOpenTicketModal 
}) => {
  const [location, setLocation] = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  const navigate = (path: string) => setLocation(path);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: 'LayoutDashboard',
      description: 'Visão geral e métricas'
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'Ticket',
      description: 'Gerenciar tickets',
      submenu: [
        { label: 'Kanban Board', path: '/tickets', icon: 'Kanban' },
        { label: 'Criar Ticket', action: 'modal', icon: 'Plus' }
      ]
    },
    {
      id: 'monitoring',
      label: 'SLA Monitor',
      path: '/sla',
      icon: 'Clock',
      description: 'Acompanhar performance'
    },
    {
      id: 'reports',
      label: 'Relatórios Avançados',
      path: '/reports',
      icon: 'BarChart3',
      description: 'Análises e insights'
    },
    {
      id: 'administration',
      label: 'Administração',
      icon: 'Settings',
      description: 'Gerenciar sistema',
      submenu: [
        { label: 'Gerenciar Usuários', path: '/users', icon: 'Users' },
        { label: 'Departamentos', path: '/departments', icon: 'Building2' },
        { label: 'Funções', path: '/roles', icon: 'Shield' },
        { label: 'Categorias', path: '/categories', icon: 'FolderTree' },
        { label: 'Campos Customizáveis', path: '/fields', icon: 'Settings2' },
        { label: 'Sistema de Aprovações', path: '/approvals', icon: 'CheckCircle' },
        { label: 'Configuração SLA', path: '/sla-config', icon: 'Clock' },
        { label: 'Status e Prioridades', path: '/config', icon: 'Settings' }
      ]
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSubmenuToggle = (itemId: string) => {
    if (isCollapsed) return;
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
  };

  const isActivePath = (path: string) => {
    return location === path;
  };

  const isActiveParent = (item: any) => {
    if (item?.path && isActivePath(item?.path)) return true;
    if (item?.submenu) {
      return item?.submenu?.some((subItem: any) => isActivePath(subItem?.path));
    }
    return false;
  };

  useEffect(() => {
    // Auto-expand active parent menu
    const activeParentItem = navigationItems?.find(item => isActiveParent(item));
    if (activeParentItem && activeParentItem?.submenu && !isCollapsed) {
      setActiveSubmenu(activeParentItem?.id);
    }
  }, [location, isCollapsed]);

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-60';
  const sidebarClasses = `
    fixed top-16 left-0 h-full bg-card border-r border-border shadow-enterprise-lg z-30
    transition-all duration-300 ease-in-out
    ${sidebarWidth}
    lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      

      
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center border-b border-border ${isCollapsed ? 'justify-center p-2' : 'justify-between p-4'}`}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-opus-blue-dark rounded-lg">
                <Icon name="Ticket" size={20} color="white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-semibold text-foreground">TicketFlow Pro</h1>
                  <p className="text-xs text-muted-foreground">Enterprise Edition</p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Expand/Collapse Button */}
              {!isCollapsed && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:flex items-center justify-center w-6 h-6 rounded-sm opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  title="Recolher sidebar"
                >
                  <Icon 
                    name="ChevronsLeft" 
                    size={14} 
                    className="text-gray-600 dark:text-gray-400" 
                  />
                </button>
              )}
              {isCollapsed && (
                <button
                  onClick={onToggleCollapse}
                  className="flex items-center justify-center w-6 h-6 rounded-sm opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 mx-auto"
                  title="Expandir sidebar"
                >
                  <Icon 
                    name="ChevronsRight" 
                    size={14} 
                    className="text-gray-600 dark:text-gray-400" 
                  />
                </button>
              )}
              
              {/* Close Button (Mobile only when not collapsed) */}
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="lg:hidden transition-enterprise"
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems?.map((item) => (
              <div key={item?.id}>
                {/* Main Navigation Item */}
                <div
                  className={`
                    group relative flex items-center rounded-lg transition-enterprise cursor-pointer
                    ${isActiveParent(item) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-muted'
                    }
                    ${isCollapsed ? 'justify-center p-3' : 'p-3'}
                  `}
                  onClick={() => {
                    if (item?.path) {
                      handleNavigation(item?.path);
                    } else if (item?.submenu) {
                      handleSubmenuToggle(item?.id);
                    }
                  }}
                >
                  <div className={`flex items-center justify-center ${isCollapsed ? 'w-6 h-6' : ''}`}>
                    <Icon 
                      name={item?.icon} 
                      size={isCollapsed ? 18 : 20} 
                      className={`
                        ${isCollapsed ? '' : 'mr-3'} 
                        ${isActiveParent(item) ? 'text-primary-foreground' : ''}
                      `}
                    />
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item?.label}</div>
                        {item?.description && (
                          <div className={`text-xs ${
                            isActiveParent(item) ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}>
                            {item?.description}
                          </div>
                        )}
                      </div>
                      
                      {item?.submenu && (
                        <Icon 
                          name={activeSubmenu === item?.id ? "ChevronDown" : "ChevronRight"} 
                          size={16}
                          className={`transition-transform ${
                            isActiveParent(item) ? 'text-primary-foreground' : ''
                          }`}
                        />
                      )}
                    </>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 min-w-48">
                      <div className="text-sm font-medium mb-1">{item?.label}</div>
                      {item?.description && (
                        <div className="text-xs opacity-80 mb-2">{item?.description}</div>
                      )}
                      {/* Submenu items em tooltip */}
                      {item?.submenu && (
                        <div className="space-y-1 border-t border-gray-700 pt-2">
                          {item?.submenu?.map((subItem: any) => (
                            <div 
                              key={subItem?.path || subItem?.action} 
                              className="text-xs opacity-80 cursor-pointer hover:opacity-100 p-1 rounded hover:bg-gray-800"
                              onClick={() => {
                                if (subItem?.action === 'modal') {
                                  onOpenTicketModal();
                                } else {
                                  handleNavigation(subItem?.path);
                                }
                              }}
                            >
                              {subItem?.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submenu */}
                {item?.submenu && !isCollapsed && activeSubmenu === item?.id && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-border pl-4">
                    {item?.submenu?.map((subItem: any) => (
                      <div
                        key={subItem?.path || subItem?.action}
                        className={`
                          flex items-center p-2 rounded-md text-sm transition-enterprise cursor-pointer
                          ${isActivePath(subItem?.path)
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }
                        `}
                        onClick={() => {
                          if (subItem?.action === 'modal') {
                            onOpenTicketModal();
                          } else {
                            handleNavigation(subItem?.path);
                          }
                        }}
                      >
                        <Icon name={subItem?.icon} size={16} className="mr-3" />
                        {subItem?.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {!isCollapsed ? (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="HelpCircle"
                  iconPosition="left"
                  iconSize={16}
                  className="w-full justify-start transition-enterprise"
                >
                  Ajuda & Suporte
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="LogOut"
                  iconPosition="left"
                  iconSize={16}
                  className="w-full justify-start text-error hover:text-error hover:bg-error/10 transition-enterprise"
                  onClick={() => handleNavigation('/login')}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full transition-enterprise group relative"
                >
                  <Icon name="HelpCircle" size={16} />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md shadow-enterprise-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Ajuda & Suporte
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-error hover:text-error hover:bg-error/10 transition-enterprise group relative"
                  onClick={() => handleNavigation('/login')}
                >
                  <Icon name="LogOut" size={16} />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md shadow-enterprise-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Sair
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default NewSidebar;