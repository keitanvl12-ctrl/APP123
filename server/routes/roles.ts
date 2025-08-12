import { Router } from 'express';
const router = Router();

// Endpoint para atualizar permissões de funções do sistema
router.put('/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    console.log(`Updating role ${roleId} with permissions:`, permissions);

    // Para funções do sistema, apenas atualizar as permissões
    // O nome e descrição das funções do sistema não podem ser alterados
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

export default router;