import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const currentUser = localStorage.getItem('currentUser');
  return !!(token && currentUser);
};

// Get current user from localStorage
const getCurrentUser = () => {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
};

// Permission check function
const hasPermission = (userRole: string, requiredPermission: string): boolean => {
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
      'users.edit_department',
      'reports.view_department',
      'categories.view',
      'fields.view',
      'profile.view'
    ],
    administrador: ['*'] // All permissions
  };

  const userPermissions = permissions[userRole as keyof typeof permissions] || [];
  return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    const checkAuth = () => {
      const path = window.location.pathname;
      setCurrentPath(path);

      // Allow access to login page
      if (path === '/login') {
        setIsLoading(false);
        return;
      }

      // Check if authenticated
      if (!isAuthenticated()) {
        setLocation('/login');
        return;
      }

      const user = getCurrentUser();
      if (!user) {
        setLocation('/login');
        return;
      }

      // Check role-based permissions for protected routes
      const protectedRoutes = {
        '/departments': 'administrador',
        '/permissions': 'administrador', 
        '/roles': 'administrador',
        '/config': 'administrador',
        '/users': ['supervisor', 'administrador'],
        '/categories': ['supervisor', 'administrador'],
        '/fields': ['supervisor', 'administrador'],
        '/reports': ['supervisor', 'administrador'],
        '/sla-config': ['supervisor', 'administrador'],
        '/approvals': ['supervisor', 'administrador']
      };

      for (const [route, requiredRoles] of Object.entries(protectedRoutes)) {
        if (path.startsWith(route)) {
          const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
          
          if (!allowedRoles.includes(user.role) && !allowedRoles.includes(user.hierarchy)) {
            setLocation('/unauthorized');
            return;
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();

    // Listen for location changes
    const handleLocationChange = () => {
      checkAuth();
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setLocation]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c4257] mx-auto"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login page without sidebar/header
  if (currentPath === '/login') {
    return <>{children}</>;
  }

  // Show main app with sidebar/header for authenticated users
  return <>{children}</>;
};

export default AuthWrapper;