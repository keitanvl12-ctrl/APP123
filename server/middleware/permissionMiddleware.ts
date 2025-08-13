import { RequestHandler } from 'express';
import { storage } from '../storage';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware para verificar permissões específicas do usuário
 * @param requiredPermission - A permissão necessária (ex: 'users_view', 'tickets_create')
 * @returns Express middleware function
 */
export function requirePermission(requiredPermission: string): RequestHandler {
  return async (req: AuthenticatedRequest, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const userId = req.user.userId;
      console.log(`🔐 Checking permission '${requiredPermission}' for user ${userId}`);
      
      // Obter permissões do usuário do banco
      const userPermissionsData = await storage.getUserPermissions(userId);
      console.log(`👤 User ${userId} permissions:`, userPermissionsData);
      
      // Admin users have all permissions automatically
      if (req.user.role === 'admin' || req.user.role === 'administrador' || userPermissionsData.roleId === 'administrador') {
        console.log(`✅ Admin user has all permissions`);
        next();
        return;
      }
      
      // Verificar se o usuário tem a permissão necessária
      const userPermissions = userPermissionsData.permissions || [];
      const hasPermission = Array.isArray(userPermissions) ? userPermissions.includes(requiredPermission) : false;
      
      if (!hasPermission) {
        console.log(`❌ Permission denied: User ${userId} lacks '${requiredPermission}'`);
        return res.status(403).json({ 
          message: 'Acesso negado: você não tem permissão para realizar esta ação',
          requiredPermission,
          userPermissions 
        });
      }

      console.log(`✅ Permission granted: User ${userId} has '${requiredPermission}'`);
      next();
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      res.status(500).json({ message: 'Erro interno ao verificar permissões' });
    }
  };
}

/**
 * Middleware para verificar múltiplas permissões (OR - qualquer uma das permissões)
 * @param permissions - Array de permissões (usuário precisa ter pelo menos uma)
 * @returns Express middleware function
 */
export function requireAnyPermission(permissions: string[]): RequestHandler {
  return async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const userId = req.user.userId;
      console.log(`🔐 Checking any of permissions [${permissions.join(', ')}] for user ${userId}`);
      
      // Admin users have all permissions automatically
      if (req.user.role === 'admin' || req.user.role === 'administrador') {
        console.log(`✅ Admin user has all permissions`);
        next();
        return;
      }
      
      const userPermissionsData = await storage.getUserPermissions(userId);
      console.log(`👤 User ${userId} permissions:`, userPermissionsData);
      
      // Verificar se o usuário tem pelo menos uma das permissões
      const userPermissions = userPermissionsData.permissions || [];
      const hasAnyPermission = Array.isArray(userPermissions) && permissions.some(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAnyPermission) {
        console.log(`❌ Permission denied: User ${userId} lacks any of [${permissions.join(', ')}]`);
        return res.status(403).json({ 
          message: 'Acesso negado: você não tem permissão para realizar esta ação',
          requiredPermissions: permissions,
          userPermissions 
        });
      }

      console.log(`✅ Permission granted: User ${userId} has required permissions`);
      next();
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      res.status(500).json({ message: 'Erro interno ao verificar permissões' });
    }
  };
}

/**
 * Middleware para verificar múltiplas permissões (AND - todas as permissões necessárias)
 * @param permissions - Array de permissões (usuário precisa ter todas)
 * @returns Express middleware function
 */
export function requireAllPermissions(permissions: string[]): RequestHandler {
  return async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const userId = req.user.userId;
      console.log(`🔐 Checking all permissions [${permissions.join(', ')}] for user ${userId}`);
      
      const userPermissions = await storage.getUserPermissions(userId);
      console.log(`👤 User ${userId} permissions:`, userPermissions);
      
      // Verificar se o usuário tem todas as permissões necessárias
      const hasAllPermissions = permissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        const missingPermissions = permissions.filter(permission => 
          !userPermissions.includes(permission)
        );
        console.log(`❌ Permission denied: User ${userId} missing permissions [${missingPermissions.join(', ')}]`);
        return res.status(403).json({ 
          message: 'Acesso negado: você não tem todas as permissões necessárias',
          requiredPermissions: permissions,
          missingPermissions,
          userPermissions 
        });
      }

      console.log(`✅ All permissions granted: User ${userId} has all required permissions`);
      next();
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      res.status(500).json({ message: 'Erro interno ao verificar permissões' });
    }
  };
}