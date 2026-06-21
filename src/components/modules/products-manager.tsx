"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/crud/modal";
import {
  DataTable,
  EmptyRow,
  Table,
  TBody,
  TD,
  THead,
  TH,
  TR,
} from "@/components/crud/data-table";
import { cn, formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  brand: string | null;
  supplierId: string | null;
  costPrice: { toString(): string } | number;
  salePrice: { toString(): string } | number;
  stockQty: { toString(): string } | number;
  minStock: { toString(): string } | number;
  location: string | null;
  supplier: { name: string } | null;
};

type SupplierOption = { id: string; name: string };

function isLowStock(product: Product) {
  return Number(product.stockQty) <= Number(product.minStock);
}

export function ProductsManager({
  products,
  supplierOptions,
}: {
  products: Product[];
  supplierOptions: SupplierOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateProduct(editing.id, fd);
      else await createProduct(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Produto</TH>
              <TH>SKU</TH>
              <TH>Fornecedor</TH>
              <TH>Estoque</TH>
              <TH>Custo</TH>
              <TH>Venda</TH>
              <TH>Local</TH>
              <TH className="w-24">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {products.length === 0 ? (
              <EmptyRow colSpan={8} message="Nenhum produto cadastrado" />
            ) : (
              products.map((p) => {
                const low = isLowStock(p);
                return (
                  <TR
                    key={p.id}
                    className={cn(
                      low && "bg-red-50 hover:bg-red-50/80",
                    )}
                  >
                    <TD>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-400">
                        {p.category ?? ""}
                        {p.brand ? ` · ${p.brand}` : ""}
                      </div>
                    </TD>
                    <TD>{p.sku ?? "—"}</TD>
                    <TD>{p.supplier?.name ?? "—"}</TD>
                    <TD>
                      <div className={cn("font-medium", low && "text-red-600")}>
                        {Number(p.stockQty)}
                      </div>
                      {low && (
                        <Badge variant="danger">Estoque baixo</Badge>
                      )}
                      <div className="text-xs text-slate-400">
                        mín: {Number(p.minStock)}
                      </div>
                    </TD>
                    <TD>{formatCurrency(Number(p.costPrice))}</TD>
                    <TD>{formatCurrency(Number(p.salePrice))}</TD>
                    <TD>{p.location ?? "—"}</TD>
                    <TD>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            startTransition(async () => {
                              await deleteProduct(p.id);
                              router.refresh();
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </DataTable>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar produto" : "Novo produto"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input name="name" required defaultValue={editing?.name ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input name="sku" defaultValue={editing?.sku ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input name="category" defaultValue={editing?.category ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input name="brand" defaultValue={editing?.brand ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select
                name="supplierId"
                defaultValue={editing?.supplierId ?? ""}
              >
                <option value="">Nenhum</option>
                {supplierOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço de custo (R$)</Label>
              <Input
                name="costPrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={Number(editing?.costPrice ?? 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço de venda (R$)</Label>
              <Input
                name="salePrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={Number(editing?.salePrice ?? 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input
                name="stockQty"
                type="number"
                min={0}
                step="0.001"
                defaultValue={Number(editing?.stockQty ?? 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque mínimo</Label>
              <Input
                name="minStock"
                type="number"
                min={0}
                step="0.001"
                defaultValue={Number(editing?.minStock ?? 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input name="location" defaultValue={editing?.location ?? ""} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
