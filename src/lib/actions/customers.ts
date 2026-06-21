"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

const schema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  name: z.string().min(2),
  document: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
});

function parseCustomer(formData: FormData) {
  return schema.parse({
    type: formData.get("type") || "INDIVIDUAL",
    name: formData.get("name"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    street: formData.get("street") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    zipCode: formData.get("zipCode") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function listCustomers(search?: string) {
  const tenantId = await requireTenantId();
  return prisma.customer.findMany({
    where: {
      tenantId,
      active: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { document: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { vehicles: true, workOrders: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getCustomer(id: string) {
  const tenantId = await requireTenantId();
  return prisma.customer.findFirst({
    where: { id, tenantId },
    include: { vehicles: { where: { active: true } } },
  });
}

export async function createCustomer(formData: FormData) {
  const tenantId = await requireTenantId();
  const data = parseCustomer(formData);
  await prisma.customer.create({
    data: {
      tenantId,
      ...data,
      email: data.email || null,
    },
  });
  revalidatePath("/clientes");
}

export async function updateCustomer(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const data = parseCustomer(formData);
  await prisma.customer.updateMany({
    where: { id, tenantId },
    data: { ...data, email: data.email || null },
  });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function deleteCustomer(id: string) {
  const tenantId = await requireTenantId();
  await prisma.customer.updateMany({
    where: { id, tenantId },
    data: { active: false },
  });
  revalidatePath("/clientes");
}

export async function listCustomersOptions() {
  const tenantId = await requireTenantId();
  return prisma.customer.findMany({
    where: { tenantId, active: true },
    select: { id: true, name: true, document: true },
    orderBy: { name: "asc" },
  });
}
