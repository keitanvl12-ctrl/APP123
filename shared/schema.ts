import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Definir hierarquia de roles - ordem importa para prioridade
export const roleEnum = pgEnum('user_role', ['solicitante', 'atendente', 'supervisor', 'administrador']);

// Usar o nome real da tabela existente
export const department = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isRequester: boolean("is_requester").default(true).notNull(), // Pode solicitar tickets
  isResponsible: boolean("is_responsible").default(true).notNull(), // Pode atender tickets
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Alias para compatibilidade
export const departments = department;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("solicitante"), // admin, supervisor, atendente, solicitante
  departmentId: varchar("department_id").references(() => departments.id),
  roleId: varchar("role_id"), // Novo campo para compatibilidade
  isActive: boolean("is_active").default(true).notNull(), // Para bloquear/desbloquear usuários
  isBlocked: boolean("is_blocked").default(false).notNull(), // Status de bloqueio
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  categoryId: varchar("category_id").references(() => categories.id), // ID da categoria
  subcategoryId: varchar("subcategory_id").references(() => subcategories.id), // ID da subcategoria
  tags: text("tags").array(), // Array de tags para categorização adicional
  // Informações detalhadas do solicitante
  requesterName: text("requester_name"), // Nome completo do solicitante
  requesterEmail: text("requester_email"), // E-mail do solicitante
  requesterPhone: text("requester_phone"), // Telefone do solicitante
  // Dados completos do formulário original como JSON
  formData: text("form_data"), // JSON com todas as respostas do formulário original
  requesterDepartmentId: varchar("requester_department_id").references(() => departments.id), // Departamento do solicitante (informativo)
  responsibleDepartmentId: varchar("responsible_department_id").references(() => departments.id), // Departamento responsável (determina categorização)
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  pauseReason: text("pause_reason"), // Motivo da pausa quando status = on_hold
  pausedAt: timestamp("paused_at"), // Data/hora quando foi pausado
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => tickets.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => tickets.id).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table linked to departments
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  departmentId: varchar("department_id").references(() => departments.id),
  slaHours: integer("sla_hours").default(24), // SLA deadline in hours
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subcategories table - nova estrutura hierárquica
export const subcategories = pgTable("subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  departmentId: varchar("department_id").references(() => departments.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Status Configuration table
export const statusConfig = pgTable("status_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // Nome do status (ex: "Aberto", "Em Andamento", "Resolvido")
  value: text("value").notNull().unique(), // Valor técnico (ex: "open", "in_progress", "resolved")
  color: text("color").notNull().default("#6b7280"), // Cor hexadecimal para exibição
  order: integer("order").notNull().default(0), // Ordem de exibição
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // Status padrão para novos tickets
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Priority Configuration table
export const priorityConfig = pgTable("priority_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // Nome da prioridade (ex: "Crítica", "Alta", "Média", "Baixa")
  value: text("value").notNull().unique(), // Valor técnico (ex: "critical", "high", "medium", "low")
  color: text("color").notNull().default("#6b7280"), // Cor hexadecimal para exibição
  slaHours: integer("sla_hours").notNull().default(24), // SLA em horas para esta prioridade
  order: integer("order").notNull().default(0), // Ordem de exibição
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // Prioridade padrão para novos tickets
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SLA Rules table
export const slaRules = pgTable("sla_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  departmentId: varchar("department_id").references(() => departments.id), // Nullable - applies to all departments if null
  category: text("category"), // Nullable - applies to all categories if null
  priority: text("priority"), // low, medium, high, critical - nullable for non-priority based SLAs
  responseTime: integer("response_time").notNull().default(24), // Response time in hours
  resolutionTime: integer("resolution_time").notNull().default(48), // Resolution time in hours
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SLA Configuration table
export const slaConfig = pgTable("sla_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => categories.id),
  priority: text("priority"), // critical, high, medium, low
  responseTimeHours: integer("response_time_hours").notNull().default(4),
  resolutionTimeHours: integer("resolution_time_hours").notNull().default(24),
  escalationRules: text("escalation_rules"), // JSON string with escalation rules
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Custom Fields table - agora vinculados à subcategoria
export const customFields = pgTable("custom_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subcategoryId: varchar("subcategory_id").references(() => subcategories.id, { onDelete: 'cascade' }).notNull(),
  departmentId: varchar("department_id").references(() => departments.id).notNull(), // Departamento que atende
  name: text("name").notNull(), // Nome do campo (ex: "Número do Patrimônio", "Setor do Equipamento")
  type: text("type").notNull().default("text"), // text, select, number, email, phone, date, checkbox
  required: boolean("required").default(false),
  placeholder: text("placeholder"),
  options: text("options").array(), // Para campos tipo select
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Custom Field Values table - stores the actual values for each ticket
export const customFieldValues = pgTable("custom_field_values", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => tickets.id).notNull(),
  customFieldId: varchar("custom_field_id").references(() => customFields.id).notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  pausedAt: true, // Omitir pausedAt pois será setado automaticamente
});

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomFieldValueSchema = createInsertSchema(customFieldValues).omit({
  id: true,
  createdAt: true,
});

// Schema para subcategorias
export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStatusConfigSchema = createInsertSchema(statusConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPriorityConfigSchema = createInsertSchema(priorityConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSlaRuleSchema = createInsertSchema(slaRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Custom types that are not inferred from tables

export interface TicketWithDetails extends Ticket {
  createdByUser?: User;
  assignedToUser?: User | null;
  department?: Department;
  requesterDepartment?: Department;
  responsibleDepartment?: Department;
  comments?: Array<Comment & { user: User }>;
  attachments?: Attachment[];
  slaStatus?: 'met' | 'at_risk' | 'violated';
  slaHoursRemaining?: number;
  slaHoursTotal?: number;
  slaSource?: string;
}

// Export types
export type Department = typeof departments.$inferSelect;
export type User = typeof users.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type StatusConfig = typeof statusConfig.$inferSelect;
export type PriorityConfig = typeof priorityConfig.$inferSelect;
export type SlaRule = typeof slaRules.$inferSelect;
export type CustomField = typeof customFields.$inferSelect;
export type CustomFieldValue = typeof customFieldValues.$inferSelect;
export type SystemRole = typeof systemRoles.$inferSelect;
export type SystemPermission = typeof systemPermissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertSystemRole = typeof systemRoles.$inferInsert;
export type InsertSystemPermission = typeof systemPermissions.$inferInsert;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type InsertStatusConfig = z.infer<typeof insertStatusConfigSchema>;
export type InsertPriorityConfig = z.infer<typeof insertPriorityConfigSchema>;
export type InsertSlaRule = z.infer<typeof insertSlaRuleSchema>;
export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;
export type InsertCustomFieldValue = z.infer<typeof insertCustomFieldValueSchema>;

// System roles table for managing custom roles
export const systemRoles = pgTable("system_roles", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("bg-gray-100 text-gray-800"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System permissions table
export const systemPermissions = pgTable("system_permissions", {
  id: varchar("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Role permissions junction table
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").references(() => systemRoles.id).notNull(),
  permissionId: varchar("permission_id").references(() => systemPermissions.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pause reasons table
export const pauseReasons = pgTable("pause_reasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => tickets.id),
  reason: text("reason").notNull(),
  pausedAt: timestamp("paused_at").defaultNow(),
  pausedBy: varchar("paused_by").references(() => users.id),
  expectedReturnAt: timestamp("expected_return_at"),
  resumedAt: timestamp("resumed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SLA tracking table for detailed SLA calculations
export const slaTracking = pgTable("sla_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => tickets.id),
  slaRuleId: varchar("sla_rule_id").references(() => slaRules.id),
  startedAt: timestamp("started_at").defaultNow(),
  pausedAt: timestamp("paused_at"),
  resumedAt: timestamp("resumed_at"),
  completedAt: timestamp("completed_at"),
  totalPausedMinutes: integer("total_paused_minutes").default(0),
  effectiveMinutes: integer("effective_minutes").default(0),
  status: varchar("status").notNull().default("active"), // active, paused, completed, breached
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PauseReason = typeof pauseReasons.$inferSelect;
export type InsertPauseReason = typeof pauseReasons.$inferInsert;
export type SlaTracking = typeof slaTracking.$inferSelect;
export type InsertSlaTracking = typeof slaTracking.$inferInsert;

// Update Ticket Schema with pause fields
export const updateTicketSchema = insertTicketSchema.partial().extend({
  pauseReason: z.string().optional(),
  pausedAt: z.string().datetime().optional().nullable(), // Accept ISO datetime string or null
  resolvedAt: z.string().datetime().optional().nullable(), // Accept ISO datetime string or null  
});

export type UpdateTicket = z.infer<typeof updateTicketSchema>;

export type DashboardStats = {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  resolvedToday: number;
  criticalTickets: number;
  averageResolutionTime: number;
  avgResponseTime: string;
  totalTicketsChange: string;
  openTicketsChange: string;
  resolvedTodayChange: string;
  avgResponseTimeChange: string;
};

export type PriorityStats = {
  critical: { count: number; percentage: number };
  high: { count: number; percentage: number };
  medium: { count: number; percentage: number };
  low: { count: number; percentage: number };
};

export type TrendData = {
  date: string;
  created: number;
  resolved: number;
};
