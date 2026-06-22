"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";
import { TECHNICAL_EMPLOYEE_TYPES } from "@/lib/workshop-labels";

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
    where: { tenantId, active: true, type: { in: [...TECHNICAL_EMPLOYEE_TYPES] } },
    select: { id: true, name: true },
  });

  const productivity = mechanics.map((m) => ({
    name: m.name,
    os: mechanicStats.find((s) => s.assignedMechanicId === m.id)?._count.id ?? 0,
    hours: (mechanicStats.find((s) => s.assignedMechanicId === m.id)?._count.id ?? 0) * 3,
  }));

  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [activeOrders, todayAppointments, weekExpenses] = await Promise.all([
    prisma.workOrder.findMany({
      where: {
        tenantId,
        status: { notIn: ["DELIVERED", "CANCELLED", "DRAFT"] },
      },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { plate: true, brand: true, model: true } },
        assignedMechanic: { select: { name: true } },
      },
      orderBy: { openedAt: "desc" },
      take: 8,
    }),
    prisma.appointment.findMany({
      where: {
        tenantId,
        scheduledAt: { gte: todayStart, lt: tomorrow },
        status: { notIn: ["CANCELLED", "NO_SHOW", "COMPLETED"] },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        vehicle: { select: { plate: true } },
        employee: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    }),
    prisma.cashFlowEntry.findMany({
      where: {
        tenantId,
        type: "EXPENSE",
        date: { gte: new Date(Date.now() - 7 * 86400000) },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const expenseByDay: Record<string, number> = {};
  for (const entry of weekExpenses) {
    const day = entry.date.toLocaleDateString("pt-BR", { weekday: "short" });
    expenseByDay[day] = (expenseByDay[day] ?? 0) + Number(entry.amount);
  }

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
    expenseByDay: Object.entries(expenseByDay).map(([day, value]) => ({ day, value })),
    productivity,
    activeOrders: activeOrders.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      total: Number(o.total),
      customer: o.customer.name,
      plate: o.vehicle.plate,
      vehicle: `${o.vehicle.brand ?? ""} ${o.vehicle.model ?? ""}`.trim(),
      mechanic: o.assignedMechanic?.name ?? null,
      openedAt: o.openedAt.toISOString(),
    })),
    todayAppointments: todayAppointments.map((a) => ({
      id: a.id,
      title: a.title,
      scheduledAt: a.scheduledAt.toISOString(),
      status: a.status,
      customer: a.customer.name,
      phone: a.customer.phone,
      plate: a.vehicle.plate,
      mechanic: a.employee?.name ?? null,
    })),
  };
}

export async function getReports() {
  const tenantId = await requireTenantId();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const [orders, revenue, products, customers, services, prevRevenue, statusBreakdown] =
    await Promise.all([
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
    prisma.cashFlowEntry.aggregate({
      where: {
        tenantId,
        type: "INCOME",
        date: { gte: prevMonthStart, lt: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.workOrder.groupBy({
      by: ["status"],
      where: { tenantId, openedAt: { gte: monthStart } },
      _count: { id: true },
    }),
  ]);

  const expenses = await prisma.cashFlowEntry.aggregate({
    where: { tenantId, type: "EXPENSE", date: { gte: monthStart } },
    _sum: { amount: true },
  });

  const partsRevenue = await prisma.workOrderItem.aggregate({
    where: {
      type: "PART",
      workOrder: { tenantId, openedAt: { gte: monthStart } },
    },
    _sum: { total: true },
  });

  const income = Number(revenue._sum.amount ?? 0);
  const expense = Number(expenses._sum.amount ?? 0);
  const prevIncome = Number(prevRevenue._sum.amount ?? 0);
  const servicesTotal = Number(services._sum.total ?? 0);
  const partsTotal = Number(partsRevenue._sum.total ?? 0);

  const monthlyTrend = await prisma.cashFlowEntry.findMany({
    where: {
      tenantId,
      date: { gte: new Date(Date.now() - 180 * 86400000) },
    },
    orderBy: { date: "asc" },
  });

  const byMonth: Record<string, { income: number; expense: number }> = {};
  for (const entry of monthlyTrend) {
    const key = entry.date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
    if (entry.type === "INCOME") byMonth[key].income += Number(entry.amount);
    else byMonth[key].expense += Number(entry.amount);
  }

  return {
    orders,
    income,
    expense,
    profit: income - expense,
    products,
    customers,
    servicesCount: services._count.id,
    servicesRevenue: servicesTotal,
    partsRevenue: partsTotal,
    prevIncome,
    incomeGrowth: prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0,
    margin: income > 0 ? ((income - expense) / income) * 100 : 0,
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    monthlyTrend: Object.entries(byMonth).map(([month, v]) => ({
      month,
      income: v.income,
      expense: v.expense,
      profit: v.income - v.expense,
    })),
  };
}
