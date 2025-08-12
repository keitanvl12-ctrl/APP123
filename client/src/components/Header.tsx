import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Icon from './AppIcon';
import Button from './Button';
import SimpleTicketModal from './SimpleTicketModal';
import { ThemeToggle } from './ThemeToggle';
import NotificationSystem, { useNotifications } from './NotificationSystem';
import { Bell } from 'lucide-react';
import { Badge } from './ui/badge';

interface HeaderProps {
  onSidebarToggle: () => void;
  isSidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarCollapsed = false }) => {
  const [location, setLocation] = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount } = useNotifications();
  
  const navigate = (path: string) => setLocation(path);

  const primaryNavItems = [
    { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
    { label: 'Criar Ticket', path: 'CREATE_MODAL', icon: 'Plus' },
    { label: 'SLA Monitor', path: '/sla', icon: 'Clock' },
  ];

  const secondaryNavItems = [
    { label: 'Gerenciar Usuários', path: '/users', icon: 'Users' },
  ];

  const handleNavigation = (path: string) => {
    if (path === 'CREATE_MODAL') {
      setIsCreateModalOpen(true);
    } else {
      navigate(path);
    }
    setIsMoreMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === 'CREATE_MODAL') return false;
    return location === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border shadow-enterprise">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section - Logo e Menu Mobile */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <Icon name="Menu" size={20} />
          </Button>
          
          {/* Logo do Grupo OPUS - apenas a logo */}
          <div className="flex items-center">
            <img 
              src="/logo-opus.png" 
              alt="Grupo OPUS" 
              className="w-20 h-auto object-contain"
            />
          </div>
        </div>

        {/* Center Section - Primary Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {primaryNavItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={16}
              className="transition-enterprise"
            >
              {item?.label}
            </Button>
          ))}
        </nav>

        {/* Right Section - More Menu and User Actions */}
        <div className="flex items-center space-x-2">
          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              iconName="MoreHorizontal"
              iconSize={16}
              className="transition-enterprise"
            >
              Mais
            </Button>
            
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-enterprise-lg z-50">
                <div className="py-2">
                  {secondaryNavItems?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-enterprise hover:bg-muted ${
                        isActivePath(item?.path) ? 'bg-muted text-primary' : 'text-foreground'
                      }`}
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-border my-2"></div>
                  <button 
                    onClick={() => {
                      window.open('https://docs.ticketflow.com', '_blank');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-enterprise"
                  >
                    <Icon name="HelpCircle" size={16} />
                    <span>Ajuda</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Clear authentication data
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('currentUser');
                      // Redirect to login
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-enterprise"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation('/profile')}
            iconName="User"
            iconSize={16}
            className="transition-enterprise"
          >
            Perfil
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative transition-enterprise"
              data-testid="button-notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-notification-count"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className="lg:hidden border-t border-border bg-card">
        <nav className="flex overflow-x-auto px-4 py-2 space-x-1">
          {primaryNavItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={14}
              className="whitespace-nowrap transition-enterprise"
            >
              {item?.label}
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Overlay for More Menu */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
      
      {/* SimpleTicketModal */}
      <SimpleTicketModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Notification System */}
      <NotificationSystem
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </header>
  );
};

export default Header;