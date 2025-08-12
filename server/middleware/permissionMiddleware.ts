import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Definir hierarquia de roles
const ROLE_HIERARCHY = {
  solicitante: 0,
  atendente: 1,
  supervisor: 2,
  administrador: 3
} as const;

// Definir permissões por role - exportado para uso no storage
export const ROLE_PERMISSIONS = {
  solicitante: {
    canManageUsers: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: false,
    canManageTickets: false,
    canViewReports: false,
    canManageSystem: false,
    canManageCategories: false,
    canManageDepartments: false,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: false,
    canRespondTickets: false,
  },
  atendente: {
    canManageUsers: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: true, // Pode ver tickets do departamento
    canManageTickets: false,
    canViewReports: false,
    canManageSystem: false,
    canManageCategories: false,
    canManageDepartments: false,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: false,
    canRespondTickets: true, // Pode responder tickets atribuídos
  },
  supervisor: {
    canManageUsers: true, // Só do seu departamento
    canViewAllTickets: false,
    canViewDepartmentTickets: true, // Todos do departamento - FUNCIONAL
    canManageTickets: true,
    canViewReports: true,
    canManageSystem: false,
    canManageCategories: true, // Só do departamento
    canManageDepartments: false,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: true,
    canRespondTickets: true,
  },
  administrador: {
    canManageUsers: true, // Todos os usuários
    canViewAllTickets: true, // Todos os tickets
    canViewDepartmentTickets: true,
    canManageTickets: true,
    canViewReports: true, // Todos os relatórios
    canManageSystem: true, // Configurações do sistema
    canManageCategories: true,
    canManageDepartments: true,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canEditOwnTickets: true,
    canRespondTickets: true,
  }
} as const;

type UserRole = keyof typeof ROLE_HIERARCHY;
type PermissionKey = keyof typeof ROLE_PERMISSIONS.solicitante;

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    departmentId?: string;
  };
}

export function requirePermission(permission: PermissionKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const userRole = authReq.user.role;
      
      // Tratar caso especial do role "admin" = "administrador"
      const normalizedRole = userRole === 'admin' ? 'administrador' : userRole;
      
      // Buscar permissões do banco de dados
      const userPermissions = await storage.getPermissionByRole(normalizedRole);
      const hasPermission = userPermissions?.[permission] || false;

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Acesso negado. Permissão insuficiente.',
          required: permission,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de permissão:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
}

export function requireRole(minRole: UserRole | string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const userRole = authReq.user.role;
      
      console.log('RequireRole Debug:', {
        userRole,
        minRole,
        user: authReq.user
      });
      
      // Tratar caso especial do role "admin" = "administrador"
      const normalizedUserRole = userRole === 'admin' ? 'administrador' : userRole;
      const normalizedMinRole = minRole === 'admin' ? 'administrador' : minRole;
      
      console.log('Normalized roles:', {
        normalizedUserRole,
        normalizedMinRole,
        isAdmin: normalizedUserRole === 'administrador'
      });
      
      // Se for administrador, sempre tem acesso
      if (normalizedUserRole === 'administrador') {
        console.log('Admin access granted');
        return next();
      }
      
      const userLevel = ROLE_HIERARCHY[normalizedUserRole as UserRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[normalizedMinRole as UserRole] || 0;

      console.log('Hierarchy levels:', { userLevel, requiredLevel });

      if (userLevel < requiredLevel) {
        console.log('Access denied - insufficient level');
        return res.status(403).json({ 
          message: 'Acesso negado. Nível hierárquico insuficiente.',
          required: normalizedMinRole,
          userRole: userRole
        });
      }

      console.log('Access granted');
      next();
    } catch (error) {
      console.error('Erro no middleware de role:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
}

// Middleware para filtrar tickets baseado na hierarquia
export async function filterTicketsByHierarchy(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userRole = authReq.user.role;
    const userId = authReq.user.id;
    const userDepartmentId = authReq.user.departmentId;

    // Tratar caso especial do role "admin" = "administrador"
    const normalizedRole = userRole === 'admin' ? 'administrador' : userRole;
    
    // Adicionar parâmetros de filtro baseado na hierarquia
    switch (normalizedRole) {
      case 'colaborador':
        // Colaboradores só veem seus próprios tickets
        req.query.createdBy = userId;
        break;
      
      case 'supervisor':
        // Supervisores veem todos do departamento
        if (userDepartmentId) {
          req.query.departmentId = userDepartmentId;
        }
        break;
      
      case 'administrador':
        // Administradores veem tudo (sem filtro adicional)
        break;
      
      default:
        // Fallback para colaborador
        req.query.createdBy = userId;
        break;
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de filtro de tickets:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

// Middleware para autenticação simulada (será substituído pelo sistema real de auth)
export async function mockAuth(req: Request, res: Response, next: NextFunction) {
  // Simulação temporária - usa usuários reais do banco de dados
  try {
    const { storage } = await import('../storage');
    const authReq = req as AuthenticatedRequest;
    
    // Para demo, simular diferentes usuários baseado no contexto da requisição
    // Em produção, isso viria da sessão/token
    const allUsers = await storage.getAllUsers();
    
    // Por padrão usar admin, mas permitir override via header para testes
    const testUserId = req.headers['x-test-user-id'] as string;
    const testUserRole = req.headers['x-test-user-role'] as string;
    
    let currentUser;
    
    if (testUserId) {
      currentUser = allUsers.find(user => user.id === testUserId);
    } else if (testUserRole) {
      currentUser = allUsers.find(user => user.role === testUserRole);
    } else {
      // Default: usar admin
      currentUser = allUsers.find(user => user.role === 'admin' || user.role === 'administrador');
    }
    
    console.log('MockAuth Debug:', {
      totalUsers: allUsers.length,
      currentUserFound: !!currentUser,
      currentUserRole: currentUser?.role,
      requestHeaders: { testUserId, testUserRole }
    });
    
    if (currentUser) {
      authReq.user = {
        id: currentUser.id,
        role: currentUser.role as UserRole,
        departmentId: currentUser.departmentId || undefined
      };
    } else {
      // Fallback para usuário mock admin
      console.log('No user found, using mock admin');
      authReq.user = {
        id: 'mock-admin-id',
        role: 'admin',
        departmentId: undefined
      };
    }
    
    console.log('MockAuth final user:', authReq.user);
    next();
  } catch (error) {
    console.error('Error in mockAuth:', error);
    // Fallback em caso de erro
    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      id: 'mock-admin-id',
      role: 'admin',
      departmentId: undefined
    };
    next();
  }
}

export { AuthenticatedRequest };