import { Router, type IRouter } from "express";
import { db, categoriesTable, templatesTable } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  GetCategoryParams,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);

  const result = await Promise.all(
    categories.map(async (cat) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(templatesTable)
        .where(eq(templatesTable.categoryId, cat.id));

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        iconUrl: cat.iconUrl ?? null,
        templateCount: countResult?.count ?? 0,
        createdAt: cat.createdAt.toISOString(),
      };
    })
  );

  res.json(result);
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, iconUrl } = parsed.data;

  const [cat] = await db.insert(categoriesTable).values({
    name,
    slug: slugify(name),
    description,
    iconUrl: iconUrl ?? null,
  }).returning();

  res.status(201).json({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    iconUrl: cat.iconUrl ?? null,
    templateCount: 0,
    createdAt: cat.createdAt.toISOString(),
  });
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const params = GetCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const templates = await db
    .select()
    .from(templatesTable)
    .where(eq(templatesTable.categoryId, cat.id));

  res.json({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    iconUrl: cat.iconUrl ?? null,
    templateCount: templates.length,
    createdAt: cat.createdAt.toISOString(),
    templates: templates.map((t) => ({
      id: t.id,
      categoryId: t.categoryId,
      categoryName: cat.name,
      name: t.name,
      description: t.description,
      imageUrl: t.imageUrl,
      price: t.price,
      isFeatured: t.isFeatured,
      createdAt: t.createdAt.toISOString(),
    })),
  });
});

router.put("/categories/:id", async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, iconUrl } = parsed.data;

  const [cat] = await db
    .update(categoriesTable)
    .set({
      name,
      slug: slugify(name),
      description,
      iconUrl: iconUrl ?? null,
    })
    .where(eq(categoriesTable.id, params.data.id))
    .returning();

  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(templatesTable)
    .where(eq(templatesTable.categoryId, cat.id));

  res.json({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    iconUrl: cat.iconUrl ?? null,
    templateCount: countResult?.count ?? 0,
    createdAt: cat.createdAt.toISOString(),
  });
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cat] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();

  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.json({ message: "Category deleted successfully" });
});

export default router;
