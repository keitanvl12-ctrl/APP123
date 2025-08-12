import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/support-agent-dashboard',
      icon: 'LayoutDashboard',
      description: 'Overview and metrics'
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'Ticket',
      description: 'Ticket management',
      submenu: [
        { label: 'Kanban Board', path: '/kanban-board-view', icon: 'Kanban' },
        { label: 'Create Ticket', path: '/ticket-creation-form', icon: 'Plus' }
      ]
    },
    {
      id: 'monitoring',
      label: 'SLA Monitoring',
      path: '/sla-monitoring-center',
      icon: 'Clock',
      description: 'Performance tracking'
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: 'Settings',
      description: 'System management',
      submenu: [
        { label: 'User Management', path: '/user-management-console', icon: 'Users' }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSubmenuToggle = (itemId) => {
    if (isCollapsed) return;
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const isActiveParent = (item) => {
    if (item?.path && isActivePath(item?.path)) return true;
    if (item?.submenu) {
      return item?.submenu?.some(subItem => isActivePath(subItem?.path));
    }
    return false;
  };

  useEffect(() => {
    // Auto-expand active parent menu
    const activeParentItem = navigationItems?.find(item => isActiveParent(item));
    if (activeParentItem && activeParentItem?.submenu && !isCollapsed) {
      setActiveSubmenu(activeParentItem?.id);
    }
  }, [location.pathname, isCollapsed]);

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-60';
  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-card border-r border-border shadow-enterprise-lg z-40
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <Icon name="Ticket" size={20} color="white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">TicketFlow Pro</h1>
                  <p className="text-xs text-muted-foreground">Enterprise Edition</p>
                </div>
              </div>
            )}
            
            {isCollapsed && (
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg mx-auto">
                <Icon name="Ticket" size={20} color="white" />
              </div>
            )}

            {/* Collapse Toggle (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden lg:flex transition-enterprise"
            >
              <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
            </Button>

            {/* Close Button (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden transition-enterprise"
            >
              <Icon name="X" size={16} />
            </Button>
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
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={`
                      ${isCollapsed ? '' : 'mr-3'} 
                      ${isActiveParent(item) ? 'text-primary-foreground' : ''}
                    `}
                  />
                  
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
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md shadow-enterprise-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      <div className="text-sm font-medium">{item?.label}</div>
                      {item?.description && (
                        <div className="text-xs text-muted-foreground">{item?.description}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submenu */}
                {item?.submenu && !isCollapsed && activeSubmenu === item?.id && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-border pl-4">
                    {item?.submenu?.map((subItem) => (
                      <div
                        key={subItem?.path}
                        className={`
                          flex items-center p-2 rounded-md text-sm transition-enterprise cursor-pointer
                          ${isActivePath(subItem?.path)
                            ? 'bg-primary/10 text-primary font-medium' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }
                        `}
                        onClick={() => handleNavigation(subItem?.path)}
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
                  Help & Support
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="LogOut"
                  iconPosition="left"
                  iconSize={16}
                  className="w-full justify-start text-error hover:text-error hover:bg-error/10 transition-enterprise"
                  onClick={() => handleNavigation('/login-and-authentication')}
                >
                  Sign Out
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
                    Help & Support
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-error hover:text-error hover:bg-error/10 transition-enterprise group relative"
                  onClick={() => handleNavigation('/login-and-authentication')}
                >
                  <Icon name="LogOut" size={16} />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md shadow-enterprise-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Sign Out
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

export default Sidebar;