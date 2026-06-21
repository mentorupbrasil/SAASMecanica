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
  city: z.string().optional(),
  state: z.string().optional(),
});

export async function listSuppliers() {
  const tenantId = await requireTenantId();
  return prisma.supplier.findMany({
    where: { tenantId, active: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    contact: formData.get("contact") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
  });
  await prisma.supplier.create({ data: { tenantId, ...data } });
  revalidatePath("/fornecedores");
}

export async function updateSupplier(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    contact: formData.get("contact") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
  });
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
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
