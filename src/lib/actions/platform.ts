"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/slug";

const createTenantSchema = z.object({
  workshopName: z.string().min(3),
  ownerName: z.string().min(3),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
  plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).default("PROFESSIONAL"),
  phone: z.string().optional(),
  document: z.string().optional(),
});

export async function listAllTenants() {
  await requireSuperAdmin();

  return prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, customers: true, workOrders: true } },
      users: {
        where: { role: "OWNER" },
        take: 1,
        select: { name: true, email: true, lastLoginAt: true },
      },
    },
  });
}

export async function createTenantForClient(formData: FormData) {
  await requireSuperAdmin();

  const parsed = createTenantSchema.safeParse({
    workshopName: String(formData.get("workshopName") ?? "").trim(),
    ownerName: String(formData.get("ownerName") ?? "").trim(),
    ownerEmail: String(formData.get("ownerEmail") ?? "").trim().toLowerCase(),
    ownerPassword: String(formData.get("ownerPassword") ?? ""),
    plan: String(formData.get("plan") ?? "PROFESSIONAL"),
    phone: String(formData.get("phone") ?? "") || undefined,
    document: String(formData.get("document") ?? "") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { workshopName, ownerName, ownerEmail, ownerPassword, plan, phone, document } =
    parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: { email: ownerEmail },
  });
  if (existingUser) {
    throw new Error("Este e-mail já está em uso. Use outro e-mail para o proprietário.");
  }

  const slug = await uniqueSlug(workshopName, async (s) => {
    const t = await prisma.tenant.findUnique({ where: { slug: s } });
    return !!t;
  });

  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: workshopName,
        slug,
        email: ownerEmail,
        phone: phone ?? null,
        document: document ?? null,
        plan,
      },
    });

    await tx.branch.create({
      data: {
        tenantId: tenant.id,
        name: "Matriz",
        isMain: true,
      },
    });

    await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: ownerName,
        email: ownerEmail,
        passwordHash,
        role: "OWNER",
      },
    });
  });

  revalidatePath("/platform");
}

export async function setTenantActive(tenantId: string, active: boolean) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { active } });
  revalidatePath("/platform");
}
