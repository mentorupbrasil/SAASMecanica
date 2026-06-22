"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export type SearchResult = {
  type: "work_order" | "customer" | "vehicle" | "quote";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const tenantId = await requireTenantId();
  const plate = q.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const [orders, customers, vehicles, quotes] = await Promise.all([
    prisma.workOrder.findMany({
      where: {
        tenantId,
        OR: [
          { customer: { name: { contains: q, mode: "insensitive" } } },
          { vehicle: { plate: { contains: plate, mode: "insensitive" } } },
          ...(Number.isFinite(Number(q)) ? [{ number: Number(q) }] : []),
        ],
      },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { plate: true } },
      },
      take: 5,
      orderBy: { openedAt: "desc" },
    }),
    prisma.customer.findMany({
      where: {
        tenantId,
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.vehicle.findMany({
      where: {
        tenantId,
        OR: [
          { plate: { contains: plate, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { model: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { customer: { select: { name: true } } },
      take: 5,
    }),
    prisma.quote.findMany({
      where: {
        tenantId,
        OR: [
          { customer: { name: { contains: q, mode: "insensitive" } } },
          { vehicle: { plate: { contains: plate, mode: "insensitive" } } },
        ],
      },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { plate: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const results: SearchResult[] = [];

  for (const o of orders) {
    results.push({
      type: "work_order",
      id: o.id,
      title: `OS #${o.number}`,
      subtitle: `${o.vehicle.plate} · ${o.customer.name}`,
      href: `/ordens/${o.id}`,
    });
  }
  for (const c of customers) {
    results.push({
      type: "customer",
      id: c.id,
      title: c.name,
      subtitle: c.phone ?? c.email ?? "Cliente",
      href: `/clientes`,
    });
  }
  for (const v of vehicles) {
    results.push({
      type: "vehicle",
      id: v.id,
      title: v.plate,
      subtitle: `${v.brand ?? ""} ${v.model ?? ""} · ${v.customer.name}`.trim(),
      href: `/veiculos`,
    });
  }
  for (const qte of quotes) {
    results.push({
      type: "quote",
      id: qte.id,
      title: `Orçamento #${qte.number}`,
      subtitle: `${qte.vehicle.plate} · ${qte.customer.name}`,
      href: `/orcamentos/${qte.id}`,
    });
  }

  return results.slice(0, 12);
}
