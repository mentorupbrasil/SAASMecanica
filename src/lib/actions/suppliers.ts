"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2),
  document: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  contact: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

function parseSupplier(formData: FormData) {
  return schema.parse({
    name: formData.get("name"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    contact: formData.get("contact") || undefined,
    category: formData.get("category") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
  });
}

export async function listSuppliers(category?: string) {
  const tenantId = await requireTenantId();
  return prisma.supplier.findMany({
    where: {
      tenantId,
      active: true,
      ...(category && category !== "ALL" ? { category } : {}),
    },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(formData: FormData) {
  const tenantId = await requireTenantId();
  const data = parseSupplier(formData);
  await prisma.supplier.create({ data: { tenantId, ...data } });
  revalidatePath("/fornecedores");
}

export async function updateSupplier(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const data = parseSupplier(formData);
  await prisma.supplier.updateMany({ where: { id, tenantId }, data });
  revalidatePath("/fornecedores");
}

export async function deleteSupplier(id: string) {
  const tenantId = await requireTenantId();
  await prisma.supplier.updateMany({ where: { id, tenantId }, data: { active: false } });
  revalidatePath("/fornecedores");
}

export async function listSuppliersOptions() {
  const tenantId = await requireTenantId();
  return prisma.supplier.findMany({
    where: { tenantId, active: true },
    select: { id: true, name: true, category: true },
    orderBy: { name: "asc" },
  });
}
