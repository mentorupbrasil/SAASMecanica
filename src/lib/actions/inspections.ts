"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

const DEFAULT_CHECKLIST = [
  "Freios e pastilhas",
  "Pneus e calibragem",
  "Suspensão e amortecedores",
  "Nível de fluidos",
  "Bateria",
  "Iluminação e sinalização",
  "Correias e mangueiras",
  "Sistema de arrefecimento",
  "Escapamento",
  "Direção e alinhamento",
];

export async function listInspections() {
  const tenantId = await requireTenantId();
  return prisma.vehicleInspection.findMany({
    where: { tenantId },
    include: {
      vehicle: {
        select: { plate: true, brand: true, model: true, customer: { select: { name: true } } },
      },
      results: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createInspection(formData: FormData) {
  const tenantId = await requireTenantId();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const mileage = Number(formData.get("mileage") ?? 0) || null;
  const notes = String(formData.get("notes") ?? "") || null;

  if (!vehicleId) throw new Error("Selecione um veículo");

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, tenantId },
  });
  if (!vehicle) throw new Error("Veículo não encontrado");

  const inspection = await prisma.vehicleInspection.create({
    data: {
      tenantId,
      vehicleId,
      templateName: "Checklist padrão SAASMecanica",
      mileage,
      notes,
      results: {
        create: DEFAULT_CHECKLIST.map((label) => ({
          itemLabel: label,
          result: "OK",
        })),
      },
    },
  });

  revalidatePath("/inspecoes");
  return inspection.id;
}

export async function updateInspectionItem(
  itemId: string,
  result: "OK" | "ATTENTION" | "CRITICAL" | "NA",
  notes?: string,
) {
  const tenantId = await requireTenantId();

  const item = await prisma.inspectionResultItem.findFirst({
    where: { id: itemId },
    include: { inspection: true },
  });

  if (!item || item.inspection.tenantId !== tenantId) {
    throw new Error("Item não encontrado");
  }

  await prisma.inspectionResultItem.update({
    where: { id: itemId },
    data: { result, notes: notes ?? null },
  });

  revalidatePath("/inspecoes");
}

export async function completeInspection(inspectionId: string) {
  const tenantId = await requireTenantId();

  await prisma.vehicleInspection.updateMany({
    where: { id: inspectionId, tenantId },
    data: { completedAt: new Date() },
  });

  revalidatePath("/inspecoes");
}

export async function getInspection(id: string) {
  const tenantId = await requireTenantId();
  return prisma.vehicleInspection.findFirst({
    where: { id, tenantId },
    include: {
      vehicle: {
        select: { plate: true, brand: true, model: true, customer: { select: { name: true } } },
      },
      results: { orderBy: { itemLabel: "asc" } },
    },
  });
}
