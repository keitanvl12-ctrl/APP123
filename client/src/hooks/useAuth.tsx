import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  hierarchy: string;
  permissions?: string[];
  department?: {
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

    // USAR APENAS as permissões reais do banco de dados vindas do login
    if (user.permissions && Array.isArray(user.permissions)) {
      // Direct permission check - usar exatamente como está no banco
      if (user.permissions.includes(permission)) return true;
      
      // Wildcard check para permissões como "tickets.*"
      return user.permissions.some(p => 
        p.endsWith('*') && permission.startsWith(p.replace('*', ''))
      );
    }

    // Se não tem permissões do banco, negar acesso
    return false;
  };

  const isAdmin = (): boolean => {
    if (!user) return false;
    const role = user.role || user.hierarchy;
    return role === 'administrador' || role === 'admin';
  };
  
  const isSupervisor = (): boolean => {
    if (!user) return false;
    const role = user.role || user.hierarchy;
    return role === 'supervisor' || isAdmin();
  };

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