"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { nextQuoteNumber, nextWorkOrderNumber } from "@/lib/numbers";
import { requireTenantId } from "@/lib/session";

function calcItemTotal(qty: number, price: number, discount = 0) {
  return qty * price - discount;
}

async function recalcQuote(quoteId: string) {
  const items = await prisma.quoteItem.findMany({ where: { quoteId } });
  const subtotal = items.reduce((s, i) => s + Number(i.total), 0);
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  const discount = Number(quote?.discount ?? 0);
  await prisma.quote.update({
    where: { id: quoteId },
    data: { subtotal, total: subtotal - discount },
  });
}

export async function listQuotes(status?: string) {
  const tenantId = await requireTenantId();
  return prisma.quote.findMany({
    where: {
      tenantId,
      ...(status && status !== "ALL" ? { status: status as never } : {}),
    },
    include: {
      customer: { select: { name: true } },
      vehicle: { select: { plate: true, brand: true, model: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuote(id: string) {
  const tenantId = await requireTenantId();
  return prisma.quote.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      vehicle: true,
      items: true,
      workOrder: { select: { id: true, number: true } },
    },
  });
}

export async function createQuote(formData: FormData) {
  const tenantId = await requireTenantId();
  const customerId = String(formData.get("customerId"));
  const vehicleId = String(formData.get("vehicleId"));
  const notes = String(formData.get("notes") || "") || null;
  const validDays = Number(formData.get("validDays") || 7);

  const number = await nextQuoteNumber(tenantId);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validDays);

  const quote = await prisma.quote.create({
    data: {
      tenantId,
      customerId,
      vehicleId,
      number,
      notes,
      validUntil,
      status: "DRAFT",
    },
  });

  revalidatePath("/orcamentos");
  return quote.id;
}

export async function addQuoteItem(formData: FormData) {
  const tenantId = await requireTenantId();
  const quoteId = String(formData.get("quoteId"));
  const type = String(formData.get("type")) as "SERVICE" | "PART";
  const refId = String(formData.get("refId"));
  const quantity = Number(formData.get("quantity") || 1);

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, tenantId } });
  if (!quote) throw new Error("Orçamento não encontrado");

  let description = "";
  let unitPrice = 0;

  if (type === "SERVICE") {
    const s = await prisma.serviceCatalog.findFirst({ where: { id: refId, tenantId } });
    if (!s) throw new Error("Serviço não encontrado");
    description = s.name;
    unitPrice = Number(s.price);
  } else {
    const p = await prisma.product.findFirst({ where: { id: refId, tenantId } });
    if (!p) throw new Error("Peça não encontrada");
    description = p.name;
    unitPrice = Number(p.salePrice);
  }

  const total = calcItemTotal(quantity, unitPrice);

  await prisma.quoteItem.create({
    data: {
      quoteId,
      type,
      description,
      quantity,
      unitPrice,
      total,
      serviceId: type === "SERVICE" ? refId : null,
      productId: type === "PART" ? refId : null,
    },
  });

  await recalcQuote(quoteId);
  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${quoteId}`);
}

export async function removeQuoteItem(itemId: string, quoteId: string) {
  const tenantId = await requireTenantId();
  const quote = await prisma.quote.findFirst({ where: { id: quoteId, tenantId } });
  if (!quote) return;
  await prisma.quoteItem.delete({ where: { id: itemId } });
  await recalcQuote(quoteId);
  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${quoteId}`);
}

export async function sendQuote(quoteId: string) {
  const tenantId = await requireTenantId();
  const token = randomBytes(24).toString("hex");
  await prisma.quote.updateMany({
    where: { id: quoteId, tenantId },
    data: { status: "PENDING", approvalToken: token },
  });
  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${quoteId}`);
  return token;
}

export async function approveQuote(quoteId: string, approvedByName?: string) {
  const tenantId = await requireTenantId();
  await prisma.quote.updateMany({
    where: { id: quoteId, tenantId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedByName: approvedByName || "Cliente",
    },
  });
  revalidatePath("/orcamentos");
}

export async function rejectQuote(quoteId: string, reason?: string) {
  const tenantId = await requireTenantId();
  await prisma.quote.updateMany({
    where: { id: quoteId, tenantId },
    data: { status: "REJECTED", rejectionReason: reason || null },
  });
  revalidatePath("/orcamentos");
}

export async function approveQuoteByToken(token: string, approvedByName?: string) {
  const quote = await prisma.quote.findUnique({
    where: { approvalToken: token },
  });
  if (!quote) throw new Error("Orçamento não encontrado");
  if (quote.status === "APPROVED" || quote.status === "CONVERTED") {
    return quote;
  }
  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedByName: approvedByName || "Cliente",
    },
  });
  revalidatePath("/orcamentos");
  return quote;
}

export async function getQuoteByToken(token: string) {
  return prisma.quote.findUnique({
    where: { approvalToken: token },
    include: {
      customer: true,
      vehicle: true,
      items: true,
      tenant: { select: { name: true } },
    },
  });
}

export async function convertQuoteToWorkOrder(quoteId: string) {
  const tenantId = await requireTenantId();
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, tenantId },
    include: { items: true },
  });
  if (!quote) throw new Error("Orçamento não encontrado");
  if (quote.status !== "APPROVED") throw new Error("Orçamento precisa estar aprovado");
  if (quote.convertedOsId) throw new Error("Orçamento já convertido");

  const number = await nextWorkOrderNumber(tenantId);

  const workOrder = await prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.create({
      data: {
        tenantId,
        customerId: quote.customerId,
        vehicleId: quote.vehicleId,
        number,
        status: "OPEN",
        subtotal: quote.subtotal,
        discount: quote.discount,
        total: quote.total,
        customerNotes: quote.notes,
      },
    });

    for (const item of quote.items) {
      await tx.workOrderItem.create({
        data: {
          workOrderId: wo.id,
          type: item.type === "SERVICE" ? "SERVICE" : "PART",
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          serviceId: item.serviceId,
          productId: item.productId,
        },
      });
    }

    await tx.quote.update({
      where: { id: quoteId },
      data: { status: "CONVERTED", convertedOsId: wo.id },
    });

    await tx.workOrderStatusHistory.create({
      data: {
        workOrderId: wo.id,
        toStatus: "OPEN",
        notes: `Convertido do orçamento #${quote.number}`,
      },
    });

    return wo;
  });

  revalidatePath("/orcamentos");
  revalidatePath("/ordens");
  revalidatePath(`/ordens/${workOrder.id}`);
  return workOrder.id;
}
