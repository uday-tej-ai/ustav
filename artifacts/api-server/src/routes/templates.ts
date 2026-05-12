import { Router, type IRouter } from "express";
import { db, templatesTable, categoriesTable } from "@workspace/db";
import {
  CreateTemplateBody,
  UpdateTemplateBody,
  GetTemplateParams,
  UpdateTemplateParams,
  DeleteTemplateParams,
  ListTemplatesQueryParams,
} from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";

const router: IRouter = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/templates", async (req, res): Promise<void> => {
  const params = ListTemplatesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db
    .select({
      id: templatesTable.id,
      categoryId: templatesTable.categoryId,
      categoryName: categoriesTable.name,
      name: templatesTable.name,
      description: templatesTable.description,
      imageUrl: templatesTable.imageUrl,
      price: templatesTable.price,
      isFeatured: templatesTable.isFeatured,
      createdAt: templatesTable.createdAt,
    })
    .from(templatesTable)
    .leftJoin(categoriesTable, eq(templatesTable.categoryId, categoriesTable.id))
    .$dynamic();

  const conditions = [];
  if (params.data.categoryId) {
    conditions.push(eq(templatesTable.categoryId, params.data.categoryId));
  }
  if (params.data.featured !== undefined) {
    conditions.push(eq(templatesTable.isFeatured, params.data.featured));
  }

  const rows = conditions.length > 0
    ? await query.where(conditions.length === 1 ? conditions[0] : and(...conditions))
    : await query;

  res.json(rows.map((t) => ({
    ...t,
    categoryName: t.categoryName ?? null,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.post("/templates", async (req, res): Promise<void> => {
  const parsed = CreateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [template] = await db.insert(templatesTable).values({
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl,
    price: parsed.data.price,
    isFeatured: parsed.data.isFeatured ?? false,
  }).returning();

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, template.categoryId));

  res.status(201).json({
    id: template.id,
    categoryId: template.categoryId,
    categoryName: cat?.name ?? null,
    name: template.name,
    description: template.description,
    imageUrl: template.imageUrl,
    price: template.price,
    isFeatured: template.isFeatured,
    createdAt: template.createdAt.toISOString(),
  });
});

router.get("/templates/:id", async (req, res): Promise<void> => {
  const params = GetTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: templatesTable.id,
      categoryId: templatesTable.categoryId,
      categoryName: categoriesTable.name,
      name: templatesTable.name,
      description: templatesTable.description,
      imageUrl: templatesTable.imageUrl,
      price: templatesTable.price,
      isFeatured: templatesTable.isFeatured,
      createdAt: templatesTable.createdAt,
    })
    .from(templatesTable)
    .leftJoin(categoriesTable, eq(templatesTable.categoryId, categoriesTable.id))
    .where(eq(templatesTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json({
    ...row,
    categoryName: row.categoryName ?? null,
    createdAt: row.createdAt.toISOString(),
  });
});

router.put("/templates/:id", async (req, res): Promise<void> => {
  const params = UpdateTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.categoryId !== undefined) updateData.categoryId = parsed.data.categoryId;
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
  if (parsed.data.isFeatured !== undefined) updateData.isFeatured = parsed.data.isFeatured;

  const [template] = await db
    .update(templatesTable)
    .set(updateData)
    .where(eq(templatesTable.id, params.data.id))
    .returning();

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, template.categoryId));

  res.json({
    id: template.id,
    categoryId: template.categoryId,
    categoryName: cat?.name ?? null,
    name: template.name,
    description: template.description,
    imageUrl: template.imageUrl,
    price: template.price,
    isFeatured: template.isFeatured,
    createdAt: template.createdAt.toISOString(),
  });
});

router.delete("/templates/:id", async (req, res): Promise<void> => {
  const params = DeleteTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [template] = await db
    .delete(templatesTable)
    .where(eq(templatesTable.id, params.data.id))
    .returning();

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json({ message: "Template deleted successfully" });
});

router.post("/templates/upload-image", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const fileUrl = `/api/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

export default router;
