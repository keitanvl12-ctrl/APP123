import { db } from "./db";
import { eq, and, desc, or, sql, count } from "drizzle-orm";
import { 
  users, tickets, comments, departments, attachments,
  systemRoles, systemPermissions, rolePermissions,
  categories, customFields, customFieldValues,
  type User, type InsertUser, type Ticket, type InsertTicket
} from "@shared/schema";

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
    const roles = await db.select().from(systemRoles);
    return roles.map(role => ({
      ...role,
      permissions: 0, // Simplified for now
      userCount: 0,  // Simplified for now
    }));
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

  async getCustomFieldsByForm(formId: string): Promise<any[]> {
    try {
      const fields = await db.select().from(customFields);
      return fields;
    } catch (error) {
      console.error("Error fetching custom fields:", error);
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
      await db.delete(customFields).where(eq(customFields.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting custom field:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();