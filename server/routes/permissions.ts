import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { pool } from '../db';

const router = Router();

// Buscar permissões do usuário atual
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const permissions = await storage.getUserPermissions(userId);
    
    res.json({
      permissions,
      role: user.roleId,
      departmentId: user.departmentId,
    });
  } catch (error) {
    console.error('Erro ao buscar permissões do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar todas as funções do sistema
router.get('/roles', async (req, res) => {
  try {
    const roles = await storage.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error('Erro ao buscar funções:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar detalhes de uma função específica com permissões
router.get('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const roleDetails = await storage.getRoleWithPermissions(roleId);
    
    if (!roleDetails) {
      return res.status(404).json({ message: 'Função não encontrada' });
    }
    
    res.json(roleDetails);
  } catch (error) {
    console.error('Erro ao buscar detalhes da função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar todas as permissões disponíveis - endpoint com permissões granulares
router.get('/', async (req, res) => {
  try {
    const { SYSTEM_PERMISSIONS } = await import('../permissions');
    
    // Transform permissions to the expected format
    const permissions = SYSTEM_PERMISSIONS.map(perm => ({
      id: perm.id,
      code: perm.code,
      name: perm.name,
      description: perm.description,
      category: perm.category,
      subcategory: perm.subcategory
    }));
    
    res.json(permissions);
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar todas as permissões disponíveis
router.get('/all', async (req, res) => {
  try {
    const permissions = await storage.getAllPermissions();
    res.json(permissions);
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar nova função
const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

router.post('/roles', async (req, res) => {
  try {
    const data = createRoleSchema.parse(req.body);
    
    console.log('📝 Creating new role:', data);
    
    // Generate a proper ID for the role
    const roleId = data.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    
    console.log('🆔 Generated role ID:', roleId);
    console.log('🔍 Role ID type:', typeof roleId);
    console.log('🔍 Role ID length:', roleId.length);
    
    const rolePayload = {
      id: roleId,
      name: data.name,
      description: data.description || '',
      color: 'bg-blue-100 text-blue-800',
      isSystem: false
    };
    
    console.log('🎯 Role payload being sent:', JSON.stringify(rolePayload, null, 2));
    
    // Create new role in database using storage method
    const newRole = await storage.createSystemRole(rolePayload);
    
    // Add permissions to the role
    if (data.permissions && data.permissions.length > 0) {
      await storage.assignPermissionsToRole(newRole.id, data.permissions);
      console.log(`✅ Assigned ${data.permissions.length} permissions to role ${newRole.id}`);
    }
    
    // Return role with permission count
    const roleWithCount = {
      ...newRole,
      permissions: data.permissions.length,
      userCount: 0
    };
    
    console.log('✅ Role created successfully:', roleWithCount);
    res.status(201).json(roleWithCount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    console.error('❌ Erro ao criar função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar função
router.delete('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    console.log(`🗑️ Deleting role: ${roleId}`);
    
    // Check if it's a system role
    const systemRoles = ['administrador', 'supervisor', 'atendente', 'solicitante'];
    if (systemRoles.includes(roleId)) {
      return res.status(400).json({ message: 'Não é possível excluir funções do sistema' });
    }
    
    // Delete role using storage
    const deleted = await storage.deleteSystemRole(roleId);
    
    if (deleted) {
      console.log(`✅ Role ${roleId} deleted successfully`);
      res.json({ message: 'Função excluída com sucesso' });
    } else {
      console.log(`❌ Role ${roleId} not found`);
      res.status(404).json({ message: 'Função não encontrada' });
    }
  } catch (error) {
    console.error('❌ Erro ao excluir função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar função e suas permissões - FUNCIONAL
router.put('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    console.log(`🔄 Updating role ${roleId} with:`, { name, description, permissions: permissions?.length });

    // Update role permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // First clear all existing permissions
      await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
      console.log(`🧹 Cleared all permissions for role ${roleId}`);
      
      // Then add the new permissions - map frontend IDs to database IDs
      if (permissions.length > 0) {
        // Get the correct mapping by fetching from database
        const allPermsResult = await pool.query('SELECT id, code FROM system_permissions');
        const permissionMap: Record<string, string> = {};
        
        // Build mapping from code to ID
        for (const row of allPermsResult.rows) {
          permissionMap[row.code] = row.id;
        }
        
        // Also add direct ID mappings for fallback
        for (const row of allPermsResult.rows) {
          permissionMap[row.id] = row.id;
        }
        
        console.log('📋 Available permission mappings:', Object.keys(permissionMap).slice(0, 10));

        for (const permissionId of permissions) {
          // Map frontend ID to database ID
          const dbPermissionId = permissionMap[permissionId] || permissionId;
          
          console.log(`📝 Mapping ${permissionId} -> ${dbPermissionId}`);
          
          await pool.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [roleId, dbPermissionId]
          );
        }
        console.log(`✅ Assigned ${permissions.length} permissions to role ${roleId}`);
      }
    }

    // Update role basic info for custom roles (not system roles)
    const systemRoles = ['administrador', 'supervisor', 'atendente', 'solicitante'];
    if (!systemRoles.includes(roleId) && (name || description)) {
      const setParts = [];
      const values = [];
      let paramIndex = 1;

      if (name) {
        setParts.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (description !== undefined) {
        setParts.push(`description = $${paramIndex++}`);
        values.push(description);
      }

      if (setParts.length > 0) {
        setParts.push(`updated_at = $${paramIndex++}`);
        values.push(new Date());
        values.push(roleId);

        const query = `UPDATE system_roles SET ${setParts.join(', ')} WHERE id = $${paramIndex}`;
        await pool.query(query, values);
        console.log(`✅ Updated role info for ${roleId}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Permissões da função atualizadas com sucesso',
      roleId,
      permissionsCount: permissions ? permissions.length : 0
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.post('/roles', async (req, res) => {
  try {
    const data = createRoleSchema.parse(req.body);
    
    const newRole = await storage.createRole({
      name: data.name,
      description: data.description,
      isSystemRole: false,
      userCount: 0,
    });

    // Associar permissões à função
    if (data.permissions.length > 0) {
      await storage.assignPermissionsToRole(newRole.id, data.permissions);
    }

    res.status(201).json(newRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    console.error('Erro ao criar função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar função
const updateRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

router.put('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const data = updateRoleSchema.parse(req.body);
    
    const updatedRole = await storage.updateRole(roleId, {
      name: data.name,
      description: data.description,
    });

    // Atualizar permissões da função
    await storage.updateRolePermissions(roleId, data.permissions);

    res.json(updatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    console.error('Erro ao atualizar função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;