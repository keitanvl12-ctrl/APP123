import { Router } from 'express';
import { storage } from '../storage';
import { AuthenticatedRequest } from '../middleware/permissionMiddleware';

const router = Router();

// Obter todas as permissões configuradas por função
router.get('/api/permissions', async (req, res) => {
  try {
    const permissions = await storage.getAllPermissions();
    
    // Converter snake_case para camelCase para o frontend
    const camelCasePermissions = permissions.map(permission => ({
      ...permission,
      canManageUsers: permission.canManageUsers,
      canViewAllTickets: permission.canViewAllTickets,
      canViewDepartmentTickets: permission.canViewDepartmentTickets,
      canManageTickets: permission.canManageTickets,
      canViewReports: permission.canViewReports,
      canManageSystem: permission.canManageSystem,
      canManageCategories: permission.canManageCategories,
      canManageDepartments: permission.canManageDepartments,
    }));
    
    res.json(camelCasePermissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

// Obter permissões de uma função específica  
router.get('/api/permissions/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const permission = await storage.getPermissionByRole(role);
    
    if (!permission) {
      // Retornar permissões default se não encontradas
      const defaultPermissions = {
        role,
        canManageUsers: false,
        canViewAllTickets: false,
        canViewDepartmentTickets: false,
        canManageTickets: false,
        canViewReports: false,
        canManageSystem: false,
        canManageCategories: false,
        canManageDepartments: false,
      };
      return res.json(defaultPermissions);
    }
    
    // Converter snake_case para camelCase para o frontend
    const camelCasePermission = {
      ...permission,
      canManageUsers: permission.canManageUsers,
      canViewAllTickets: permission.canViewAllTickets,
      canViewDepartmentTickets: permission.canViewDepartmentTickets,
      canManageTickets: permission.canManageTickets,
      canViewReports: permission.canViewReports,
      canManageSystem: permission.canManageSystem,
      canManageCategories: permission.canManageCategories,
      canManageDepartments: permission.canManageDepartments,
    };
    
    res.json(camelCasePermission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ message: 'Failed to fetch permission' });
  }
});

// Atualizar permissões de uma função
router.put('/api/permissions/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const permissionData = req.body;
    
    const updatedPermission = await storage.updatePermission(role, permissionData);
    
    if (!updatedPermission) {
      return res.status(404).json({ message: 'Permissão não encontrada' });
    }
    
    res.json(updatedPermission);
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ message: 'Failed to update permission' });
  }
});

// Criar nova configuração de permissão para uma função
router.post('/api/permissions', async (req, res) => {
  try {
    const permissionData = req.body;
    const newPermission = await storage.createPermission(permissionData);
    res.status(201).json(newPermission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ message: 'Failed to create permission' });
  }
});

// Obter permissões do usuário atual
router.get('/api/auth/permissions', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userRole = authReq.user.role;
    const permission = await storage.getPermissionByRole(userRole);
    
    // Converter para camelCase se permissão existir
    const formattedPermissions = permission ? {
      canManageUsers: permission.canManageUsers,
      canViewAllTickets: permission.canViewAllTickets,
      canViewDepartmentTickets: permission.canViewDepartmentTickets,
      canManageTickets: permission.canManageTickets,
      canViewReports: permission.canViewReports,
      canManageSystem: permission.canManageSystem,
      canManageCategories: permission.canManageCategories,
      canManageDepartments: permission.canManageDepartments,
    } : {
      canManageUsers: false,
      canViewAllTickets: false,
      canViewDepartmentTickets: false,
      canManageTickets: false,
      canViewReports: false,
      canManageSystem: false,
      canManageCategories: false,
      canManageDepartments: false,
    };
    
    res.json({
      role: userRole,
      permissions: formattedPermissions,
      user: authReq.user
    });

  } catch (error) {
    console.error('Erro ao obter permissões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;