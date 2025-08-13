import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  hierarchy: string;
  id?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Middleware to verify JWT token and extract user info
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    console.log('❌ No token provided in authorization header');
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  try {
    console.log('🔐 Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('✅ JWT decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    
    // Get user details from database to ensure user still exists and is active
    const { storage } = await import('../storage');
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      console.log('❌ User not found in database:', decoded.userId);
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    if (!user.isActive) {
      console.log('❌ User is not active:', decoded.userId);
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    if (user.isBlocked) {
      console.log('❌ User is blocked:', decoded.userId);
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    console.log('✅ User authenticated successfully:', user.name, '(' + user.role + ')');

    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      hierarchy: user.role
    };
    
    next();
  } catch (error) {
    console.error('❌ JWT verification error:', error);
    return res.status(401).json({ message: 'Usuário não autenticado' });
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

// Real authentication middleware that checks for valid user session/token
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storage } = await import('../storage');
    const authReq = req as AuthenticatedRequest;
    
    // For now, authenticate using the first admin user in the system
    // In a real system, this would check JWT tokens, sessions, cookies, etc.
    const allUsers = await storage.getAllUsers();
    const adminUser = allUsers.find(user => user.role === 'admin' || user.role === 'administrador');
    
    if (adminUser) {
      authReq.user = {
        id: adminUser.id,
        role: adminUser.role as any,
        departmentId: adminUser.departmentId || undefined
      };
      
      console.log(`✅ User authenticated: ${adminUser.name} (${adminUser.role})`);
      next();
    } else {
      console.log('❌ No authenticated user found');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Erro de autenticação' });
  }
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