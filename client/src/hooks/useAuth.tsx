import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrador' | 'supervisor' | 'colaborador';
  hierarchy: 'administrador' | 'supervisor' | 'colaborador';
  department: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('currentUser');

        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setLocation('/login');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.hierarchy === 'administrador') return true;

    // Define permission hierarchy
    const permissions = {
      colaborador: [
        'tickets.view_own',
        'tickets.create',
        'tickets.edit_own',
        'profile.view'
      ],
      supervisor: [
        'tickets.view_own',
        'tickets.create', 
        'tickets.edit_own',
        'tickets.view_department',
        'tickets.edit_department',
        'tickets.assign',
        'users.view_department',
        'reports.view_department',
        'categories.view',
        'fields.view',
        'profile.view'
      ],
      administrador: [
        // All permissions
        'tickets.*',
        'users.*',
        'departments.*',
        'categories.*',
        'fields.*',
        'reports.*',
        'permissions.*',
        'roles.*',
        'config.*',
        'profile.*'
      ]
    };

    const userPermissions = permissions[user.hierarchy] || [];
    
    // Check exact match or wildcard
    return userPermissions.some(p => 
      p === permission || 
      (p.endsWith('.*') && permission.startsWith(p.replace('.*', '')))
    );
  };

  const isAdmin = (): boolean => user?.hierarchy === 'administrador';
  const isSupervisor = (): boolean => user?.hierarchy === 'supervisor' || isAdmin();

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    isAdmin,
    isSupervisor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string
) => {
  return (props: P) => {
    const { isAuthenticated, hasPermission, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        setLocation('/login');
      } else if (requiredPermission && !hasPermission(requiredPermission)) {
        setLocation('/unauthorized');
      }
    }, [isAuthenticated, hasPermission, isLoading, requiredPermission, setLocation]);

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    if (!isAuthenticated || (requiredPermission && !hasPermission(requiredPermission))) {
      return null;
    }

    return <Component {...props} />;
  };
};