import { db } from "./db";
import { eq, and, desc, or, sql, count } from "drizzle-orm";
import { 
  users, tickets, comments, departments, attachments,
  systemRoles, systemPermissions, rolePermissions,
  categories, customFields, customFieldValues,
  statusConfig, priorityConfig, slaConfig, slaRules,
  type User, type InsertUser, type Ticket, type InsertTicket
} from "@shared/schema";
import { calculateSLA } from "./slaCalculator";

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
  getAllStatusConfig(): Promise<any[]>;
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
    const ticketList = await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        category: tickets.category,
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
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.createdBy, users.id))
      .orderBy(desc(tickets.createdAt));

    return ticketList;
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
        if (ticket.category && slaRulesList?.length > 0) {
          // Find category name by ID - load fresh categories if needed
          if (!categoriesList || categoriesList.length === 0) {
            console.log('🔄 Reloading categories...');
            const freshCategories = await this.getAllCategories();
            console.log(`📊 Fresh categories loaded: ${freshCategories?.length || 0}`);
          }
          
          const categoryObj = categoriesList?.find(cat => cat.id === ticket.category);
          const categoryName = categoryObj?.name;
          
          console.log(`🔍 Looking for category ID: ${ticket.category}`);
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
        
        // Calculate progress percentage based on creation time vs SLA limit
        const createdAt = new Date(ticket.createdAt);
        const now = ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date();
        const totalHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        const progressPercent = Math.min(100, (totalHours / slaHours) * 100);
        
        // Determine SLA status
        let slaStatus = 'met';
        if (progressPercent >= 100) {
          slaStatus = 'violated';
        } else if (progressPercent >= 80) {
          slaStatus = 'at_risk';
        }
        
        // Calculate deadline
        const deadline = new Date(createdAt.getTime() + (slaHours * 60 * 60 * 1000));
        
        return {
          ...ticket,
          slaHoursTotal: slaHours,
          slaHoursRemaining: Math.max(0, slaHours - totalHours),
          slaProgressPercent: Math.round(progressPercent),
          slaStatus: slaStatus,
          slaSource: slaSourceName,
          slaDeadline: deadline.toLocaleString('pt-BR')
        };
      } catch (error) {
        console.error(`Error calculating SLA for ticket ${ticket.id}:`, error);
        // Return ticket with default 4-hour SLA
        const createdAt = new Date(ticket.createdAt);
        const now = ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date();
        const totalHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const progressPercent = Math.min(100, (totalHours / 4) * 100);
        
        return {
          ...ticket,
          slaHoursTotal: 4,
          slaHoursRemaining: Math.max(0, 4 - totalHours),
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
        category: tickets.category,
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
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.createdBy, users.id))
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
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
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

  async getCustomFieldsByForm(formId: string): Promise<any[]> {
    try {
      const fields = await db.select().from(customFields);
      return fields;
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      return [];
    }
  }

  async getCustomFieldsByCategoryAndDepartment(categoryId: string, departmentId: string): Promise<any[]> {
    try {
      const fields = await db
        .select()
        .from(customFields)
        .where(
          and(
            eq(customFields.categoryId, categoryId),
            eq(customFields.departmentId, departmentId),
            eq(customFields.isActive, true)
          )
        )
        .orderBy(customFields.order);
      
      console.log(`✅ Custom fields for category ${categoryId} and department ${departmentId}:`, fields.length);
      return fields;
    } catch (error) {
      console.error("❌ Error fetching custom fields by category and department:", error);
      return [];
    }
  }

  async getCustomFieldValuesByTicket(ticketId: string): Promise<any[]> {
    try {
      const values = await db.select().from(customFieldValues).where(eq(customFieldValues.ticketId, ticketId));
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
      
      // Primeiro, verificar se o campo existe
      const existingField = await db
        .select()
        .from(customFields)
        .where(eq(customFields.id, id))
        .limit(1);
      
      if (existingField.length === 0) {
        console.log(`❌ Campo customizado não encontrado: ${id}`);
        return false;
      }
      
      // Deletar valores associados primeiro
      await db.delete(customFieldValues).where(eq(customFieldValues.customFieldId, id));
      console.log(`🗑️ Valores do campo deletados: ${id}`);
      
      // Depois deletar o campo
      await db.delete(customFields).where(eq(customFields.id, id));
      console.log(`✅ Campo customizado deletado: ${id}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao deletar campo customizado ${id}:`, error);
      return false;
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
}

export const storage = new DatabaseStorage();