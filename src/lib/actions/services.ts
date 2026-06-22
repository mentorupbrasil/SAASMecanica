"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).default(0),
  durationMin: z.coerce.number().int().min(0).default(60),
  warrantyDays: z.coerce.number().int().min(0).default(0),
});

export async function listServices(category?: string) {
  const tenantId = await requireTenantId();
  return prisma.serviceCatalog.findMany({
    where: {
      tenantId,
      active: true,
      ...(category && category !== "ALL" ? { category } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function createService(formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    cost: formData.get("cost") || 0,
    durationMin: formData.get("durationMin") || 60,
    warrantyDays: formData.get("warrantyDays") || 0,
  });
  await prisma.serviceCatalog.create({ data: { tenantId, ...data } });
  revalidatePath("/servicos");
}

export async function updateService(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    cost: formData.get("cost") || 0,
    durationMin: formData.get("durationMin") || 60,
    warrantyDays: formData.get("warrantyDays") || 0,
  });
  await prisma.serviceCatalog.updateMany({ where: { id, tenantId }, data });
  revalidatePath("/servicos");
}

export async function deleteService(id: string) {
  const tenantId = await requireTenantId();
  await prisma.serviceCatalog.updateMany({ where: { id, tenantId }, data: { active: false } });
  revalidatePath("/servicos");
}

export async function listServicesOptions() {
  const tenantId = await requireTenantId();
  return prisma.serviceCatalog.findMany({
    where: { tenantId, active: true },
    select: { id: true, name: true, price: true, cost: true },
    orderBy: { name: "asc" },
  });
}
