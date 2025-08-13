import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import { verifyToken, requireRole, requireAdmin, requireSupervisor, filterByHierarchy, isAuthenticated } from "./middleware/authMiddleware";
import { 
  requirePermission, 
  requireAnyPermission,
  requireAllPermissions
} from "./middleware/permissionMiddleware";
import permissionRoutes from "./routes/permissions";
import { departmentStorage } from "./departmentStorage";
import { insertDepartmentSchema, insertCategorySchema, insertCustomFieldSchema } from "@shared/schema";
import { insertTicketSchema, insertCommentSchema, updateTicketSchema } from "@shared/schema";
import { z } from "zod";
import { getWebSocketServer } from "./websocket";
import { registerServiceOrderRoutes } from "./routes/serviceOrder";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.use("/api/auth", authRoutes);
  
  // Apply real authentication middleware to all protected routes
  // TEMPORARILY DISABLED FOR DEBUGGING
  // app.use("/api", isAuthenticated);
  
  // Registrar rotas de permissões
  app.use("/api/permissions", permissionRoutes);
  
  // Registrar rotas de roles no endpoint correto
  app.use("/api", permissionRoutes);
  
  // Team Performance endpoint (real data)
  app.get("/api/dashboard/team-performance", async (req, res) => {
    try {
      const teamPerformance = await storage.getTeamPerformance();
      res.json(teamPerformance);
    } catch (error) {
      console.error("Error fetching team performance:", error);
      res.status(500).json({ error: "Failed to fetch team performance" });
    }
  });

  // Department Stats endpoint (real data)  
  app.get("/api/dashboard/department-stats", async (req, res) => {
    try {
      const departmentStats = await storage.getDepartmentStats();
      res.json(departmentStats);
    } catch (error) {
      console.error("Error fetching department stats:", error);
      res.status(500).json({ error: "Failed to fetch department stats" });
    }
  });
  
  // Dashboard stats with filters
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const filters = {
        dateFilter: req.query.dateFilter as string,
        priority: req.query.priority as string,
        department: req.query.department as string
      };
      console.log('Dashboard stats endpoint called with filters:', filters);
      const stats = await storage.getDashboardStats(filters);
      console.log('Dashboard stats result:', stats);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/priority-stats", async (req, res) => {
    try {
      const filters = {
        dateFilter: req.query.dateFilter as string,
        priority: req.query.priority as string,
        department: req.query.department as string
      };
      const stats = await storage.getPriorityStats(filters);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch priority stats" });
    }
  });

  app.get("/api/dashboard/trends", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const filters = {
        dateFilter: req.query.dateFilter as string,
        priority: req.query.priority as string,
        department: req.query.department as string
      };
      const trends = await storage.getTrendData(days, filters);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trend data" });
    }
  });

  // Tickets - TEMPORARILY BYPASS PERMISSIONS FOR TESTING
  app.get("/api/tickets", async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;
      
      // Para administradores, buscar TODOS os tickets sem filtros
      if (user && (user.role === 'admin' || user.role === 'administrador')) {
        console.log('Admin user requesting all tickets');
        const tickets = await storage.getAllTickets();
        console.log(`Admin got ${tickets.length} tickets`);
        res.json(tickets);
        return;
      }
      
      let filters: any = {
        createdBy: req.query.createdBy as string,
        departmentId: req.query.departmentId as string
      };

      // Apply hierarchy-based filtering for non-admin users
      if (user) {
        const userRole = user.role;
        const userId = user.id;
        
        console.log(`Filtering tickets for user: ${userId}, role: ${userRole}`);
        
        if (userRole === 'solicitante') {
          // Solicitantes só veem seus próprios tickets
          console.log('Applying solicitante filter - own tickets only');
          const tickets = await storage.getTicketsByUser(userId);
          const ownTickets = tickets.filter(ticket => ticket.createdBy === userId);
          console.log(`Solicitante ${userId} can see ${ownTickets.length} own tickets`);
          res.json(ownTickets);
          return;
        } else if (userRole === 'atendente') {
          // Atendentes veem tickets do departamento + próprios
          console.log('Applying atendente filter - department + own tickets');
          const userRecord = await storage.getUser(userId);
          if (userRecord?.departmentId) {
            const tickets = await storage.getTicketsByUser(userId);
            const departmentTickets = tickets.filter(ticket => 
              ticket.requesterDepartmentId === userRecord.departmentId || 
              ticket.responsibleDepartmentId === userRecord.departmentId ||
              ticket.createdBy === userId
            );
            console.log(`Atendente ${userId} can see ${departmentTickets.length} department tickets`);
            res.json(departmentTickets);
            return;
          } else {
            const tickets = await storage.getTicketsByUser(userId);
            const ownTickets = tickets.filter(ticket => ticket.createdBy === userId);
            res.json(ownTickets);
            return;
          }
        } else if (userRole === 'supervisor') {
          // Supervisores veem todos os tickets do departamento
          console.log('Applying supervisor filter - all department tickets');
          const userRecord = await storage.getUser(userId);
          if (userRecord?.departmentId) {
            const allTickets = await storage.getAllTickets();
            const departmentTickets = allTickets.filter(ticket => 
              ticket.requesterDepartmentId === userRecord.departmentId || 
              ticket.responsibleDepartmentId === userRecord.departmentId
            );
            console.log(`Supervisor ${userId} can see ${departmentTickets.length} department tickets`);
            res.json(departmentTickets);
            return;
          }
        }
      }
      
      // Fallback - for testing, return all tickets without any user filtering
      console.log('Fetching all tickets for testing (no user filtering)');
      const allTickets = await storage.getAllTickets();
      console.log(`Returning ${allTickets.length} tickets for testing`);
      res.json(allTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  // Endpoint para atribuir responsável a um ticket
  app.patch("/api/tickets/:id/assign", async (req, res) => {
    try {
      const ticketId = req.params.id;
      const { assignedTo } = req.body;
      console.log("ASSIGN - Request:", { ticketId, assignedTo, body: req.body });
      
      // Validar se o usuário existe quando assignedTo não for null
      if (assignedTo) {
        const assignedUser = await storage.getUser(assignedTo);
        if (!assignedUser) {
          console.log("ASSIGN - Usuário não encontrado:", assignedTo);
          return res.status(400).json({ message: "Usuário não encontrado" });
        }
        console.log("ASSIGN - Usuário encontrado:", assignedUser.name);
      }
      
      // Update ticket assignment
      const updatedTicket = await storage.updateTicket(ticketId, { 
        assignedTo: assignedTo || null,
        updatedAt: new Date()
      });
      
      if (!updatedTicket) {
        console.log("ASSIGN - Ticket não encontrado:", ticketId);
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Get full ticket details with user info
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        console.log("ASSIGN - Erro ao buscar detalhes do ticket:", ticketId);
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      console.log("ASSIGN - Sucesso:", { ticketId, assignedTo, ticketNumber: ticket.ticketNumber });
      console.log("ASSIGN - Ticket assignedToUser:", ticket.assignedToUser);
      
      // Notify WebSocket clients of ticket assignment
      const wsServer = getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastUpdate('ticket_updated', { ticket });
        wsServer.notifyDashboardUpdate();
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("ASSIGN - Erro:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create ticket
  app.post("/api/tickets", async (req, res) => {
    try {
      console.log("Request body:", req.body);
      
      // Pegar usuário atual simulado (em produção viria da sessão)
      const users = await storage.getAllUsers();
      const currentUser = users.find(u => u.role === 'admin') || users[0];
      
      if (!currentUser) {
        return res.status(400).json({ message: "Usuário não encontrado" });
      }
      
      // Adicionar createdBy automaticamente e converter prioridade
      const ticketData = {
        ...req.body,
        createdBy: currentUser.id,
        requesterDepartmentId: req.body.requesterDepartment || currentUser.departmentId || null,
        responsibleDepartmentId: req.body.responsibleDepartment || null,
        // Campos detalhados do solicitante vindos do formulário
        requesterName: req.body.requesterName || req.body.fullName || currentUser.name,
        requesterEmail: req.body.requesterEmail || req.body.email || currentUser.email,
        requesterPhone: req.body.requesterPhone || req.body.phone || '',
        // Salvar TODOS os dados do formulário original como JSON
        formData: JSON.stringify({
          fullName: req.body.requesterName || req.body.fullName,
          email: req.body.requesterEmail || req.body.email,
          phone: req.body.requesterPhone || req.body.phone,
          requesterDepartment: req.body.requesterDepartment,
          responsibleDepartment: req.body.responsibleDepartment,
          category: req.body.category,
          customFields: req.body.customFields || {},
          originalRequestBody: req.body // Salvar o corpo completo da requisição
        }),
        priority: req.body.priority === 'Baixa' || req.body.priority === 'baixa' || req.body.priority === 'low' ? 'low' : 
                  req.body.priority === 'Média' || req.body.priority === 'média' || req.body.priority === 'medium' ? 'medium' :
                  req.body.priority === 'Alta' || req.body.priority === 'alta' || req.body.priority === 'high' ? 'high' :
                  req.body.priority === 'Crítica' || req.body.priority === 'crítica' || req.body.priority === 'critical' ? 'critical' : 'medium'
      };
      
      const validatedData = insertTicketSchema.parse(ticketData);
      console.log("Validated data:", validatedData);
      const ticket = await storage.createTicket(validatedData);
      
      // Notify WebSocket clients of new ticket
      const wsServer = getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastUpdate('ticket_created', { ticket });
        wsServer.notifyDashboardUpdate();
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      console.log("PATCH /api/tickets/:id - Request body:", req.body);
      console.log("PATCH /api/tickets/:id - Ticket ID:", req.params.id);
      
      // Keep timestamp fields as strings for validation
      const processedData = { ...req.body };
      
      const validatedData = updateTicketSchema.parse(processedData);
      console.log("PATCH /api/tickets/:id - Validated data:", validatedData);
      
      const ticket = await storage.updateTicket(req.params.id, validatedData);
      if (!ticket) {
        console.log("PATCH /api/tickets/:id - Ticket not found:", req.params.id);
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      console.log("PATCH /api/tickets/:id - Updated ticket:", ticket);
      
      // Notify WebSocket clients of ticket update
      const wsServer = getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastUpdate('ticket_updated', { ticket });
        wsServer.notifyDashboardUpdate();
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("PATCH /api/tickets/:id - Error:", error);
      if (error instanceof z.ZodError) {
        console.error("PATCH /api/tickets/:id - Validation errors:", error.errors);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTicket(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // Endpoint específico para finalizar tickets
  app.patch("/api/tickets/:id/finalize", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, finalizationData, progress } = req.body;
      
      // Atualizar o ticket com status resolvido e dados de finalização
      const updateData = {
        status: status || 'resolved',
        progress: progress || 100,
        resolvedAt: new Date(),
        // Salvar dados de finalização nos metadados ou campos específicos
        finalizationComment: finalizationData?.comment,
        hoursSpent: finalizationData?.hoursSpent,
        equipmentRemoved: finalizationData?.equipmentRemoved,
        materialsUsed: finalizationData?.materialsUsed,
        extraCharge: finalizationData?.extraCharge,
        chargeType: finalizationData?.chargeType,
        finalizedAt: new Date().toISOString()
      };
      
      const ticket = await storage.updateTicket(id, updateData);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Notify WebSocket clients of ticket finalization
      const wsServer = getWebSocketServer();
      if (wsServer) {
        console.log('Sending WebSocket notification for ticket finalization:', ticket.id);
        wsServer.broadcastUpdate('ticket_updated', { ticket, action: 'finalized' });
        wsServer.notifyDashboardUpdate();
        console.log('WebSocket notification sent');
      } else {
        console.log('WebSocket server not available');
      }
      
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error finalizing ticket:", error);
      res.status(500).json({ message: "Failed to finalize ticket" });
    }
  });

  // Comments
  app.get("/api/tickets/:ticketId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByTicket(req.params.ticketId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/tickets/:ticketId/comments", async (req, res) => {
    try {
      console.log("POST /api/tickets/:ticketId/comments - Request body:", req.body);
      console.log("POST /api/tickets/:ticketId/comments - Ticket ID:", req.params.ticketId);
      
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const commentData = {
        ...req.body,
        ticketId: req.params.ticketId,
        userId: currentUser.id,
      };
      
      console.log("POST /api/tickets/:ticketId/comments - Comment data:", commentData);
      
      const validatedData = insertCommentSchema.parse(commentData);
      console.log("POST /api/tickets/:ticketId/comments - Validated data:", validatedData);
      
      const comment = await storage.createComment(validatedData);
      console.log("POST /api/tickets/:ticketId/comments - Created comment:", comment);
      
      // Notify WebSocket clients of new comment
      const wsServer = getWebSocketServer();
      if (wsServer) {
        wsServer.broadcastUpdate('comment_created', { comment });
      }
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("POST /api/tickets/:ticketId/comments - Error:", error);
      if (error instanceof z.ZodError) {
        console.error("POST /api/tickets/:ticketId/comments - Validation errors:", error.errors);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // User management endpoints



  // Users - Protected by users_view permission
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        departmentId: user.departmentId,
        isBlocked: user.isBlocked,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get assignable users (baseado em permissões - não solicitantes)
  app.get("/api/users/assignable", async (req, res) => {
    try {
      const users = await storage.getAssignableUsers();
      console.log(`Requisição de usuários atribuíveis: ${users.length} encontrados`);
      res.json(users);
    } catch (error) {
      console.error("Error fetching assignable users:", error);
      res.status(500).json({ message: "Failed to fetch assignable users" });
    }
  });

  // Get all roles with user counts
  app.get('/api/roles', async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error getting roles:', error);
      res.status(500).json({ message: 'Failed to get roles' });
    }
  });

  // Buscar permissões de uma função específica
  app.get('/api/permissions/roles/:roleId', async (req, res) => {
    try {
      const { roleId } = req.params;
      const permissions = await storage.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      console.error('Error getting role permissions:', error);
      res.status(500).json({ message: 'Failed to get role permissions' });
    }
  });

  // Change user password endpoint - requires users_edit permission
  app.put("/api/users/:id/change-password", requirePermission('perm_users_edit'), async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      const success = await storage.changeUserPassword(id, password);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Block/Unblock user endpoint - requires users_edit permission
  app.put("/api/users/:id/block", requirePermission('perm_users_edit'), async (req, res) => {
    try {
      const { id } = req.params;
      const { block } = req.body;
      
      const success = await storage.blockUser(id, block);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const action = block ? "blocked" : "unblocked";
      res.json({ message: `User ${action} successfully` });
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Delete user endpoint - requires users_delete permission
  app.delete("/api/users/:id", requirePermission('perm_users_delete'), async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Attempting to delete user with ID:', id);
      
      // Verificar se o usuário existe primeiro
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        console.log('User not found for deletion:', id);
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        console.log('Delete operation failed for user:', id);
        return res.status(500).json({ message: "Falha ao deletar usuário" });
      }
      
      console.log('User deleted successfully:', id);
      res.json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para buscar usuários que podem ser atribuídos a tickets (DEVE vir antes do endpoint parametrizado)
  app.get("/api/users/assignable", async (req, res) => {
    try {
      console.log("🎯 Endpoint /api/users/assignable chamado");
      const assignableUsers = await storage.getAssignableUsers();
      console.log("🎯 Retornando", assignableUsers.length, "usuários atribuíveis");
      res.json(assignableUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários atribuíveis:", error);
      res.status(500).json({ message: "Erro ao buscar usuários atribuíveis" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        hierarchy: user.hierarchy,
        departmentId: user.departmentId,
        isBlocked: user.isBlocked,
        isActive: user.isActive
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", requirePermission('perm_users_create'), async (req, res) => {
    try {
      // Validar campos obrigatórios
      if (!req.body.name || !req.body.email || !req.body.password || !req.body.role || !req.body.departmentId) {
        return res.status(400).json({ 
          message: "Todos os campos são obrigatórios: nome, email, senha, função e departamento" 
        });
      }

      // Hash the password before storing
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      
      const userData = {
        ...req.body,
        username: req.body.email.split('@')[0],
        password: hashedPassword
      };
      
      // Validação simples dos dados
      if (!userData.name.trim() || !userData.email.trim() || !req.body.password.trim()) {
        return res.status(400).json({ message: "Dados inválidos" });
      }
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user - endpoint completo para edição de perfil
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      console.log('Updating user:', id, updateData);
      
      // Verificar se o usuário existe
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        console.log(`User with id ${id} not found`);
        return res.status(404).json({ message: `User with id ${id} not found` });
      }

      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Get user performance data
  app.get("/api/users/:id/performance", async (req, res) => {
    try {
      const performance = await storage.getUserPerformance(req.params.id);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user performance" });
    }
  });

  // Get user activity logs
  app.get("/api/users/:id/activities", async (req, res) => {
    try {
      const activities = await storage.getUserActivities(req.params.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user activities" });
    }
  });

  // Get user permissions based on role
  app.get("/api/users/:id/permissions", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const permissions = await storage.getRolePermissions(user.role);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  // PATCH user security - permitir acesso temporário
  app.patch("/api/users/:id/security", async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword, forcePasswordChange } = req.body;

      // Validate password
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          message: "A senha deve ter pelo menos 6 caracteres"
        });
      }

      // Get user to verify existence
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({
          message: "Usuário não encontrado"
        });
      }

      // Hash the new password (in a real app, use bcrypt)
      const hashedPassword = `hashed_${newPassword}`;

      // Update user security settings
      const securityUpdate = {
        password: hashedPassword,
        forcePasswordChange: forcePasswordChange || false,
        passwordChangedAt: new Date().toISOString(),
        passwordChangedBy: 'admin' // In real app, get from auth middleware
      };

      const updatedUser = await storage.updateUser(id, securityUpdate);
      
      res.json({
        message: "Configurações de segurança atualizadas com sucesso",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          passwordChangedAt: securityUpdate.passwordChangedAt
        }
      });
    } catch (error) {
      console.error("Error updating user security:", error);
      res.status(500).json({
        message: "Erro interno do servidor"
      });
    }
  });

  // PATCH user block/unblock status - permitir acesso temporário  
  app.patch("/api/users/:id/block", async (req, res) => {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;

      // Get user to verify existence
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({
          message: "Usuário não encontrado"
        });
      }

      // Update user block status
      const blockUpdate = {
        isBlocked: isBlocked,
        isActive: !isBlocked, // Se bloqueado, não está ativo
        blockedAt: isBlocked ? new Date().toISOString() : null,
        blockedBy: isBlocked ? 'admin' : null, // In real app, get from auth middleware
        updatedAt: new Date().toISOString()
      };

      const updatedUser = await storage.updateUser(id, blockUpdate);
      
      res.json({
        message: `Usuário ${isBlocked ? 'bloqueado' : 'desbloqueado'} com sucesso`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          isBlocked: updatedUser.isBlocked,
          isActive: updatedUser.isActive
        }
      });
    } catch (error) {
      console.error("Error updating user block status:", error);
      res.status(500).json({
        message: "Erro interno do servidor"
      });
    }
  });

  // Department routes - permitir acesso sem restrição por enquanto
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await departmentStorage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const department = await departmentStorage.getDepartment(req.params.id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", 
    requireRole("administrador"),
    async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await departmentStorage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(400).json({ message: "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", 
    requireRole("administrador"),
    async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      const department = await departmentStorage.updateDepartment(req.params.id, validatedData);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(400).json({ message: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", 
    requireRole("administrador"),
    async (req, res) => {
    try {
      const success = await departmentStorage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Get custom field values for a ticket
  app.get("/api/tickets/:ticketId/custom-fields", async (req, res) => {
    try {
      console.log("🔍 API: Fetching custom fields for ticket:", req.params.ticketId);
      const customFieldValues = await storage.getCustomFieldValuesByTicket(req.params.ticketId);
      console.log("🔍 API: Found custom field values:", customFieldValues);
      res.json(customFieldValues);
    } catch (error) {
      console.error("Error fetching custom field values:", error);
      res.status(500).json({ message: "Failed to fetch custom field values" });
    }
  });

  // Endpoint para notificações
  app.get('/api/notifications', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: 'userId é obrigatório' });
      }

      // Buscar tickets atribuídos ao usuário que estão abertos
      const assignedTickets = await storage.getAllTickets({
        assignedTo: userId
      });

      // Filtrar apenas tickets abertos/em progresso
      const openTickets = assignedTickets.filter(ticket => 
        ['open', 'in_progress', 'pending'].includes(ticket.status)
      );

      // Gerar notificações baseadas nos tickets
      const notifications = openTickets.map(ticket => {
        const createdTime = new Date(ticket.createdAt);
        const now = new Date();
        const hoursPassed = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
        
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let type: 'ticket_assigned' | 'sla_warning' = 'ticket_assigned';
        
        // Determinar prioridade baseada no tempo
        if (hoursPassed > 4) {
          priority = 'critical';
          type = 'sla_warning';
        } else if (hoursPassed > 2) {
          priority = 'high';
        } else if (hoursPassed > 1) {
          priority = 'medium';
        }

        return {
          id: `ticket-${ticket.id}`,
          type,
          title: type === 'sla_warning' ? 'Alerta de SLA!' : 'Ticket Atribuído',
          message: `${ticket.subject} - ${ticket.requesterName || 'Cliente'}`,
          ticketId: ticket.id,
          timestamp: ticket.createdAt,
          read: false,
          priority
        };
      });

      res.json(notifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.get("/api/categories/department/:departmentId", async (req, res) => {
    try {
      const { departmentId } = req.params;
      const categories = await storage.getCategoriesByDepartment(departmentId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories by department:", error);
      res.status(500).json({ message: "Failed to fetch categories by department" });
    }
  });

  // Configuration routes  
  app.get("/api/config/status", async (req, res) => {
    try {
      console.log("📊 Buscando configurações de status...");
      const statusConfigs = await storage.getAllStatusConfig();
      console.log("📊 Status configs encontrados:", statusConfigs.length);
      res.json(statusConfigs);
    } catch (error) {
      console.error("❌ Error fetching status configs:", error);
      res.status(500).json({ message: "Failed to fetch status configurations" });
    }
  });

  app.post("/api/config/status", async (req, res) => {
    try {
      const statusConfig = await storage.createStatusConfig(req.body);
      res.json(statusConfig);
    } catch (error) {
      console.error("Error creating status config:", error);
      res.status(500).json({ message: "Failed to create status configuration" });
    }
  });

  app.put("/api/config/status/:id", async (req, res) => {
    try {
      const statusConfig = await storage.updateStatusConfig(req.params.id, req.body);
      res.json(statusConfig);
    } catch (error) {
      console.error("Error updating status config:", error);
      res.status(500).json({ message: "Failed to update status configuration" });
    }
  });

  app.delete("/api/config/status/:id", async (req, res) => {
    try {
      await storage.deleteStatusConfig(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting status config:", error);
      res.status(500).json({ message: "Failed to delete status configuration" });
    }
  });

  app.get("/api/config/priority", async (req, res) => {
    try {
      console.log("📊 Buscando configurações de prioridade...");
      const priorityConfigs = await storage.getAllPriorityConfig();
      console.log("📊 Priority configs encontrados:", priorityConfigs.length);
      res.json(priorityConfigs);
    } catch (error) {
      console.error("❌ Error fetching priority configs:", error);
      res.status(500).json({ message: "Failed to fetch priority configurations" });
    }
  });

  app.post("/api/config/priority", async (req, res) => {
    try {
      const priorityConfig = await storage.createPriorityConfig(req.body);
      res.json(priorityConfig);
    } catch (error) {
      console.error("Error creating priority config:", error);
      res.status(500).json({ message: "Failed to create priority configuration" });
    }
  });

  app.put("/api/config/priority/:id", async (req, res) => {
    try {
      const priorityConfig = await storage.updatePriorityConfig(req.params.id, req.body);
      res.json(priorityConfig);
    } catch (error) {
      console.error("Error updating priority config:", error);
      res.status(500).json({ message: "Failed to update priority configuration" });
    }
  });

  app.delete("/api/config/priority/:id", async (req, res) => {
    try {
      await storage.deletePriorityConfig(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting priority config:", error);
      res.status(500).json({ message: "Failed to delete priority configuration" });
    }
  });

  // Pause/Resume ticket endpoints
  app.post("/api/tickets/:id/pause", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, details, estimatedHours } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Motivo é obrigatório" });
      }
      
      // Update ticket status to 'on_hold' and create pause record
      await storage.updateTicket(id, { status: 'on_hold' });
      
      // Create pause record with estimated return time
      const duration = estimatedHours ? parseInt(estimatedHours) : 24; // Default 24 hours if not provided
      const pauseRecord = await storage.createPauseRecord(id, reason, duration, details);
      
      // Notify real-time updates
      const updatedTicket = await storage.getTicket(id);
      // Real-time updates will be handled by WebSocket in separate module
      
      res.json({ 
        success: true, 
        pauseRecord,
        message: `Ticket pausado por ${duration} horas. SLA pausado durante este período.`
      });
    } catch (error) {
      console.error("Error pausing ticket:", error);
      res.status(500).json({ message: "Failed to pause ticket" });
    }
  });

  app.post("/api/tickets/:id/resume", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.resumeTicket(id);
      res.json({ success });
    } catch (error) {
      console.error("Error resuming ticket:", error);
      res.status(500).json({ message: "Failed to resume ticket" });
    }
  });

  app.get("/api/tickets/:id/pause-records", async (req, res) => {
    try {
      const { id } = req.params;
      const pauseRecords = await storage.getTicketPauseRecords(id);
      res.json(pauseRecords);
    } catch (error) {
      console.error("Error fetching pause records:", error);
      res.status(500).json({ message: "Failed to fetch pause records" });
    }
  });

  // SLA endpoints
  app.get("/api/sla/rules", async (req, res) => {
    try {
      const slaRules = await storage.getSLARules();
      res.json(slaRules);
    } catch (error) {
      console.error("Error fetching SLA rules:", error);
      res.status(500).json({ message: "Failed to fetch SLA rules" });
    }
  });

  app.post("/api/sla/rules", async (req, res) => {
    try {
      const slaRule = await storage.createSLARule(req.body);
      res.json(slaRule);
    } catch (error) {
      console.error("Error creating SLA rule:", error);
      res.status(500).json({ message: "Failed to create SLA rule" });
    }
  });

  app.put("/api/sla/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const slaRule = await storage.updateSLARule(id, req.body);
      res.json(slaRule);
    } catch (error) {
      console.error("Error updating SLA rule:", error);
      res.status(500).json({ message: "Failed to update SLA rule" });
    }
  });

  app.delete("/api/sla/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSLARule(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting SLA rule:", error);
      res.status(500).json({ message: "Failed to delete SLA rule" });
    }
  });

  // Advanced Reports API
  app.get("/api/reports/filtered-tickets", async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        departmentId,
        priority,
        status,
        assignedTo,
        createdBy
      } = req.query;

      const tickets = await storage.getFilteredTickets({
        startDate: startDate as string,
        endDate: endDate as string,
        departmentId: departmentId as string,
        priority: priority as string,
        status: status as string,
        assignedTo: assignedTo as string,
        createdBy: createdBy as string,
      });
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching filtered tickets:", error);
      res.status(500).json({ message: "Failed to fetch filtered tickets" });
    }
  });

  app.get("/api/reports/department-performance", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const performance = await storage.getDepartmentPerformance(
        startDate as string,
        endDate as string
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching department performance:", error);
      res.status(500).json({ message: "Failed to fetch department performance" });
    }
  });

  app.get("/api/reports/user-performance", async (req, res) => {
    try {
      const { startDate, endDate, departmentId } = req.query;
      const performance = await storage.getUserPerformance(
        startDate as string,
        endDate as string,
        departmentId as string
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching user performance:", error);
      res.status(500).json({ message: "Failed to fetch user performance" });
    }
  });

  app.get("/api/reports/resolution-time-analysis", async (req, res) => {
    try {
      const { startDate, endDate, departmentId } = req.query;
      const analysis = await storage.getResolutionTimeAnalysis(
        startDate as string,
        endDate as string,
        departmentId as string
      );
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching resolution time analysis:", error);
      res.status(500).json({ message: "Failed to fetch resolution time analysis" });
    }
  });

  // Excluir ticket (apenas para administradores)
  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = req.params.id;
      
      // Verificar se o ticket existe
      const ticket = await storage.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Excluir o ticket
      await storage.deleteTicket(ticketId);
      
      res.json({ message: "Ticket excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Erro ao excluir ticket" });
    }
  });

  // Rota para migrar números de tickets existentes
  app.post("/api/migrate-ticket-numbers", async (req, res) => {
    try {
      await storage.migrateTicketNumbers();
      res.json({ message: "Ticket numbers migrated successfully" });
    } catch (error) {
      console.error("Error migrating ticket numbers:", error);
      res.status(500).json({ message: "Failed to migrate ticket numbers" });
    }
  });

  // Custom Fields
  app.get("/api/custom-fields", async (req, res) => {
    try {
      const fields = await storage.getCustomFields();
      res.json(fields);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });

  app.get("/api/custom-fields/category/:categoryId", async (req, res) => {
    try {
      const { departmentId } = req.query;
      
      if (!departmentId) {
        return res.status(400).json({ message: "departmentId query parameter is required" });
      }
      
      const fields = await storage.getCustomFieldsByCategoryAndDepartment(
        req.params.categoryId,
        departmentId as string
      );
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      res.status(500).json({ message: "Failed to fetch custom fields for category" });
    }
  });

  app.post("/api/custom-fields", async (req, res) => {
    try {
      const validatedData = insertCustomFieldSchema.parse(req.body);
      const field = await storage.createCustomField(validatedData);
      res.status(201).json(field);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create custom field" });
    }
  });

  app.patch("/api/custom-fields/:id", async (req, res) => {
    try {
      console.log("Updating custom field:", req.params.id, req.body);
      const field = await storage.updateCustomField(req.params.id, req.body);
      if (!field) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json(field);
    } catch (error) {
      console.error("Error updating custom field:", error);
      res.status(500).json({ message: "Failed to update custom field", error: error.message });
    }
  });

  app.delete("/api/custom-fields/:id", async (req, res) => {
    try {
      console.log("🗑️ Deletando campo customizado:", req.params.id);
      const deleted = await storage.deleteCustomField(req.params.id);
      
      if (deleted) {
        console.log("✅ Campo customizado deletado com sucesso");
        res.status(204).send();
      } else {
        console.log("❌ Campo customizado não encontrado");
        res.status(404).json({ message: "Custom field not found" });
      }
    } catch (error) {
      console.error("❌ Erro ao deletar campo customizado:", error);
      res.status(500).json({ message: "Failed to delete custom field", error: error.message });
    }
  });

  // Register Service Order routes
  registerServiceOrderRoutes(app);

  // Reports endpoints
  app.get("/api/reports/filtered-tickets", async (req, res) => {
    try {
      const tickets = await storage.getFilteredTickets(req.query);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching filtered tickets:", error);
      res.status(500).json({ message: "Failed to fetch filtered tickets" });
    }
  });

  app.get("/api/reports/department-performance", async (req, res) => {
    try {
      const performance = await storage.getDepartmentPerformance();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching department performance:", error);
      res.status(500).json({ message: "Failed to fetch department performance" });
    }
  });

  app.get("/api/reports/user-performance", async (req, res) => {
    try {
      const performance = await storage.getTeamPerformance();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching user performance:", error);
      res.status(500).json({ message: "Failed to fetch user performance" });
    }
  });

  app.get("/api/reports/resolution-time-analysis", async (req, res) => {
    try {
      const analysis = [
        { category: "< 1 hora", count: 45, percentage: 30 },
        { category: "1-4 horas", count: 60, percentage: 40 },
        { category: "4-24 horas", count: 30, percentage: 20 },
        { category: "> 24 horas", count: 15, percentage: 10 }
      ];
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching resolution time analysis:", error);
      res.status(500).json({ message: "Failed to fetch resolution time analysis" });
    }
  });



  app.get("/api/config/sla", async (req, res) => {
    try {
      const slaConfigs = await storage.getAllSlaConfig();
      res.json(slaConfigs);
    } catch (error) {
      console.error("Error fetching SLA config:", error);
      res.status(500).json({ message: "Failed to fetch SLA configuration" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
