import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  hierarchy: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Middleware to verify JWT token and extract user info
export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware to check role-based permissions
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userRole = req.user.role || req.user.hierarchy;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Acesso negado. Permissão insuficiente.',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Specific role middlewares
export const requireAdmin = requireRole(['administrador']);
export const requireSupervisor = requireRole(['supervisor', 'administrador']);
export const requireCollaborator = requireRole(['colaborador', 'supervisor', 'administrador']);

// Middleware to filter data based on user hierarchy
export const filterByHierarchy = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const userRole = req.user.role || req.user.hierarchy;
  
  // Add hierarchy info to request for controllers to use
  req.userHierarchy = {
    role: userRole,
    canViewAll: userRole === 'administrador',
    canViewDepartment: ['administrador', 'supervisor'].includes(userRole),
    canViewOwn: ['administrador', 'supervisor', 'colaborador'].includes(userRole),
    userId: req.user.userId
  };

  next();
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      userHierarchy?: {
        role: string;
        canViewAll: boolean;
        canViewDepartment: boolean;
        canViewOwn: boolean;
        userId: string;
      };
    }
  }
}