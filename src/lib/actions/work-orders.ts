"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nextWorkOrderNumber } from "@/lib/numbers";
import { requireTenantId } from "@/lib/session";

const OPEN_STATUSES = [
  "OPEN",
  "DIAGNOSIS",
  "WAITING_APPROVAL",
  "WAITING_PARTS",
  "IN_PROGRESS",
  "QUALITY_CHECK",
  "FINISHED",
] as const;

async function recalcWorkOrder(workOrderId: string) {
  const items = await prisma.workOrderItem.findMany({ where: { workOrderId } });
  const subtotal = items.reduce((s, i) => s + Number(i.total), 0);
  const wo = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
  const discount = Number(wo?.discount ?? 0);
  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { subtotal, total: subtotal - discount },
  });
}

export async function listWorkOrders(status?: string, search?: string) {
  const tenantId = await requireTenantId();
  return prisma.workOrder.findMany({
    where: {
      tenantId,
      ...(status && status !== "ALL" ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { customer: { name: { contains: search, mode: "insensitive" } } },
              { vehicle: { plate: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      customer: { select: { name: true, phone: true } },
      vehicle: { select: { plate: true, brand: true, model: true } },
      assignedMechanic: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { openedAt: "desc" },
  });
}

export async function listWorkOrdersKanban() {
  const tenantId = await requireTenantId();
  return prisma.workOrder.findMany({
    where: {
      tenantId,
      status: { in: [...OPEN_STATUSES] },
    },
    include: {
      customer: { select: { name: true } },
      vehicle: { select: { plate: true } },
      assignedMechanic: { select: { name: true } },
    },
    orderBy: { openedAt: "desc" },
  }).then((rows) =>
    rows.map((r) => ({
      ...r,
      total: Number(r.total),
    })),
  );
}

export async function getWorkOrder(id: string) {
  const tenantId = await requireTenantId();
  return prisma.workOrder.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      vehicle: true,
      assignedMechanic: true,
      serviceBay: true,
      items: true,
      complaints: true,
      laborEntries: { include: { employee: { select: { name: true } } } },
      statusHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      warranties: true,
      photos: true,
    },
  });
}

export async function createWorkOrder(formData: FormData) {
  const tenantId = await requireTenantId();
  const customerId = String(formData.get("customerId"));
  const vehicleId = String(formData.get("vehicleId"));
  const mileageIn = Number(formData.get("mileageIn") || 0) || null;
  const customerNotes = String(formData.get("customerNotes") || "") || null;
  const assignedMechanicId = String(formData.get("assignedMechanicId") || "") || null;
  const complaint = String(formData.get("complaint") || "") || null;

  const number = await nextWorkOrderNumber(tenantId);

  const wo = await prisma.$transaction(async (tx) => {
    const order = await tx.workOrder.create({
      data: {
        tenantId,
        customerId,
        vehicleId,
        number,
        status: "OPEN",
        mileageIn,
        customerNotes,
        assignedMechanicId,
      },
    });

    if (complaint) {
      await tx.workOrderComplaint.create({
        data: { workOrderId: order.id, description: complaint },
      });
    }

    if (mileageIn) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { mileage: mileageIn },
      });
    }

    await tx.workOrderStatusHistory.create({
      data: { workOrderId: order.id, toStatus: "OPEN", notes: "OS aberta" },
    });

    return order;
  });

  revalidatePath("/ordens");
  revalidatePath("/kanban");
  return wo.id;
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  status: string,
  notes?: string,
) {
  const tenantId = await requireTenantId();
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("OS não encontrada");

  const data: Record<string, unknown> = { status };
  if (status === "IN_PROGRESS" && !wo.startedAt) data.startedAt = new Date();
  if (status === "FINISHED") data.finishedAt = new Date();
  if (status === "DELIVERED") data.deliveredAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.workOrder.update({ where: { id: workOrderId }, data });
    await tx.workOrderStatusHistory.create({
      data: {
        workOrderId,
        fromStatus: wo.status,
        toStatus: status as never,
        notes: notes || null,
      },
    });
  });

  revalidatePath("/ordens");
  revalidatePath("/kanban");
  revalidatePath(`/ordens/${workOrderId}`);
}

