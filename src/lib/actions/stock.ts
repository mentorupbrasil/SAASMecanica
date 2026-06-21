"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export async function listStockMovements() {
  const tenantId = await requireTenantId();
  return prisma.stockMovement.findMany({
    where: { tenantId },
    include: {
      product: { select: { name: true, sku: true } },
      supplier: { select: { name: true } },
      workOrder: { select: { number: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function addStockEntry(formData: FormData) {
  const tenantId = await requireTenantId();
  const productId = String(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));
  const unitCost = Number(formData.get("unitCost") || 0);
  const supplierId = String(formData.get("supplierId") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  if (!productId || quantity <= 0) throw new Error("Dados inválidos");

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.create({
      data: {
        tenantId,
        productId,
        supplierId,
        type: "PURCHASE",
        quantity,
        unitCost,
        notes,
      },
    });
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { increment: quantity } },
    });
  });

  revalidatePath("/estoque");
  revalidatePath("/produtos");
}

export async function adjustStock(formData: FormData) {
  const tenantId = await requireTenantId();
  const productId = String(formData.get("productId"));
  const newQty = Number(formData.get("newQty"));
  const notes = String(formData.get("notes") || "Ajuste manual");

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) throw new Error("Produto não encontrado");

  const diff = newQty - Number(product.stockQty);
  if (diff === 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.create({
      data: {
        tenantId,
        productId,
        type: "ADJUSTMENT",
        quantity: Math.abs(diff),
        notes: `${notes} (${diff > 0 ? "+" : "-"}${Math.abs(diff)})`,
      },
    });
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: newQty },
    });
  });

  revalidatePath("/estoque");
  revalidatePath("/produtos");
}
