import { pgTable, text, serial, timestamp, integer, real, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { templatesTable } from "./templates";

export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "completed", "cancelled"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => usersTable.id),
  templateId: integer("template_id").notNull().references(() => templatesTable.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalPrice: real("total_price").notNull(),
  customization: jsonb("customization").notNull().$type<{
    hostName?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    rsvpDetails?: string;
    customMessage?: string;
    guestName?: string;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
