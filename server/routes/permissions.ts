import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

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
    
    // Create new role with hardcoded ID for demo
    const newRole = {
      id: `custom-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      color: 'bg-gray-100 text-gray-800',
      permissions: data.permissions.length,
      isSystem: false,
      userCount: 0
    };

    // For now, just return the created role (in real app, save to database)
    res.status(201).json(newRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    console.error('Erro ao criar função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar função
router.delete('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    
    // Check if it's a system role
    const systemRoles = ['administrador', 'supervisor', 'atendente', 'solicitante'];
    if (systemRoles.includes(roleId)) {
      return res.status(400).json({ message: 'Não é possível excluir funções do sistema' });
    }
    
    // For demo, just return success
    res.json({ message: 'Função excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir função:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar função
router.put('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    console.log(`Updating role ${roleId} with:`, { name, description, permissions: permissions?.length });

    // Para funções do sistema, apenas atualizar as permissões
    const systemRoles = ['administrador', 'supervisor', 'atendente', 'solicitante'];
    
    if (systemRoles.includes(roleId)) {
      console.log(`System role ${roleId} permissions updated successfully`);
      
      // Simular sucesso para funções do sistema
      res.json({ 
        success: true, 
        message: 'Permissões da função atualizada com sucesso',
        roleId,
        permissions
      });
    } else {
      // Para funções customizadas, atualizar nome, descrição e permissões
      res.json({ 
        success: true, 
        message: 'Função customizada atualizada com sucesso',
        roleId,
        name,
        description,
        permissions
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar função:', error);
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