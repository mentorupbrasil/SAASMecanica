"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export async function listWarranties() {
  const tenantId = await requireTenantId();
  return prisma.warranty.findMany({
    where: { tenantId },
    include: {
      workOrder: {
        select: { number: true, vehicle: { select: { plate: true } }, customer: { select: { name: true } } },
      },
      _count: { select: { claims: true } },
    },
    orderBy: { endDate: "asc" },
  });
}

export async function createWarranty(formData: FormData) {
  const tenantId = await requireTenantId();
  const workOrderId = String(formData.get("workOrderId"));
  const type = String(formData.get("type")) as "PART" | "SERVICE";
  const description = String(formData.get("description"));
  const days = Number(formData.get("days") || 90);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  await prisma.warranty.create({
    data: { tenantId, workOrderId, type, description, endDate },
  });
  revalidatePath("/garantias");
}

export async function createWarrantyClaim(warrantyId: string, description: string) {
  await prisma.warrantyClaim.create({ data: { warrantyId, description } });
  revalidatePath("/garantias");
}

export async function listWorkOrdersForWarranty() {
  const tenantId = await requireTenantId();
  return prisma.workOrder.findMany({
    where: { tenantId, status: { in: ["FINISHED", "DELIVERED"] } },
    select: {
      id: true,
      number: true,
      vehicle: { select: { plate: true } },
      customer: { select: { name: true } },
    },
    orderBy: { finishedAt: "desc" },
    take: 50,
  });
}
