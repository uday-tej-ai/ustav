import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import {
  RegisterCustomerBody,
  RegisterAdminBody,
  LoginBody,
  ForgotPasswordBody,
  GetMeResponse,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "ustav_salt_2024").digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

router.post("/auth/register/customer", async (req, res): Promise<void> => {
  const parsed = RegisterCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, mobile, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "An account with this email already exists" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    mobile,
    passwordHash: hashPassword(password),
    role: "customer",
  }).returning();

  (req.session as any).userId = user.id;

  const userResponse = GetMeResponse.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });

  res.status(201).json({ user: userResponse });
});

router.post("/auth/register/admin", async (req, res): Promise<void> => {
  const parsed = RegisterAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, mobile, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "An account with this email already exists" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    mobile,
    passwordHash: hashPassword(password),
    role: "admin",
  }).returning();

  (req.session as any).userId = user.id;

  const userResponse = GetMeResponse.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });

  res.status(201).json({ user: userResponse });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, role } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user) {
    res.status(401).json({ error: "No account found with this email address" });
    return;
  }

  if (user.role !== role) {
    res.status(401).json({ error: `This email is registered as a ${user.role}. Please use the ${user.role} login.` });
    return;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Incorrect password. Please try again." });
    return;
  }

  (req.session as any).userId = user.id;

  const userResponse = GetMeResponse.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });

  res.json({ user: userResponse });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  res.json({ message: "If an account with that email exists, a password reset link has been sent." });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const userResponse = GetMeResponse.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });

  res.json(userResponse);
});

export default router;
