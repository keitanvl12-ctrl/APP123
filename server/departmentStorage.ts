import { db } from "./db";
import { departments, users, tickets } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { Department, InsertDepartment, User, Ticket, TicketWithDetails } from "@shared/schema";

export class DatabaseDepartmentStorage {
  // Department methods
  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db
      .insert(departments)
      .values(insertDepartment)
      .returning();
    return department;
  }

  async updateDepartment(id: string, updates: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [department] = await db
      .update(departments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return department || undefined;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return result.rowCount > 0;
  }

  // Department-specific user methods
  async getUsersByDepartment(departmentId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.departmentId, departmentId));
  }

  // Department-specific ticket methods
  async getTicketsByDepartment(departmentId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.departmentId, departmentId));
  }

  // Check if user can access ticket (same department)
  async canUserAccessTicket(userId: string, ticketId: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return false;

    // Admin can access all tickets
    if (user.role === 'admin') return true;

    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));
    if (!ticket) return false;

    // Users can only access tickets from their department
    return user.departmentId === ticket.departmentId;
  }

  // Get tickets accessible by user (same department or admin)
  async getAccessibleTickets(userId: string): Promise<Ticket[]> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return [];

    // Admin can see all tickets
    if (user.role === 'admin') {
      return await db.select().from(tickets);
    }

    // Users can only see tickets from their department
    if (user.departmentId) {
      return await db.select().from(tickets).where(eq(tickets.departmentId, user.departmentId));
    }

    return [];
  }
}

export const departmentStorage = new DatabaseDepartmentStorage();