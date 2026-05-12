import { Router, type IRouter } from "express";
import { db, ordersTable, templatesTable, usersTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderBody,
  GetOrderParams,
  UpdateOrderParams,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function formatOrder(order: any, customer: any, template: any) {
  return {
    id: order.id,
    customerId: order.customerId,
    customerName: customer?.name ?? null,
    templateId: order.templateId,
    templateName: template?.name ?? null,
    templateImageUrl: template?.imageUrl ?? null,
    status: order.status,
    totalPrice: order.totalPrice,
    customization: order.customization,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!currentUser) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  let orders;
  if (currentUser.role === "admin") {
    orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  } else {
    orders = await db.select().from(ordersTable).where(eq(ordersTable.customerId, userId)).orderBy(ordersTable.createdAt);
  }

  const result = await Promise.all(
    orders.map(async (order) => {
      const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
      const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, order.templateId));
      return formatOrder(order, customer, template);
    })
  );

  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, parsed.data.templateId));
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  const [order] = await db.insert(ordersTable).values({
    customerId: userId,
    templateId: parsed.data.templateId,
    totalPrice: template.price,
    customization: parsed.data.customization ?? {},
    status: "pending",
  }).returning();

  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  res.status(201).json(formatOrder(order, customer, template));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, order.templateId));

  res.json(formatOrder(order, customer, template));
});

router.put("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.customization !== undefined) updateData.customization = parsed.data.customization;

  const [order] = await db
    .update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, order.templateId));

  res.json(formatOrder(order, customer, template));
});

export default router;
