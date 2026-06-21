"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export async function listAppointments() {
  const tenantId = await requireTenantId();
  return prisma.appointment.findMany({
    where: { tenantId },
    include: {
      customer: { select: { name: true, phone: true } },
      vehicle: { select: { plate: true } },
      employee: { select: { name: true } },
      serviceBay: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function listServiceBays() {
  const tenantId = await requireTenantId();
  return prisma.serviceBay.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function createAppointment(formData: FormData) {
  const tenantId = await requireTenantId();
  await prisma.appointment.create({
    data: {
      tenantId,
      customerId: String(formData.get("customerId")),
      vehicleId: String(formData.get("vehicleId")),
      employeeId: String(formData.get("employeeId") || "") || null,
      serviceBayId: String(formData.get("serviceBayId") || "") || null,
      title: String(formData.get("title")),
      description: String(formData.get("description") || "") || null,
      scheduledAt: new Date(String(formData.get("scheduledAt"))),
      durationMin: Number(formData.get("durationMin") || 60),
      status: "SCHEDULED",
    },
  });
  revalidatePath("/agenda");
}

export async function updateAppointmentStatus(id: string, status: string) {
  const tenantId = await requireTenantId();
  await prisma.appointment.updateMany({
    where: { id, tenantId },
    data: {
      status: status as never,
      confirmedAt: status === "CONFIRMED" ? new Date() : undefined,
    },
  });
  revalidatePath("/agenda");
}

export async function deleteAppointment(id: string) {
  const tenantId = await requireTenantId();
  await prisma.appointment.deleteMany({ where: { id, tenantId } });
  revalidatePath("/agenda");
}
