"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  supplierId: z.string().optional(),
  costPrice: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  stockQty: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  location: z.string().optional(),
});

export async function listProducts(search?: string) {
  const tenantId = await requireTenantId();
  return prisma.product.findMany({
    where: {
      tenantId,
      active: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { supplier: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createProduct(formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    category: formData.get("category") || undefined,
    brand: formData.get("brand") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    costPrice: formData.get("costPrice") || 0,
    salePrice: formData.get("salePrice") || 0,
    stockQty: formData.get("stockQty") || 0,
    minStock: formData.get("minStock") || 0,
    location: formData.get("location") || undefined,
  });
  await prisma.product.create({
    data: {
      tenantId,
      ...data,
      supplierId: data.supplierId || null,
    },
  });
  revalidatePath("/produtos");
  revalidatePath("/estoque");
}

export async function updateProduct(id: string, formData: FormData) {
  const tenantId = await requireTenantId();
  const data = schema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    category: formData.get("category") || undefined,
    brand: formData.get("brand") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    costPrice: formData.get("costPrice") || 0,
    salePrice: formData.get("salePrice") || 0,
    stockQty: formData.get("stockQty") || 0,
    minStock: formData.get("minStock") || 0,
    location: formData.get("location") || undefined,
  });
  await prisma.product.updateMany({
    where: { id, tenantId },
    data: { ...data, supplierId: data.supplierId || null },
  });
  revalidatePath("/produtos");
  revalidatePath("/estoque");
}

export async function deleteProduct(id: string) {
  const tenantId = await requireTenantId();
  await prisma.product.updateMany({ where: { id, tenantId }, data: { active: false } });
  revalidatePath("/produtos");
}

export async function listProductsOptions() {
  const tenantId = await requireTenantId();
  return prisma.product.findMany({
    where: { tenantId, active: true },
    select: { id: true, name: true, salePrice: true, costPrice: true, stockQty: true },
    orderBy: { name: "asc" },
  });
}

export async function listLowStockProducts() {
  const tenantId = await requireTenantId();
  const products = await prisma.product.findMany({
    where: { tenantId, active: true },
    orderBy: { stockQty: "asc" },
  });
  return products.filter((p) => Number(p.stockQty) <= Number(p.minStock));
}
