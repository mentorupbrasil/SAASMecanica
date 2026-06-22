"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

const reminderSchema = z.object({
  vehicleId: z.string().min(1),
  title: z.string().min(3),
  type: z.enum(["KM", "TIME", "SERVICE"]),
  dueDate: z.string().optional(),
  dueMileage: z.coerce.number().optional(),
});

export async function listCrmReminders() {
  const tenantId = await requireTenantId();
  return prisma.maintenanceReminder.findMany({
    where: { tenantId, completed: false },
    include: {
      vehicle: {
        select: {
          id: true,
          plate: true,
          brand: true,
          model: true,
          customer: { select: { name: true, phone: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function createMaintenanceReminder(formData: FormData) {
  const tenantId = await requireTenantId();

  const parsed = reminderSchema.safeParse({
    vehicleId: String(formData.get("vehicleId") ?? ""),
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? "TIME"),
    dueDate: String(formData.get("dueDate") ?? "") || undefined,
    dueMileage: formData.get("dueMileage") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const { vehicleId, title, type, dueDate, dueMileage } = parsed.data;

  await prisma.maintenanceReminder.create({
    data: {
      tenantId,
      vehicleId,
      title,
      type,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueMileage: dueMileage ?? null,
    },
  });

  revalidatePath("/crm");
}

export async function markReminderSent(id: string) {
  const tenantId = await requireTenantId();

  await prisma.maintenanceReminder.updateMany({
    where: { id, tenantId },
    data: { sentAt: new Date() },
  });

  revalidatePath("/crm");
}

export async function completeReminder(id: string) {
  const tenantId = await requireTenantId();

  await prisma.maintenanceReminder.updateMany({
    where: { id, tenantId },
    data: { completed: true },
  });

  revalidatePath("/crm");
}

export async function logWhatsAppNotification(recipient: string, body: string) {
  const tenantId = await requireTenantId();

  await prisma.notification.create({
    data: {
      tenantId,
      channel: "WHATSAPP",
      recipient,
      body,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  revalidatePath("/notificacoes");
  revalidatePath("/crm");
}
