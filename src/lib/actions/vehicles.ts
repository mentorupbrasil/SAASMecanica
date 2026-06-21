"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";
import { formatPlate } from "@/lib/utils";

const schema = z.object({
  customerId: z.string().min(1),
  plate: z.string().min(7),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().optional(),
  color: z.string().optional(),
  chassis: z.string().optional(),
  mileage: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
});

function parseVehicle(formData: FormData) {
  const parsed = schema.parse({
    customerId: formData.get("customerId"),
    plate: formatPlate(String(formData.get("plate") ?? "")),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year") || undefined,
    color: formData.get("color") || undefined,
    chassis: formData.get("chassis") || undefined,
    mileage: formData.get("mileage") || 0,
    notes: formData.get("notes") || undefined,
  });
  return parsed;
}

export async function listVehicles(search?: string) {
  const tenantId = await requireTenantId();
  return prisma.vehicle.findMany({
    where: {
      tenantId,
      active: true,
      ...(search
        ? {
            OR: [
              { plate: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { customer: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getVehicle(id: string) {
  const tenantId = await requireTenantId();
  return prisma.vehicle.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      workOrders: {
        orderBy: { openedAt: "desc" },
        take: 20,
        include: { items: true },
      },
    },
  });
}

export async function getVehicleByPlate(plate: string) {
  const tenantId = await requireTenantId();
  return prisma.vehicle.findUnique({
    where: {
      tenantId_plate: { tenantId, plate: formatPlate(plate) },
    },
    include: {
      customer: true,
      workOrders: {
        orderBy: { openedAt: "desc" },
        include: { items: true, warranties: true },
      },
    },
  });
}

export async function createVehicle(formData: FormData) {
  const tenantId = await requireTenantId();
  const data = parseVehicle(formData);
  await prisma.vehicle.create({ data: { tenantId, ...data } });
  revalidatePath("/veiculos");
  revalidatePath("/historico");
}

export async function updateVehicle(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const data = parseVehicle(formData);
  await prisma.vehicle.updateMany({
    where: { id, tenantId },
    data,
  });
  revalidatePath("/veiculos");
  revalidatePath("/historico");
}

export async function deleteVehicle(id: string) {
  const tenantId = await requireTenantId();
  await prisma.vehicle.updateMany({
    where: { id, tenantId },
    data: { active: false },
  });
  revalidatePath("/veiculos");
}

export async function listVehiclesOptions() {
  const tenantId = await requireTenantId();
  return prisma.vehicle.findMany({
    where: { tenantId, active: true },
    select: {
      id: true,
      plate: true,
      brand: true,
      model: true,
      customerId: true,
      mileage: true,
      customer: { select: { name: true } },
    },
    orderBy: { plate: "asc" },
  });
}
