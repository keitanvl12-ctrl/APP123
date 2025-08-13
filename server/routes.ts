import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

// Real authentication middleware
const isAuthenticated = async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Get user from database with their permissions
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Get user permissions
    const permissions = await storage.getUserPermissions(user.id);
    
    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.role || 'colaborador',
      permissions
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("📡 Registering routes...");
  
  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email e senha são obrigatórios'
        });
      }

      console.log('🔐 Tentativa de login para:', email);

      // Find user by email in database
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log('❌ Usuário não encontrado:', email);
        return res.status(401).json({
          message: 'Credenciais inválidas'
        });
      }

      console.log('👤 Usuário encontrado:', user.name, 'Role:', user.role);

      let isValidPassword = false;
      
      try {
        if (user.password) {
          // Check if password is already hashed (starts with $2b$)
          if (user.password.startsWith('$2b$')) {
            console.log('🔒 Comparando senha com hash bcrypt');
            isValidPassword = await bcrypt.compare(password, user.password);
          } else {
            console.log('🔓 Senha em texto simples detectada - convertendo');
            // Handle legacy plaintext passwords - convert to hash after login
            isValidPassword = (password === user.password);
            if (isValidPassword) {
              // Update with hashed password for future logins
              const hashedPassword = await bcrypt.hash(password, 10);
              await storage.updateUser(user.id, { password: hashedPassword });
              console.log('✅ Senha convertida para hash');
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro na validação da senha:', error);
        isValidPassword = false;
      }

      if (!isValidPassword) {
        console.log('❌ Senha inválida para:', email);
        return res.status(401).json({
          message: 'Credenciais inválidas'
        });
      }

      console.log('✅ Login bem-sucedido para:', email);

      // Get user permissions
      const permissions = await storage.getUserPermissions(user.id);
      console.log('🔑 Permissões do usuário:', permissions.length);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          permissions
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Update last login time
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          ...userWithoutPassword,
          permissions
        }
      });

    } catch (error) {
      console.error('❌ Erro no login:', error);
      res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      // Get full user data from database
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado no sistema' });
      }

      // Get fresh permissions
      const permissions = await storage.getUserPermissions(user.id);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        permissions
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: 'Logout realizado com sucesso' });
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

  // SIMPLE TICKETS ENDPOINT - EMERGENCY FIX
  app.get("/api/tickets", async (req, res) => {
    try {
      console.log("📋 GET /api/tickets endpoint called");
      const tickets = await storage.getAllTickets();
      console.log(`✅ Returning ${tickets.length} tickets`);
      res.json(tickets);
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Get single ticket
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

  // Create ticket
  app.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  // Update ticket
  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Delete ticket
  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      await storage.deleteTicket(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Subcategories
  app.get("/api/subcategories", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      if (categoryId) {
        const subcategories = await storage.getSubcategoriesByCategory(categoryId);
        res.json(subcategories);
      } else {
        const subcategories = await storage.getAllSubcategories();
        res.json(subcategories);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  // Custom Fields
  app.get("/api/custom-fields", async (req, res) => {
    try {
      const subcategoryId = req.query.subcategoryId as string;
      if (subcategoryId) {
        const customFields = await storage.getCustomFieldsBySubcategory(subcategoryId);
        res.json(customFields);
      } else {
        const customFields = await storage.getAllCustomFields();
        res.json(customFields);
      }
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Departments
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // Status Configuration Routes
  app.get("/api/config/status", async (req, res) => {
    try {
      const statusConfigs = await storage.getAllStatusConfig();
      res.json(statusConfigs);
    } catch (error) {
      console.error("Error fetching status configs:", error);
      res.status(500).json({ message: "Failed to fetch status configurations" });
    }
  });

  app.post("/api/config/status", async (req, res) => {
    try {
      const statusConfig = await storage.createStatusConfig(req.body);
      res.status(201).json(statusConfig);
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
      const success = await storage.deleteStatusConfig(req.params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Status configuration not found" });
      }
    } catch (error) {
      console.error("Error deleting status config:", error);
      res.status(500).json({ message: "Failed to delete status configuration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}