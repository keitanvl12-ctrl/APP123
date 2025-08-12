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

// Buscar todas as permissões disponíveis - endpoint simples para RoleManagement
router.get('/', async (req, res) => {
  try {
    const basicPermissions = [
      { id: '1', code: 'criar_tickets', name: 'Criar Tickets', category: 'tickets' },
      { id: '2', code: 'ver_proprios_tickets', name: 'Ver Próprios Tickets', category: 'tickets' },
      { id: '3', code: 'ver_todos_tickets', name: 'Ver Todos os Tickets', category: 'tickets' },
      { id: '4', code: 'editar_tickets', name: 'Editar Tickets', category: 'tickets' },
      { id: '5', code: 'gerenciar_usuarios', name: 'Gerenciar Usuários', category: 'usuarios' },
      { id: '6', code: 'gerenciar_configuracoes', name: 'Gerenciar Configurações', category: 'sistema' }
    ];
    res.json(basicPermissions);
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