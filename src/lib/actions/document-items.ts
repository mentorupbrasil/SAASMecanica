"use server";

import type { Prisma } from "../../../generated/prisma/client";
import type { LineItemDraft } from "@/lib/line-items";
import { formatPlate } from "@/lib/utils";

type Tx = Prisma.TransactionClient;

export async function resolveCustomerId(
  tx: Tx,
  tenantId: string,
  formData: FormData,
): Promise<string> {
  const mode = String(formData.get("customerMode") ?? "existing");

  if (mode === "new") {
    const name = String(formData.get("newCustomerName") ?? "").trim();
    if (name.length < 2) throw new Error("Informe o nome do cliente");

    const customer = await tx.customer.create({
      data: {
        tenantId,
        name,
        phone: String(formData.get("newCustomerPhone") ?? "") || null,
        whatsapp: String(formData.get("newCustomerPhone") ?? "") || null,
        document: String(formData.get("newCustomerDocument") ?? "") || null,
      },
    });
    return customer.id;
  }

  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) throw new Error("Selecione o cliente");
  return customerId;
}

export async function resolveVehicleId(
  tx: Tx,
  tenantId: string,
  customerId: string,
  formData: FormData,
): Promise<string> {
  const mode = String(formData.get("vehicleMode") ?? "existing");

  if (mode === "new") {
    const plate = formatPlate(String(formData.get("newVehiclePlate") ?? ""));
    const brand = String(formData.get("newVehicleBrand") ?? "").trim();
    const model = String(formData.get("newVehicleModel") ?? "").trim();
    if (!plate || plate.length < 7) throw new Error("Placa inválida");
    if (!brand || !model) throw new Error("Informe marca e modelo do veículo");

    const yearRaw = formData.get("newVehicleYear");
    const year = yearRaw ? Number(yearRaw) : null;

    const vehicle = await tx.vehicle.create({
      data: {
        tenantId,
        customerId,
        plate,
        brand,
        model,
        year: year && !Number.isNaN(year) ? year : null,
        color: String(formData.get("newVehicleColor") ?? "") || null,
      },
    });
    return vehicle.id;
  }

  const vehicleId = String(formData.get("vehicleId") ?? "");
  if (!vehicleId) throw new Error("Selecione o veículo");
  return vehicleId;
}

export async function persistWorkOrderItems(
  tx: Tx,
  tenantId: string,
  workOrderId: string,
  items: LineItemDraft[],
) {
  for (const item of items) {
    let description = item.description;
    let unitPrice = item.unitPrice;
    let costPrice = 0;
    let serviceId: string | null = null;
    let productId: string | null = null;
    const type = item.type;

    if (type === "SERVICE" && item.refId) {
      const s = await tx.serviceCatalog.findFirst({ where: { id: item.refId, tenantId } });
      if (s) {
        description = s.name;
        unitPrice = Number(s.price);
        costPrice = Number(s.cost);
        serviceId = s.id;
      }
    } else if (type === "PART" && item.refId) {
      const p = await tx.product.findFirst({ where: { id: item.refId, tenantId } });
      if (p) {
        description = p.name;
        unitPrice = Number(p.salePrice);
        costPrice = Number(p.costPrice);
        productId = p.id;
      }
    }

    await tx.workOrderItem.create({
      data: {
        workOrderId,
        type,
        description,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        total: item.quantity * unitPrice,
        serviceId,
        productId,
      },
    });
  }
}

export async function persistQuoteItems(
  tx: Tx,
  tenantId: string,
  quoteId: string,
  items: LineItemDraft[],
) {
  for (const item of items) {
    let description = item.description;
    let unitPrice = item.unitPrice;
    let serviceId: string | null = null;
    let productId: string | null = null;
    const type = item.type;

    if (type === "SERVICE" && item.refId) {
      const s = await tx.serviceCatalog.findFirst({ where: { id: item.refId, tenantId } });
      if (s) {
        description = s.name;
        unitPrice = Number(s.price);
        serviceId = s.id;
      }
    } else if (type === "PART" && item.refId) {
      const p = await tx.product.findFirst({ where: { id: item.refId, tenantId } });
      if (p) {
        description = p.name;
        unitPrice = Number(p.salePrice);
        productId = p.id;
      }
    }

    await tx.quoteItem.create({
      data: {
        quoteId,
        type,
        description,
        quantity: item.quantity,
        unitPrice,
        total: item.quantity * unitPrice,
        serviceId,
        productId,
      },
    });
  }
}
