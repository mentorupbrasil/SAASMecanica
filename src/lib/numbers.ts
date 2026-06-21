import { prisma } from "@/lib/prisma";

export async function nextQuoteNumber(tenantId: string) {
  const last = await prisma.quote.findFirst({
    where: { tenantId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return (last?.number ?? 0) + 1;
}

export async function nextWorkOrderNumber(tenantId: string) {
  const last = await prisma.workOrder.findFirst({
    where: { tenantId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return (last?.number ?? 0) + 1;
}
