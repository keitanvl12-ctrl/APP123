import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

// Simple permission check function
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const hasPermission = (userRole: string, requiredRole?: string) => {
  if (!requiredRole) return true;
  
  // Normalizar role para admin -> administrador
  const normalizedRole = userRole === 'admin' ? 'administrador' : userRole;
  
  if (requiredRole === 'administrador') {
    return normalizedRole === 'administrador';
  }
  if (requiredRole === 'supervisor') {
    return ['supervisor', 'administrador'].includes(normalizedRole);
  }
  return true;
};

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredRole, 
  fallback 
}) => {
  const user = getCurrentUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }

    const userRole = user.role === 'admin' ? 'administrador' : (user.role || user.hierarchy || 'colaborador');
    if (requiredRole && !hasPermission(userRole, requiredRole)) {
      setLocation('/unauthorized');
      return;
    }
  }, [user, requiredRole, setLocation]);

  if (!user) {
    return null;
  }

  const userRole = user.role === 'admin' ? 'administrador' : (user.role || user.hierarchy || 'colaborador');
  
  if (requiredRole && !hasPermission(userRole, requiredRole)) {
    return fallback || null;
  }

  return <>{children}</>;
};

// Specific role components
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard requiredRole="administrador">
    {children}
  </PermissionGuard>
);

export const SupervisorOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard requiredRole="supervisor">
    {children}
  </PermissionGuard>
);

export const CollaboratorOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard requiredRole="colaborador">
    {children}
  </PermissionGuard>
);

// Hook for checking permissions
export const usePermissions = () => {
  const user = getCurrentUser();
  
  const checkPermission = (requiredRole?: string) => {
    if (!user) return false;
    const userRole = user.role || user.hierarchy || 'colaborador';
    return hasPermission(userRole, requiredRole);
  };

  const isAdmin = () => checkPermission('administrador');
  const isSupervisor = () => checkPermission('supervisor');
  const isCollaborator = () => checkPermission('colaborador');

  return {
    user,
    checkPermission,
    isAdmin,
    isSupervisor,
    isCollaborator
  };
};

export default PermissionGuard;