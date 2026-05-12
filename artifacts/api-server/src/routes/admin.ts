import { Router, type IRouter } from "express";
import { db, ordersTable, templatesTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [totalOrdersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  const [pendingOrdersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [completedOrdersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "completed"));
  const [revenueResult] = await db.select({ total: sql<number>`coalesce(sum(total_price), 0)::real` }).from(ordersTable).where(eq(ordersTable.status, "completed"));
  const [totalTemplatesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(templatesTable);
  const [totalCategoriesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);
  const [totalCustomersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "customer"));

  res.json({
    totalOrders: totalOrdersResult?.count ?? 0,
    pendingOrders: pendingOrdersResult?.count ?? 0,
    completedOrders: completedOrdersResult?.count ?? 0,
    totalRevenue: revenueResult?.total ?? 0,
    totalTemplates: totalTemplatesResult?.count ?? 0,
    totalCategories: totalCategoriesResult?.count ?? 0,
    totalCustomers: totalCustomersResult?.count ?? 0,
  });
});

router.get("/admin/recent-orders", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(sql`${ordersTable.createdAt} desc`)
    .limit(10);

  const result = await Promise.all(
    orders.map(async (order) => {
      const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
      const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, order.templateId));
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
    })
  );

  res.json(result);
});

export default router;
