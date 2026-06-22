"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export async function getNotificationCounts() {
  const tenantId = await requireTenantId();

  const [pending, failed] = await Promise.all([
    prisma.notification.count({ where: { tenantId, status: "PENDING" } }),
    prisma.notification.count({ where: { tenantId, status: "FAILED" } }),
  ]);

  return { pending, failed, total: pending + failed };
}

export async function listNotifications(limit = 50) {
  const tenantId = await requireTenantId();
  return prisma.notification.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
