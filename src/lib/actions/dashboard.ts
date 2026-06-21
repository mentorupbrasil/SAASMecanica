"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export async function getDashboardStats() {
  const tenantId = await requireTenantId();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    openOrders,
    todayFinished,
    monthRevenue,
    monthOrders,
    customers,
    lowStock,
    pendingQuotes,
    overdueReceivables,
    vehiclesToday,
  ] = await Promise.all([
    prisma.workOrder.count({
      where: {
        tenantId,
        status: { notIn: ["DELIVERED", "CANCELLED"] },
      },
    }),
    prisma.workOrder.count({
      where: { tenantId, finishedAt: { gte: todayStart } },
    }),
    prisma.cashFlowEntry.aggregate({
      where: { tenantId, type: "INCOME", date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.workOrder.count({
      where: { tenantId, openedAt: { gte: monthStart } },
    }),
    prisma.customer.count({ where: { tenantId, active: true } }),
    prisma.product.findMany({ where: { tenantId, active: true } }),
    prisma.quote.count({
      where: { tenantId, status: { in: ["PENDING", "SENT"] } },
    }),
    prisma.accountReceivable.count({
      where: { tenantId, status: { in: ["OVERDUE", "PENDING"] } },
    }),
    prisma.workOrder.count({
      where: { tenantId, openedAt: { gte: todayStart } },
    }),
  ]);

  const lowStockCount = lowStock.filter(
    (p) => Number(p.stockQty) <= Number(p.minStock),
  ).length;

  const monthTotal = Number(monthRevenue._sum.amount ?? 0);
  const ticketMedio = monthOrders > 0 ? monthTotal / monthOrders : 0;

  const topServices = await prisma.workOrderItem.groupBy({
    by: ["description"],
    where: {
      type: "SERVICE",
      workOrder: { tenantId, openedAt: { gte: monthStart } },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const weekRevenue = await prisma.cashFlowEntry.findMany({
    where: {
      tenantId,
      type: "INCOME",
      date: { gte: new Date(Date.now() - 7 * 86400000) },
    },
    orderBy: { date: "asc" },
  });

  const revenueByDay: Record<string, number> = {};
  for (const entry of weekRevenue) {
    const day = entry.date.toLocaleDateString("pt-BR", { weekday: "short" });
    revenueByDay[day] = (revenueByDay[day] ?? 0) + Number(entry.amount);
  }

  const mechanicStats = await prisma.workOrder.groupBy({
    by: ["assignedMechanicId"],
    where: {
      tenantId,
      assignedMechanicId: { not: null },
      openedAt: { gte: monthStart },
    },
    _count: { id: true },
  });

  const mechanics = await prisma.employee.findMany({
    where: { tenantId, active: true, type: "MECHANIC" },
    select: { id: true, name: true },
  });

  const productivity = mechanics.map((m) => ({
    name: m.name,
    os: mechanicStats.find((s) => s.assignedMechanicId === m.id)?._count.id ?? 0,
    hours: (mechanicStats.find((s) => s.assignedMechanicId === m.id)?._count.id ?? 0) * 3,
  }));

  return {
    openOrders,
    todayFinished,
    monthRevenue: monthTotal,
    ticketMedio,
    customers,
    lowStockCount,
    pendingQuotes,
    overdueReceivables,
    vehiclesToday,
    topServices: topServices.map((s) => ({
      service: s.description,
      qty: s._count.id,
    })),
    revenueByDay: Object.entries(revenueByDay).map(([day, value]) => ({ day, value })),
    productivity,
  };
}

export async function getReports() {
  const tenantId = await requireTenantId();
  const monthStart = new Date();
  monthStart.setDate(1);

  const [orders, revenue, products, customers, services] = await Promise.all([
    prisma.workOrder.count({ where: { tenantId, openedAt: { gte: monthStart } } }),
    prisma.cashFlowEntry.aggregate({
      where: { tenantId, type: "INCOME", date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.product.count({ where: { tenantId, active: true } }),
    prisma.customer.count({ where: { tenantId, active: true } }),
    prisma.workOrderItem.aggregate({
      where: {
        type: "SERVICE",
        workOrder: { tenantId, openedAt: { gte: monthStart } },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
  ]);

  const expenses = await prisma.cashFlowEntry.aggregate({
    where: { tenantId, type: "EXPENSE", date: { gte: monthStart } },
    _sum: { amount: true },
  });

  const income = Number(revenue._sum.amount ?? 0);
  const expense = Number(expenses._sum.amount ?? 0);

  return {
    orders,
    income,
    expense,
    profit: income - expense,
    products,
    customers,
    servicesCount: services._count.id,
    servicesRevenue: Number(services._sum.total ?? 0),
  };
}