export async function addWorkOrderItem(formData: FormData) {
  const tenantId = await requireTenantId();
  const workOrderId = String(formData.get("workOrderId"));
  const type = String(formData.get("type")) as "SERVICE" | "PART";
  const refId = String(formData.get("refId"));
  const quantity = Number(formData.get("quantity") || 1);

  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) throw new Error("OS não encontrada");

  let description = "";
  let unitPrice = 0;
  let costPrice = 0;
  let productId: string | null = null;
  let serviceId: string | null = null;

  if (type === "SERVICE") {
    const s = await prisma.serviceCatalog.findFirst({ where: { id: refId, tenantId } });
    if (!s) throw new Error("Serviço não encontrado");
    description = s.name;
    unitPrice = Number(s.price);
    costPrice = Number(s.cost);
    serviceId = s.id;
  } else {
    const p = await prisma.product.findFirst({ where: { id: refId, tenantId } });
    if (!p) throw new Error("Peça não encontrada");
    description = p.name;
    unitPrice = Number(p.salePrice);
    costPrice = Number(p.costPrice);
    productId = p.id;
  }

  const total = quantity * unitPrice;

  await prisma.workOrderItem.create({
    data: {
      workOrderId,
      type,
      description,
      quantity,
      unitPrice,
      costPrice,
      total,
      serviceId,
      productId,
    },
  });

  await recalcWorkOrder(workOrderId);
  revalidatePath(`/ordens/${workOrderId}`);
  revalidatePath("/ordens");
}

export async function removeWorkOrderItem(itemId: string, workOrderId: string) {
  const tenantId = await requireTenantId();
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) return;
  await prisma.workOrderItem.delete({ where: { id: itemId } });
  await recalcWorkOrder(workOrderId);
  revalidatePath(`/ordens/${workOrderId}`);
}

export async function addWorkOrderComplaint(workOrderId: string, description: string) {
  const tenantId = await requireTenantId();
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) return;
  await prisma.workOrderComplaint.create({ data: { workOrderId, description } });
  revalidatePath(`/ordens/${workOrderId}`);
}

export async function updateWorkOrderDiagnosis(workOrderId: string, diagnosis: string) {
  const tenantId = await requireTenantId();
  await prisma.workOrder.updateMany({
    where: { id: workOrderId, tenantId },
    data: { diagnosis, status: "DIAGNOSIS" },
  });
  revalidatePath(`/ordens/${workOrderId}`);
  revalidatePath("/kanban");
}

export async function finishWorkOrder(workOrderId: string) {
  const tenantId = await requireTenantId();
  const wo = await prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId },
    include: { items: true, customer: true },
  });
  if (!wo) throw new Error("OS não encontrada");

  await prisma.$transaction(async (tx) => {
    for (const item of wo.items) {
      if (item.type === "PART" && item.productId && item.executed) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const qty = Number(item.quantity);
          await tx.stockMovement.create({
            data: {
              tenantId,
              productId: item.productId,
              workOrderId,
              type: "WORK_ORDER",
              quantity: qty,
              unitCost: Number(item.costPrice),
            },
          });
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { decrement: qty } },
          });
        }
      }
    }

    await tx.workOrder.update({
      where: { id: workOrderId },
      data: { status: "FINISHED", finishedAt: new Date() },
    });

    await tx.accountReceivable.create({
      data: {
        tenantId,
        customerId: wo.customerId,
        workOrderId,
        description: `OS #${wo.number}`,
        amount: wo.total,
        dueDate: new Date(Date.now() + 7 * 86400000),
        status: "PENDING",
      },
    });

    await tx.cashFlowEntry.create({
      data: {
        tenantId,
        type: "INCOME",
        category: "Serviços",
        description: `OS #${wo.number} - ${wo.customer.name}`,
        amount: wo.total,
        reference: workOrderId,
      },
    });

    await tx.workOrderStatusHistory.create({
      data: {
        workOrderId,
        fromStatus: wo.status,
        toStatus: "FINISHED",
        notes: "OS finalizada — estoque e financeiro atualizados",
      },
    });
  });

  revalidatePath("/ordens");
  revalidatePath("/kanban");
  revalidatePath("/financeiro");
  revalidatePath("/estoque");
  revalidatePath(`/ordens/${workOrderId}`);
}

export async function markItemExecuted(itemId: string, workOrderId: string, executed: boolean) {
  const tenantId = await requireTenantId();
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId } });
  if (!wo) return;
  await prisma.workOrderItem.update({ where: { id: itemId }, data: { executed } });
  revalidatePath(`/ordens/${workOrderId}`);
}

export async function assignMechanic(workOrderId: string, mechanicId: string) {
  const tenantId = await requireTenantId();
  await prisma.workOrder.updateMany({
    where: { id: workOrderId, tenantId },
    data: { assignedMechanicId: mechanicId || null },
  });
  revalidatePath(`/ordens/${workOrderId}`);
  revalidatePath("/kanban");
}
