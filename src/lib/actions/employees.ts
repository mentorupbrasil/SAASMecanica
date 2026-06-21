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
  type: z.enum(["MECHANIC", "ADVISOR", "MANAGER", "ADMIN", "OTHER"]),
  specialty: z.string().optional(),
  commissionRate: z.coerce.number().min(0).default(0),
  hourlyRate: z.coerce.number().min(0).default(0),
});

export async function listEmployees() {
  const tenantId = await requireTenantId();
  return prisma.employee.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function createEmployee(formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    type: formData.get("type") || "MECHANIC",
    specialty: formData.get("specialty") || undefined,
    commissionRate: formData.get("commissionRate") || 0,
    hourlyRate: formData.get("hourlyRate") || 0,
  });
  await prisma.employee.create({ data: { tenantId, ...data } });
  revalidatePath("/funcionarios");
}

export async function updateEmployee(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    type: formData.get("type") || "MECHANIC",
    specialty: formData.get("specialty") || undefined,
    commissionRate: formData.get("commissionRate") || 0,
    hourlyRate: formData.get("hourlyRate") || 0,
  });
  await prisma.employee.updateMany({ where: { id, tenantId }, data });
  revalidatePath("/funcionarios");
}

export async function deleteEmployee(id: string) {
  const tenantId = await requireTenantId();
  await prisma.employee.updateMany({ where: { id, tenantId }, data: { active: false } });
  revalidatePath("/funcionarios");
}

export async function listMechanicsOptions() {
  const tenantId = await requireTenantId();
  return prisma.employee.findMany({
    where: { tenantId, active: true, type: { in: ["MECHANIC", "OTHER"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
