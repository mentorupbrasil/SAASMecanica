"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

import { TECHNICAL_EMPLOYEE_TYPES } from "@/lib/workshop-labels";

const schema = z.object({
  name: z.string().min(2),
  document: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  type: z.enum([
    "MECHANIC",
    "ELECTRICIAN",
    "ELECTROMECHANIC",
    "ADVISOR",
    "MANAGER",
    "ADMIN",
    "OTHER",
  ]),
  specialty: z.string().optional(),
  commissionRate: z.coerce.number().min(0).default(0),
  hourlyRate: z.coerce.number().min(0).default(0),
  hireDate: z.string().optional(),
  birthDate: z.string().optional(),
});

function parseEmployee(formData: FormData) {
  const hireRaw = String(formData.get("hireDate") ?? "");
  const birthRaw = String(formData.get("birthDate") ?? "");
  return schema.parse({
    name: formData.get("name"),
    document: formData.get("document") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    type: formData.get("type") || "MECHANIC",
    specialty: formData.get("specialty") || undefined,
    commissionRate: formData.get("commissionRate") || 0,
    hourlyRate: formData.get("hourlyRate") || 0,
    hireDate: hireRaw || undefined,
    birthDate: birthRaw || undefined,
  });
}

export async function listEmployees() {
  const tenantId = await requireTenantId();
  return prisma.employee.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function createEmployee(formData: FormData) {
  const tenantId = await requireTenantId();
  const parsed = parseEmployee(formData);
  const { hireDate, birthDate, ...data } = parsed;

  await prisma.employee.create({
    data: {
      tenantId,
      ...data,
      hireDate: hireDate ? new Date(hireDate) : null,
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });
  revalidatePath("/funcionarios");
}

export async function updateEmployee(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const parsed = parseEmployee(formData);
  const { hireDate, birthDate, ...data } = parsed;

  await prisma.employee.updateMany({
    where: { id, tenantId },
    data: {
      ...data,
      hireDate: hireDate ? new Date(hireDate) : null,
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });
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
    where: { tenantId, active: true, type: { in: [...TECHNICAL_EMPLOYEE_TYPES] } },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });
}
