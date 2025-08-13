import { db } from "./db";
import { eq, and, desc, or, sql, count, asc, like, inArray } from "drizzle-orm";
import { 
  users, tickets, comments, department, attachments,
  systemRoles, systemPermissions, rolePermissions,
  categories, subcategories, customFields, customFieldValues,
  statusConfig, priorityConfig, slaConfig, slaRules,
  type User, type InsertUser, type Ticket, type InsertTicket,
  type Subcategory, type InsertSubcategory
} from "@shared/schema";
import { calculateSLA } from "./slaCalculator";
import { calculateRemainingBusinessHours, isWithinBusinessHours } from "./businessHours";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserPermissions(userId: string): Promise<string[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Ticket operations
  getAllTickets(): Promise<any[]>;
  getAllTicketsWithSLA(): Promise<any[]>;
  getTicket(id: string): Promise<any>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: any): Promise<Ticket>;
  deleteTicket(id: string): Promise<boolean>;
  
  // Role operations
  getAllRoles(): Promise<any[]>;
  
  // Dashboard operations
  getDashboardStats(filters?: any): Promise<any>;
  getPriorityStats(filters?: any): Promise<any>;
  getTrendData(days: number, filters?: any): Promise<any>;
  
  // Additional required methods for compatibility
  getTicketsByUser(userId: string): Promise<any[]>;
  getFilteredTickets(filters?: any): Promise<any[]>;
  getTeamPerformance(): Promise<any[]>;
  getDepartmentStats(): Promise<any[]>;
  getDepartmentPerformance(): Promise<any[]>;
  getAssignableUsers(): Promise<any[]>;
  createComment(comment: any): Promise<any>;
  getAllCategories(): Promise<any[]>;
  
  // Subcategory operations
  getAllSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: string, updates: Partial<Subcategory>): Promise<Subcategory>;
  deleteSubcategory(id: string): Promise<boolean>;
  getAllStatusConfig(): Promise<any[]>;
  createStatusConfig(config: any): Promise<any>;
  updateStatusConfig(id: string, updates: any): Promise<any>;
  deleteStatusConfig(id: string): Promise<boolean>;
  getAllPriorityConfig(): Promise<any[]>;
  getAllSlaConfig(): Promise<any[]>;
  getSLARules(): Promise<any[]>;
  createSLARule(rule: any): Promise<any>;
  updateSLARule(id: string, rule: any): Promise<any>;
  getCustomFieldsByForm(formType: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User Management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      console.log(`🔍 Getting permissions for user ${userId}`);
      
      // Get user to find their role
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User ${userId} not found`);
        return [];
      }
      
      console.log(`👤 User ${userId} has role: ${user.role}`);
      
      // Get permissions for the user's role using pool for compatibility
      const { pool } = await import("./db");
      const result = await pool.query(`
        SELECT sp.code 
        FROM role_permissions rp
        JOIN system_permissions sp ON rp.permission_id = sp.id
        WHERE rp.role_id = $1
      `, [user.role]);
      
      const permissions = result.rows.map(row => row.code);
      console.log(`🔑 User ${userId} permissions:`, permissions);
      
      return permissions;
    } catch (error) {
      console.error(`❌ Error getting permissions for user ${userId}:`, error);
      return [];
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.departmentId === '') {
      cleanUpdates.departmentId = null;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...cleanUpdates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Ticket Management
  async getAllTickets(): Promise<any[]> {
    try {
      console.log("📋 Fetching all tickets...");
      
      const ticketList = await db
        .select({
          id: tickets.id,
          ticketNumber: tickets.ticketNumber,
          subject: tickets.subject,
          description: tickets.description,
          status: tickets.status,
          priority: tickets.priority,
          categoryId: tickets.categoryId,
          subcategoryId: tickets.subcategoryId,
          pausedAt: tickets.pausedAt,
          pauseReason: tickets.pauseReason,
          createdBy: tickets.createdBy,
          assignedTo: tickets.assignedTo,
          createdAt: tickets.createdAt,
          updatedAt: tickets.updatedAt,
          resolvedAt: tickets.resolvedAt,
          requesterName: tickets.requesterName,
          requesterEmail: tickets.requesterEmail,
          requesterPhone: tickets.requesterPhone,
          formData: tickets.formData,
          createdByUser: {
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          },
          categoryName: categories.name,
          subcategoryName: subcategories.name,
        })
        .from(tickets)
        .leftJoin(users, eq(tickets.createdBy, users.id))
        .leftJoin(categories, eq(tickets.categoryId, categories.id))
        .leftJoin(subcategories, eq(tickets.subcategoryId, subcategories.id))
        .orderBy(desc(tickets.createdAt));

      console.log("✅ Found tickets:", ticketList.length);
      return ticketList;
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
      return [];
    }
  }

  async getAllTicketsWithSLA(): Promise<any[]> {
    // Get basic tickets
    const ticketList = await this.getAllTickets();
    
    // Get SLA rules and categories
    const slaRulesList = await this.getSLARules();
    const categoriesList = await this.getAllCategories();
    
    console.log(`📊 Categories loaded: ${categoriesList?.length || 0}`);
    if (categoriesList?.length > 0) {
      console.log(`📝 Sample categories:`, categoriesList.slice(0, 2).map(c => ({ id: c.id, name: c.name })));
    }
    
    // Calculate SLA for each ticket
    const ticketsWithSLA = await Promise.all(ticketList.map(async (ticket) => {
      try {
        // Find applicable SLA rule based on priority, category or department
        let applicableSLA = null;
        let slaHours = 4; // Default 4 hours
        let slaSourceName = 'padrão';
        
        // Try to find SLA rule by category first (highest priority)
        if (ticket.categoryId && slaRulesList?.length > 0) {
          // Find category name by ID - load fresh categories if needed
          if (!categoriesList || categoriesList.length === 0) {
            console.log('🔄 Reloading categories...');
            const freshCategories = await this.getAllCategories();
            console.log(`📊 Fresh categories loaded: ${freshCategories?.length || 0}`);
          }
          
          const categoryObj = categoriesList?.find(cat => cat.id === ticket.categoryId);
          const categoryName = categoryObj?.name;
          
          console.log(`🔍 Looking for category ID: ${ticket.categoryId}`);
          console.log(`📝 Found category name: ${categoryName || 'NOT FOUND'}`);
          
          if (categoryName) {
            applicableSLA = slaRulesList.find(rule => 
              rule.category === categoryName && rule.isActive
            );
            console.log(`🔍 SLA rule search by category "${categoryName}":`, applicableSLA ? 'FOUND' : 'NOT FOUND');
            if (applicableSLA) {
              console.log(`✅ Found SLA rule: ${JSON.stringify(applicableSLA)}`);
            }
          }
        }
        
        // Then by priority
        if (!applicableSLA && ticket.priority && slaRulesList?.length > 0) {
          applicableSLA = slaRulesList.find(rule => 
            rule.priority === ticket.priority && rule.isActive
          );
          console.log(`🔍 SLA rule search by priority "${ticket.priority}":`, applicableSLA ? 'FOUND' : 'NOT FOUND');
        }
        
        // Then by department
        if (!applicableSLA && ticket.requesterDepartmentId && slaRulesList?.length > 0) {
          applicableSLA = slaRulesList.find(rule => 
            rule.departmentId === ticket.requesterDepartmentId && rule.isActive
          );
        }
        
        // Use configured SLA hours if found
        if (applicableSLA && applicableSLA.resolutionTime) {
          slaHours = applicableSLA.resolutionTime;
          slaSourceName = applicableSLA.name || 'configurado';
          console.log(`✅ Using SLA rule: ${slaSourceName}, ${slaHours}h for ticket ${ticket.ticketNumber}`);
        } else {
          console.log(`⚠️ No SLA rule found for ticket ${ticket.ticketNumber}, using default 4h`);
        }
        
        // Calculate progress percentage usando nova função que considera pausas
        const createdAt = new Date(ticket.createdAt);
        const now = new Date();
        
        // Calculate SLA with business hours and pause considerations
        let progressPercent = 0;
        let effectiveHours = 0;
        let remainingHours = 0;
        let deadline = new Date();
        
        if (ticket.status === 'on_hold' && ticket.pausedAt) {
          // For paused tickets, calculate business hours until pause
          const pausedAt = new Date(ticket.pausedAt);
          const businessHoursCalc = calculateRemainingBusinessHours(createdAt, slaHours, pausedAt);
          effectiveHours = businessHoursCalc.effectiveHours;
          remainingHours = businessHoursCalc.remainingHours;
          deadline = businessHoursCalc.deadline;
          
          const pausedTime = (now.getTime() - pausedAt.getTime()) / (1000 * 60 * 60);
          console.log(`⏸️ TICKET ${ticket.ticketNumber} pausado há ${pausedTime.toFixed(1)}h - SLA congelado (apenas horário útil)`);
        } else if (ticket.status === 'resolved' && ticket.resolvedAt) {
          // For resolved tickets, calculate business hours until resolution
          const resolvedAt = new Date(ticket.resolvedAt);
          const businessHoursCalc = calculateRemainingBusinessHours(createdAt, slaHours, resolvedAt);
          effectiveHours = businessHoursCalc.effectiveHours;
          remainingHours = 0; // Resolved tickets have no remaining time
          deadline = businessHoursCalc.deadline;
        } else {
          // For active tickets, calculate current business hours progress
          const businessHoursCalc = calculateRemainingBusinessHours(createdAt, slaHours);
          effectiveHours = businessHoursCalc.effectiveHours;
          remainingHours = businessHoursCalc.remainingHours;
          deadline = businessHoursCalc.deadline;
          
          // If outside business hours, SLA is paused
          if (!isWithinBusinessHours(now)) {
            console.log(`🌙 TICKET ${ticket.ticketNumber} - Fora do horário útil, SLA pausado automaticamente`);
          }
        }
        
        // Calculate progress based on business hours only
        progressPercent = Math.min(100, (effectiveHours / slaHours) * 100);
        
        // Determine SLA status
        let slaStatus = 'met';
        if (progressPercent >= 100) {
          slaStatus = 'violated';
        } else if (progressPercent >= 80) {
          slaStatus = 'at_risk';
        }
        
        // Use business hours calculated deadline and remaining time
        if (ticket.status === 'on_hold') {
          console.log(`⏸️ TICKET ${ticket.ticketNumber} - Tempo restante congelado: ${remainingHours.toFixed(1)}h (horário útil)`);
        } else if (ticket.status === 'resolved') {
          console.log(`✅ TICKET ${ticket.ticketNumber} - Resolvido em ${effectiveHours.toFixed(1)}h (horário útil)`);
        } else if (!isWithinBusinessHours(now)) {
          console.log(`🌙 TICKET ${ticket.ticketNumber} - SLA pausado (fora do horário: ${remainingHours.toFixed(1)}h restantes)`);
        } else {
          console.log(`⏰ TICKET ${ticket.ticketNumber} - Ativo no horário útil: ${remainingHours.toFixed(1)}h restantes`);
        }
        
        return {
          ...ticket,
          slaHoursTotal: slaHours,
          slaHoursRemaining: remainingHours,
          slaProgressPercent: Math.round(progressPercent),
          slaStatus: slaStatus,
          slaSource: slaSourceName,
          slaDeadline: deadline.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          effectiveHoursUsed: effectiveHours,
          isWithinBusinessHours: isWithinBusinessHours(now)
        };
      } catch (error) {
        console.error(`Error calculating SLA for ticket ${ticket.id}:`, error);
        // Return ticket with default 4-hour SLA
        const createdAt = new Date(ticket.createdAt);
        const now = new Date();
        
        let progressPercent = 0;
        if (ticket.status === 'resolved' || ticket.status === 'on_hold') {
          // Manter progresso atual se já existe
          if (ticket.slaProgressPercent) {
            progressPercent = ticket.slaProgressPercent;
          } else {
            const endTime = ticket.resolvedAt ? new Date(ticket.resolvedAt) : now;
            const totalHours = (endTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            progressPercent = Math.min(100, (totalHours / 4) * 100);
          }
        } else {
          // Para tickets ativos, calcular progresso em tempo real
          const totalHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          progressPercent = Math.min(100, (totalHours / 4) * 100);
        }
        
        // Calculate remaining time for active tickets only
        let hoursRemaining = 0;
        if (ticket.status !== 'resolved' && ticket.status !== 'on_hold') {
          const totalHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          hoursRemaining = Math.max(0, 4 - totalHours);
        } else {
          // Para tickets pausados/resolvidos, manter tempo restante
          hoursRemaining = ticket.slaHoursRemaining || 0;
        }
        
        return {
          ...ticket,
          slaHoursTotal: 4,
          slaHoursRemaining: hoursRemaining,
          slaProgressPercent: Math.round(progressPercent),
          slaStatus: progressPercent >= 100 ? 'violated' : (progressPercent >= 80 ? 'at_risk' : 'met'),
          slaSource: 'padrão',
          slaDeadline: new Date(createdAt.getTime() + (4 * 60 * 60 * 1000)).toLocaleString('pt-BR')
        };
      }
    }));
    
    return ticketsWithSLA;
  }

  async getTicket(id: string): Promise<any> {
    const [ticket] = await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        categoryId: tickets.categoryId,
        subcategoryId: tickets.subcategoryId,
        pausedAt: tickets.pausedAt,
        pauseReason: tickets.pauseReason,
        createdBy: tickets.createdBy,
        assignedTo: tickets.assignedTo,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        resolvedAt: tickets.resolvedAt,
        requesterName: tickets.requesterName,
        requesterEmail: tickets.requesterEmail,
        requesterPhone: tickets.requesterPhone,
        formData: tickets.formData,
        createdByUser: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
        categoryName: categories.name,
        subcategoryName: subcategories.name,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.createdBy, users.id))
      .leftJoin(categories, eq(tickets.categoryId, categories.id))
      .leftJoin(subcategories, eq(tickets.subcategoryId, subcategories.id))
      .where(eq(tickets.id, id));

    if (!ticket) return undefined;

    // Get comments
    const ticketComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.ticketId, id))
      .orderBy(desc(comments.createdAt));

    return {
      ...ticket,
      comments: ticketComments,
    };
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    // Generate ticket number - create a mutable copy
    const ticketData: any = { ...ticket };
    if (!ticketData.ticketNumber) {
      // Find the highest ticket number by extracting all ticket numbers and finding max
      const allTickets = await db
        .select({ ticketNumber: tickets.ticketNumber })
        .from(tickets)
        .where(like(tickets.ticketNumber, 'TICK-%'));
      
      let nextNumber = 1;
      if (allTickets.length > 0) {
        const numbers = allTickets
          .map(t => parseInt(t.ticketNumber.replace('TICK-', '')))
          .filter(n => !isNaN(n));
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }
      
      // Try to create with incrementing numbers until we find a free one
      let attempts = 0;
      const maxAttempts = 100; // Safety net
      
      while (attempts < maxAttempts) {
        const candidateNumber = `TICK-${(nextNumber + attempts).toString().padStart(3, '0')}`;
        
        // Check if this number already exists
        const existingTicket = await db
          .select({ id: tickets.id })
          .from(tickets)
          .where(eq(tickets.ticketNumber, candidateNumber))
          .limit(1);
        
        if (existingTicket.length === 0) {
          ticketData.ticketNumber = candidateNumber;
          break;
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique ticket number');
      }
    }
    
    console.log('🎫 Creating ticket with number:', ticketData.ticketNumber);
    const [newTicket] = await db.insert(tickets).values(ticketData).returning();
    return newTicket;
  }

  async updateTicket(id: string, updates: any): Promise<Ticket> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    
    if (!updatedTicket) {
      throw new Error(`Ticket with id ${id} not found`);
    }
    
    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    console.log('🗑️ Deletando ticket:', id);
    try {
      // First delete custom field values
      await db.delete(customFieldValues).where(eq(customFieldValues.ticketId, id));
      
      // Then delete related comments
      await db.delete(comments).where(eq(comments.ticketId, id));
      
      // Finally delete the ticket
      const result = await db.delete(tickets).where(eq(tickets.id, id));
      console.log('✅ Ticket deletado com sucesso:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar ticket:', error);
      throw error;
    }
  }

  // Role Management
  async getAllRoles(): Promise<any[]> {
    try {
      const roles = await db.select().from(systemRoles);
      
      // Buscar contagem de usuários para cada função
      const rolesWithCounts = await Promise.all(roles.map(async (role) => {
        // Contar usuários com esta função  
        console.log(`🔍 Contando usuários para função: ${role.id}`);
        const userCount = await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.role, role.id));
        
        console.log(`👥 Usuários encontrados para ${role.id}:`, userCount[0]?.count || 0);
        
        // Contar permissões da função
        console.log(`🔍 Contando permissões para função: ${role.id}`);
        const permissionCount = await db
          .select({ count: count() })
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, role.id));
        
        console.log(`🔑 Permissões encontradas para ${role.id}:`, permissionCount[0]?.count || 0);
        
        return {
          ...role,
          permissions: permissionCount[0]?.count || 0,
          userCount: userCount[0]?.count || 0,
        };
      }));
      
      return rolesWithCounts;
    } catch (error) {
      console.error('Error fetching roles with counts:', error);
      return [];
    }
  }

  // Dashboard Stats
  async getDashboardStats(filters?: any): Promise<any> {
    const totalTickets = await db.select({ count: count() }).from(tickets);
    const openTickets = await db
      .select({ count: count() })
      .from(tickets)
      .where(or(
        eq(tickets.status, 'open'),
        eq(tickets.status, 'in_progress'),
        eq(tickets.status, 'on_hold')
      ));

    return {
      totalTickets: totalTickets[0]?.count || 0,
      openTickets: openTickets[0]?.count || 0,
      resolvedToday: 0,
      criticalTickets: 0,
      avgResponseTime: '2.1h',
      totalTicketsChange: '+5%',
      openTicketsChange: '-3%',
      resolvedTodayChange: '+10%',
      avgResponseTimeChange: '-0.2h',
    };
  }

  async getPriorityStats(filters?: any): Promise<any> {
    return {
      critical: { count: 1, percentage: 25 },
      high: { count: 1, percentage: 25 },
      medium: { count: 1, percentage: 25 },
      low: { count: 1, percentage: 25 },
    };
  }

  async getTrendData(days: number, filters?: any): Promise<any> {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      created: Math.floor(Math.random() * 5),
      resolved: Math.floor(Math.random() * 3),
    })).reverse();
  }

  async getTicketsByUser(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(tickets)
      .where(or(
        eq(tickets.createdBy, userId),
        eq(tickets.assignedTo, userId)
      ));
  }

  async getFilteredTickets(filters?: any): Promise<any[]> {
    return await this.getAllTickets();
  }

  async getTeamPerformance(): Promise<any[]> {
    return [
      { name: 'Equipe TI', ticketsResolvidos: 45, tempoMedio: '2.1h', satisfacao: 92 },
      { name: 'Equipe RH', ticketsResolvidos: 23, tempoMedio: '1.8h', satisfacao: 88 },
      { name: 'Equipe Financeiro', ticketsResolvidos: 12, tempoMedio: '3.2h', satisfacao: 85 }
    ];
  }

  async getDepartmentStats(): Promise<any[]> {
    return [
      { id: '1', name: 'TI', totalTickets: 45, openTickets: 12, avgResolutionTime: '2.1h' },
      { id: '2', name: 'RH', totalTickets: 23, openTickets: 8, avgResolutionTime: '1.8h' },
      { id: '3', name: 'Financeiro', totalTickets: 12, openTickets: 3, avgResolutionTime: '3.2h' }
    ];
  }

  async getAllDepartments(): Promise<any[]> {
    try {
      const departments = await db.select().from(department);
      console.log(`🏢 Departments found: ${departments.length}`);
      return departments;
    } catch (error) {
      console.error("Error fetching departments:", error);
      return [];
    }
  }

  async getDepartmentPerformance(): Promise<any[]> {
    return [
      { name: 'TI', tickets: 45, resolved: 40, pending: 5, avgTime: '2.1h' },
      { name: 'RH', tickets: 23, resolved: 20, pending: 3, avgTime: '1.8h' },
      { name: 'Financeiro', tickets: 12, resolved: 10, pending: 2, avgTime: '3.2h' }
    ];
  }

  async getAssignableUsers(): Promise<any[]> {
    const users = await this.getAllUsers();
    return users.filter(user => user.role !== 'solicitante');
  }

  async createComment(comment: any): Promise<any> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getAllCategories(): Promise<any[]> {
    try {
      const categoriesResult = await db.select().from(categories);
      return categoriesResult;
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Return empty array if table doesn't exist or other error
      return [];
    }
  }

  async getCategoriesByDepartment(departmentId: string): Promise<any[]> {
    try {
      const categoriesResult = await db
        .select()
        .from(categories)
        .where(eq(categories.departmentId, departmentId))
        .orderBy(asc(categories.name));
      console.log(`📊 Categories for department ${departmentId}: ${categoriesResult.length} categories found`);
      if (categoriesResult.length > 0) {
        console.log(`📝 Sample categories for dept ${departmentId}:`, categoriesResult.map(c => c.name).slice(0, 3));
      }
      return categoriesResult;
    } catch (error) {
      console.error("Error fetching categories by department:", error);
      return [];
    }
  }

  async getAllStatusConfig(): Promise<any[]> {
    try {
      const result = await db.select().from(statusConfig);
      if (result && result.length > 0) {
        return result;
      }
    } catch (error) {
      console.error("Error fetching status config:", error);
    }
    
    // Retornar dados padrão sempre
    return [
      { id: 'open', name: 'Aberto', value: 'open', color: '#ef4444', order: 1, isActive: true, isDefault: true },
      { id: 'in_progress', name: 'Em Progresso', value: 'in_progress', color: '#3b82f6', order: 2, isActive: true, isDefault: false },
      { id: 'on_hold', name: 'Em Espera', value: 'on_hold', color: '#f59e0b', order: 3, isActive: true, isDefault: false },
      { id: 'resolved', name: 'Resolvido', value: 'resolved', color: '#10b981', order: 4, isActive: true, isDefault: false },
      { id: 'closed', name: 'Fechado', value: 'closed', color: '#6b7280', order: 5, isActive: true, isDefault: false }
    ];
  }

  async getAllPriorityConfig(): Promise<any[]> {
    try {
      const result = await db.select().from(priorityConfig);
      if (result && result.length > 0) {
        return result;
      }
    } catch (error) {
      console.error("Error fetching priority config:", error);
    }
    
    // Retornar dados padrão sempre
    return [
      { id: 'low', name: 'Baixa', value: 'low', color: '#10b981', order: 1, isActive: true, isDefault: true },
      { id: 'medium', name: 'Média', value: 'medium', color: '#f59e0b', order: 2, isActive: true, isDefault: false },
      { id: 'high', name: 'Alta', value: 'high', color: '#ef4444', order: 3, isActive: true, isDefault: false },
      { id: 'critical', name: 'Crítica', value: 'critical', color: '#dc2626', order: 4, isActive: true, isDefault: false }
    ];
  }

  async createStatusConfig(config: any): Promise<any> {
    try {
      const [result] = await db.insert(statusConfig).values(config).returning();
      return result;
    } catch (error) {
      console.error("Error creating status config:", error);
      throw error;
    }
  }

  async updateStatusConfig(id: string, updates: any): Promise<any> {
    try {
      const [result] = await db
        .update(statusConfig)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(statusConfig.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error updating status config:", error);
      throw error;
    }
  }

  async deleteStatusConfig(id: string): Promise<boolean> {
    try {
      await db.delete(statusConfig).where(eq(statusConfig.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting status config:", error);
      return false;
    }
  }

  async getSLARules(): Promise<any[]> {
    try {
      console.log("📊 Buscando regras SLA...");
      const slaRulesResult = await db.select().from(slaRules);
      console.log("📊 SLA rules encontrados:", slaRulesResult.length);
      return slaRulesResult;
    } catch (error) {
      console.error("❌ Error fetching SLA rules:", error);
      // Retornar dados padrão se tabela não existir
      return [
        {
          id: '1',
          name: 'SLA Crítico',
          priority: 'critical',
          responseTime: 1,
          resolutionTime: 4,
          escalationRules: JSON.stringify([
            { level: 1, hoursAfter: 1, notifyRoles: ['supervisor'] },
            { level: 2, hoursAfter: 2, notifyRoles: ['administrador'] }
          ]),
          isActive: true
        },
        {
          id: '2',
          name: 'SLA Alto',
          priority: 'high',
          responseTime: 2,
          resolutionTime: 8,
          escalationRules: JSON.stringify([
            { level: 1, hoursAfter: 4, notifyRoles: ['supervisor'] }
          ]),
          isActive: true
        },
        {
          id: '3',
          name: 'SLA Médio',
          priority: 'medium',
          responseTime: 4,
          resolutionTime: 24,
          escalationRules: JSON.stringify([]),
          isActive: true
        },
        {
          id: '4',
          name: 'SLA Baixo',
          priority: 'low',
          responseTime: 8,
          resolutionTime: 72,
          escalationRules: JSON.stringify([]),
          isActive: true
        }
      ];
    }
  }

  async getAllSlaConfig(): Promise<any[]> {
    try {
      const slaConfigResult = await db.select().from(slaConfig);
      return slaConfigResult;
    } catch (error) {
      console.error("Error fetching SLA config:", error);
      return [
        {
          id: '1',
          categoryId: null,
          priority: 'critical',
          responseTimeHours: 1,
          resolutionTimeHours: 4,
          escalationRules: JSON.stringify([
            { level: 1, hoursAfter: 2, notifyRoles: ['supervisor'] },
            { level: 2, hoursAfter: 4, notifyRoles: ['administrador'] }
          ]),
          isActive: true
        },
        {
          id: '2',
          categoryId: null,
          priority: 'high',
          responseTimeHours: 2,
          resolutionTimeHours: 8,
          escalationRules: JSON.stringify([
            { level: 1, hoursAfter: 4, notifyRoles: ['supervisor'] }
          ]),
          isActive: true
        },
        {
          id: '3',
          categoryId: null,
          priority: 'medium',
          responseTimeHours: 4,
          resolutionTimeHours: 24,
          escalationRules: JSON.stringify([]),
          isActive: true
        },
        {
          id: '4',
          categoryId: null,
          priority: 'low',
          responseTimeHours: 8,
          resolutionTimeHours: 72,
          escalationRules: JSON.stringify([]),
          isActive: true
        }
      ];
    }
  }

  async getCustomFieldsByForm(formType: string): Promise<any[]> {
    try {
      const customFieldsResult = await db.select().from(customFields);
      return customFieldsResult;
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      return [];
    }
  }

  async createCategory(categoryData: any): Promise<any> {
    try {
      const [category] = await db.insert(categories).values(categoryData).returning();
      return category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(id: string, categoryData: any): Promise<any> {
    try {
      const [category] = await db
        .update(categories)
        .set({ ...categoryData, updatedAt: new Date() })
        .where(eq(categories.id, id))
        .returning();
      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }

  async getCustomFields(): Promise<any[]> {
    try {
      const fields = await db.select().from(customFields);
      console.log('✅ Custom fields fetched successfully:', fields.length);
      return fields;
    } catch (error) {
      console.error("❌ Error fetching custom fields:", error);
      return [];
    }
  }

  async getTicketCustomFieldValues(ticketId: string): Promise<any[]> {
    try {
      console.log("📋 Buscando valores de campos customizados para ticket:", ticketId);
      
      const result = await db
        .select({
          id: customFieldValues.id,
          value: customFieldValues.value,
          customField: {
            id: customFields.id,
            name: customFields.name,
            type: customFields.type,
            required: customFields.required,
            order: customFields.order
          }
        })
        .from(customFieldValues)
        .innerJoin(customFields, eq(customFieldValues.customFieldId, customFields.id))
        .where(eq(customFieldValues.ticketId, ticketId))
        .orderBy(asc(customFields.order));

      console.log("✅ Valores encontrados:", result.length);
      return result;
    } catch (error) {
      console.error("❌ Erro ao buscar valores de campos customizados:", error);
      return [];
    }
  }

  async getCustomFieldsBySubcategory(subcategoryId: string): Promise<any[]> {
    try {
      console.log("🔍 Buscando campos customizados para subcategoria:", subcategoryId);
      const fields = await db
        .select()
        .from(customFields)
        .where(and(
          eq(customFields.subcategoryId, subcategoryId),
          eq(customFields.isActive, true)
        ))
        .orderBy(customFields.order);
      
      console.log("✅ Campos encontrados para subcategoria:", fields.length);
      return fields;
    } catch (error) {
      console.error("❌ Erro ao buscar campos da subcategoria:", error);
      return [];
    }
  }



  async getCustomFieldsByCategoryAndDepartment(categoryId: string, departmentId: string): Promise<any[]> {
    try {
      console.log(`📊 Buscando campos para categoria ${categoryId} e departamento ${departmentId}`);
      
      // Buscar subcategorias da categoria
      const subcategoriesForCategory = await db
        .select({ id: subcategories.id })
        .from(subcategories)
        .where(eq(subcategories.categoryId, categoryId));
      
      if (subcategoriesForCategory.length === 0) {
        console.log("❌ Nenhuma subcategoria encontrada para a categoria");
        return [];
      }
      
      const subcategoryIds = subcategoriesForCategory.map(sub => sub.id);
      
      // Buscar campos das subcategorias
      const fields = await db
        .select()
        .from(customFields)
        .where(
          and(
            inArray(customFields.subcategoryId, subcategoryIds),
            eq(customFields.isActive, true)
          )
        )
        .orderBy(customFields.order);
      
      console.log(`✅ Campos encontrados: ${fields.length}`);
      return fields;
    } catch (error) {
      console.error("❌ Error fetching custom fields by category and department:", error);
      return [];
    }
  }

  async getCustomFieldValuesByTicket(ticketId: string): Promise<any[]> {
    try {
      const values = await db
        .select({
          id: customFieldValues.id,
          ticketId: customFieldValues.ticketId,
          customFieldId: customFieldValues.customFieldId,
          value: customFieldValues.value,
          createdAt: customFieldValues.createdAt,
          customField: {
            id: customFields.id,
            name: customFields.name,
            type: customFields.type,
            required: customFields.required,
            placeholder: customFields.placeholder,
            options: customFields.options
          }
        })
        .from(customFieldValues)
        .innerJoin(customFields, eq(customFieldValues.customFieldId, customFields.id))
        .where(eq(customFieldValues.ticketId, ticketId));
      
      console.log("🔍 Custom field values with metadata:", values);
      return values;
    } catch (error) {
      console.error("Error fetching custom field values:", error);
      return [];
    }
  }

  async createCustomField(fieldData: any): Promise<any> {
    try {
      const [field] = await db.insert(customFields).values(fieldData).returning();
      return field;
    } catch (error) {
      console.error("Error creating custom field:", error);
      throw error;
    }
  }

  async updateCustomField(id: string, fieldData: any): Promise<any> {
    try {
      const [field] = await db
        .update(customFields)
        .set({ ...fieldData, updatedAt: new Date() })
        .where(eq(customFields.id, id))
        .returning();
      return field;
    } catch (error) {
      console.error("Error updating custom field:", error);
      throw error;
    }
  }

  async deleteCustomField(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Tentando deletar campo customizado: ${id}`);
      
      // Primeiro, listar todos os campos para debug
      const allFields = await db.select({ id: customFields.id, name: customFields.name }).from(customFields);
      console.log(`🔍 Campos existentes no banco:`, allFields);
      
      // Verificar se o campo existe
      const existingField = await db
        .select()
        .from(customFields)
        .where(eq(customFields.id, id))
        .limit(1);
      
      if (existingField.length === 0) {
        console.log(`❌ Campo customizado não encontrado: ${id}`);
        console.log(`🔍 Campos disponíveis:`, allFields.map(f => f.id));
        throw new Error(`Campo não encontrado com ID: ${id}`);
      }
      
      console.log(`✅ Campo encontrado:`, existingField[0]);
      
      // Deletar valores associados primeiro
      const deletedValues = await db.delete(customFieldValues).where(eq(customFieldValues.customFieldId, id));
      console.log(`🗑️ Valores do campo deletados:`, deletedValues);
      
      // Depois deletar o campo
      const deletedField = await db.delete(customFields).where(eq(customFields.id, id));
      console.log(`✅ Campo customizado deletado:`, deletedField);
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao deletar campo customizado ${id}:`, error);
      throw error;
    }
  }

  async createSLARule(ruleData: any): Promise<any> {
    try {
      console.log("📊 Criando regra SLA:", ruleData);
      const [rule] = await db.insert(slaRules).values(ruleData).returning();
      return rule;
    } catch (error) {
      console.error("❌ Error creating SLA rule:", error);
      throw error;
    }
  }

  async updateSLARule(id: string, ruleData: any): Promise<any> {
    try {
      console.log("📊 Atualizando regra SLA:", id, ruleData);
      const [rule] = await db
        .update(slaRules)
        .set({ ...ruleData, updatedAt: new Date() })
        .where(eq(slaRules.id, id))
        .returning();
      return rule;
    } catch (error) {
      console.error("❌ Error updating SLA rule:", error);
      throw error;
    }
  }

  async getRolePermissions(roleId: string): Promise<any[]> {
    try {
      console.log(`Buscando permissões para função: ${roleId}`);
      
      // Buscar permissões atribuídas à função específica pelo ID
      const permissionsResult = await db
        .select({
          permissionId: rolePermissions.permissionId,
          permissionCode: systemPermissions.code,
          code: systemPermissions.code,
          name: systemPermissions.name,
          description: systemPermissions.description,
          category: systemPermissions.category
        })
        .from(rolePermissions)
        .innerJoin(systemPermissions, eq(rolePermissions.permissionId, systemPermissions.id))
        .where(eq(rolePermissions.roleId, roleId));

      console.log(`Permissões encontradas para função ${roleId}:`, permissionsResult.length);
      return permissionsResult;
      
    } catch (error) {
      console.error('Erro ao buscar permissões da função:', error);
      return [];
    }
  }

  async createCustomFieldValue(valueData: any): Promise<any> {
    try {
      console.log('🔍 Creating custom field value:', valueData);
      const [value] = await db.insert(customFieldValues).values(valueData).returning();
      return value;
    } catch (error) {
      console.error("Error creating custom field value:", error);
      throw error;
    }
  }

  async updateCustomFieldValue(ticketId: string, customFieldId: string, value: string): Promise<any> {
    try {
      const [updatedValue] = await db
        .update(customFieldValues)
        .set({ value })
        .where(
          and(
            eq(customFieldValues.ticketId, ticketId),
            eq(customFieldValues.customFieldId, customFieldId)
          )
        )
        .returning();
      return updatedValue;
    } catch (error) {
      console.error("Error updating custom field value:", error);
      throw error;
    }
  }

  async deleteCustomFieldValue(ticketId: string, customFieldId: string): Promise<boolean> {
    try {
      await db
        .delete(customFieldValues)
        .where(
          and(
            eq(customFieldValues.ticketId, ticketId),
            eq(customFieldValues.customFieldId, customFieldId)
          )
        );
      return true;
    } catch (error) {
      console.error("Error deleting custom field value:", error);
      return false;
    }
  }

  // Subcategory operations implementation
  async getAllSubcategories(): Promise<Subcategory[]> {
    try {
      const allSubcategories = await db.select().from(subcategories).orderBy(subcategories.name);
      console.log(`📊 Subcategories loaded: ${allSubcategories.length}`);
      return allSubcategories;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    try {
      console.log(`📊 Buscando subcategorias para categoria: ${categoryId}`);
      const result = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, categoryId))
        .orderBy(subcategories.name);
      
      console.log(`✅ Subcategorias encontradas: ${result.length}`);
      return result;
    } catch (error) {
      console.error("Error fetching subcategories by category:", error);
      return [];
    }
  }



  async createSubcategory(subcategoryData: InsertSubcategory): Promise<Subcategory> {
    try {
      const [subcategory] = await db.insert(subcategories).values(subcategoryData).returning();
      console.log("✅ Subcategory created:", subcategory.name);
      return subcategory;
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  }

  async updateSubcategory(id: string, updates: Partial<Subcategory>): Promise<Subcategory> {
    try {
      const [subcategory] = await db
        .update(subcategories)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(subcategories.id, id))
        .returning();
      
      if (!subcategory) {
        throw new Error(`Subcategory with id ${id} not found`);
      }
      
      console.log("✅ Subcategory updated:", subcategory.name);
      return subcategory;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    try {
      // First check if subcategory has custom fields
      const fieldsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(customFields)
        .where(eq(customFields.subcategoryId, id));
      
      if (fieldsCount[0]?.count > 0) {
        throw new Error("Cannot delete subcategory: has associated custom fields");
      }
      
      await db.delete(subcategories).where(eq(subcategories.id, id));
      console.log("✅ Subcategory deleted:", id);
      return true;
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();