"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export async function getFinanceSummary() {
  const tenantId = await requireTenantId();

  const [payables, receivables, cashFlow, overdueReceivables] = await Promise.all([
    prisma.accountPayable.findMany({
      where: { tenantId },
      include: { supplier: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.accountReceivable.findMany({
      where: { tenantId },
      include: {
        customer: { select: { name: true } },
        workOrder: { select: { number: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.cashFlowEntry.findMany({
      where: { tenantId },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.accountReceivable.count({
      where: { tenantId, status: "OVERDUE" },
    }),
  ]);

  const totalReceivable = receivables
    .filter((r) => r.status === "PENDING" || r.status === "OVERDUE")
    .reduce((s, r) => s + Number(r.amount) - Number(r.paidAmount), 0);

  const totalPayable = payables
    .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
    .reduce((s, p) => s + Number(p.amount) - Number(p.paidAmount), 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthIncome = cashFlow
    .filter((c) => c.type === "INCOME" && c.date >= monthStart)
    .reduce((s, c) => s + Number(c.amount), 0);

  const monthExpense = cashFlow
    .filter((c) => c.type === "EXPENSE" && c.date >= monthStart)
    .reduce((s, c) => s + Number(c.amount), 0);

  return {
    payables,
    receivables,
    cashFlow,
    overdueReceivables,
    totalReceivable,
    totalPayable,
    monthIncome,
    monthExpense,
    balance: monthIncome - monthExpense,
  };
}

export async function createPayable(formData: FormData) {
  const tenantId = await requireTenantId();
  await prisma.accountPayable.create({
    data: {
      tenantId,
      supplierId: String(formData.get("supplierId") || "") || null,
      description: String(formData.get("description")),
      amount: Number(formData.get("amount")),
      dueDate: new Date(String(formData.get("dueDate"))),
      category: String(formData.get("category") || "") || null,
    },
  });
  revalidatePath("/financeiro");
}

export async function markReceivablePaid(id: string) {
  const tenantId = await requireTenantId();
  const item = await prisma.accountReceivable.findFirst({ where: { id, tenantId } });
  if (!item) return;

  await prisma.$transaction(async (tx) => {
    await tx.accountReceivable.update({
      where: { id },
      data: { status: "PAID", paidAmount: item.amount, paidAt: new Date() },
    });
    await tx.cashFlowEntry.create({
      data: {
        tenantId,
        type: "INCOME",
        category: "Recebimentos",
        description: item.description,
        amount: item.amount,
        method: "PIX",
      },
    });
  });
  revalidatePath("/financeiro");
}

export async function markPayablePaid(id: string) {
  const tenantId = await requireTenantId();
  const item = await prisma.accountPayable.findFirst({ where: { id, tenantId } });
  if (!item) return;

  await prisma.$transaction(async (tx) => {
    await tx.accountPayable.update({
      where: { id },
      data: { status: "PAID", paidAmount: item.amount, paidAt: new Date() },
    });
    await tx.cashFlowEntry.create({
      data: {
        tenantId,
        type: "EXPENSE",
        category: item.category || "Despesas",
        description: item.description,
        amount: item.amount,
      },
    });
  });
  revalidatePath("/financeiro");
}

export async function createExpense(formData: FormData) {
  const tenantId = await requireTenantId();
  const amount = Number(formData.get("amount"));
  await prisma.cashFlowEntry.create({
    data: {
      tenantId,
      type: "EXPENSE",
      category: String(formData.get("category") || "Despesas"),
      description: String(formData.get("description")),
      amount,
    },
  });
  revalidatePath("/financeiro");
}
