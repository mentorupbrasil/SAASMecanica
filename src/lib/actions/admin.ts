"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireTenantId } from "@/lib/session";

const roleSchema = z.enum([
  "OWNER",
  "MANAGER",
  "ADVISOR",
  "MECHANIC",
  "STOCK",
  "FINANCE",
  "RECEPTION",
]);

const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema,
  phone: z.string().optional(),
});

export async function getAdminOverview() {
  await requireAdmin();
  const tenantId = await requireTenantId();

  const [tenant, usersCount, activeUsers, recentLogs] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        branches: { where: { isMain: true }, take: 1 },
        _count: { select: { users: true, customers: true, workOrders: true } },
      },
    }),
    prisma.user.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, active: true } }),
    prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
  ]);

  return { tenant, usersCount, activeUsers, recentLogs };
}

export async function listTenantUsers() {
  await requireAdmin();
  const tenantId = await requireTenantId();
  return prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTenantUser(formData: FormData) {
  await requireAdmin();
  const tenantId = await requireTenantId();

  const parsed = createUserSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "RECEPTION"),
    phone: String(formData.get("phone") ?? "") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { name, email, password, role, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new Error("Este e-mail já está em uso no sistema.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      tenantId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone: phone ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      action: "USER_CREATED",
      entity: "User",
      metadata: { email: email.toLowerCase(), role },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function updateTenantUser(userId: string, formData: FormData) {
  await requireAdmin();
  const tenantId = await requireTenantId();

  const name = String(formData.get("name") ?? "");
  const role = roleSchema.parse(String(formData.get("role") ?? "RECEPTION"));
  const phone = String(formData.get("phone") ?? "") || null;
  const active = formData.get("active") === "on" || formData.get("active") === "true";
  const password = String(formData.get("password") ?? "");

  const data: {
    name: string;
    role: z.infer<typeof roleSchema>;
    phone: string | null;
    active: boolean;
    passwordHash?: string;
  } = { name, role, phone, active };

  if (password.length >= 6) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.updateMany({
    where: { id: userId, tenantId },
    data,
  });

  revalidatePath("/admin/usuarios");
}

export async function toggleUserActive(userId: string, active: boolean) {
  await requireAdmin();
  const tenantId = await requireTenantId();

  await prisma.user.updateMany({
    where: { id: userId, tenantId },
    data: { active },
  });

  revalidatePath("/admin/usuarios");
}

export async function updateTenantSettings(formData: FormData) {
  await requireAdmin();
  const tenantId = await requireTenantId();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const document = String(formData.get("document") ?? "").trim() || null;
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
  const brandColor = String(formData.get("brandColor") ?? "").trim() || "#ea580c";
  const address = String(formData.get("address") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "").trim() || null;
  const zipCode = String(formData.get("zipCode") ?? "").trim() || null;

  if (name.length < 3) throw new Error("Nome da oficina inválido");

  await prisma.$transaction(async (tx) => {
    await tx.tenant.update({
      where: { id: tenantId },
      data: { name, phone, email, document, logoUrl, brandColor },
    });

    const mainBranch = await tx.branch.findFirst({
      where: { tenantId, isMain: true },
    });

    if (mainBranch) {
      await tx.branch.update({
        where: { id: mainBranch.id },
        data: { address, city, state, zipCode },
      });
    } else {
      await tx.branch.create({
        data: {
          tenantId,
          name: "Matriz",
          isMain: true,
          address,
          city,
          state,
          zipCode,
        },
      });
    }
  });

  revalidatePath("/admin");
}
