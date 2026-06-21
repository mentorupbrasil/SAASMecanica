"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, RefreshCw } from "lucide-react";
import { addStockEntry, adjustStock } from "@/lib/actions/stock";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency } from "@/lib/utils";

type Movement = {
  id: string;
  type: string;
  quantity: { toString(): string } | number;
  unitCost: { toString(): string } | number;
  notes: string | null;
  createdAt: Date;
  product: { name: string; sku: string | null };
  supplier: { name: string } | null;
  workOrder: { number: number } | null;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  stockQty: { toString(): string } | number;
  supplier: { name: string } | null;
};

type SupplierOption = { id: string; name: string };

const TYPE_LABELS: Record<string, string> = {
  PURCHASE: "Compra",
  SALE: "Venda",
  WORK_ORDER: "Ordem de Serviço",
  ADJUSTMENT: "Ajuste",
  RETURN: "Devolução",
  TRANSFER: "Transferência",
  INVENTORY: "Inventário",
};

export function StockManager({
  movements,
  products,
  supplierOptions,
}: {
  movements: Movement[];
  products: Product[];
  supplierOptions: SupplierOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleEntry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addStockEntry(fd);
      e.currentTarget.reset();
      router.refresh();
    });
  }

  async function handleAdjust(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await adjustStock(fd);
      e.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Entrada de estoque</h3>
          </div>
          <form onSubmit={handleEntry} className="space-y-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select name="productId" required defaultValue="">
                <option value="">Selecione...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.sku ? ` (${p.sku})` : ""} — estoque: {Number(p.stockQty)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input name="quantity" type="number" min={0.001} step="0.001" required />
              </div>
              <div className="space-y-2">
                <Label>Custo unitário (R$)</Label>
                <Input name="unitCost" type="number" min={0} step="0.01" defaultValue={0} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select name="supplierId" defaultValue="">
                <option value="">Nenhum</option>
                {supplierOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea name="notes" rows={2} />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Registrando..." : "Registrar entrada"}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Ajuste de estoque</h3>
          </div>
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select name="productId" required defaultValue="">
                <option value="">Selecione...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.sku ? ` (${p.sku})` : ""} — atual: {Number(p.stockQty)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nova quantidade *</Label>
              <Input name="newQty" type="number" min={0} step="0.001" required />
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Textarea name="notes" rows={2} placeholder="Ajuste manual" />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Ajustando..." : "Ajustar estoque"}
            </Button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-slate-900">Movimentações recentes</h3>
        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Data</TH>
                <TH>Produto</TH>
                <TH>Tipo</TH>
                <TH>Qtd</TH>
                <TH>Custo unit.</TH>
                <TH>Fornecedor / OS</TH>
                <TH>Observações</TH>
              </TR>
            </THead>
            <TBody>
              {movements.length === 0 ? (
                <EmptyRow colSpan={7} message="Nenhuma movimentação registrada" />
              ) : (
                movements.map((m) => (
                  <TR key={m.id}>
                    <TD className="whitespace-nowrap text-xs">
                      {new Date(m.createdAt).toLocaleString("pt-BR")}
                    </TD>
                    <TD>
                      <div className="font-medium">{m.product.name}</div>
                      {m.product.sku && (
                        <div className="text-xs text-slate-400">{m.product.sku}</div>
                      )}
                    </TD>
                    <TD>
                      <Badge variant="default">
                        {TYPE_LABELS[m.type] ?? m.type}
                      </Badge>
                    </TD>
                    <TD>{Number(m.quantity)}</TD>
                    <TD>{formatCurrency(Number(m.unitCost))}</TD>
                    <TD>
                      {m.supplier?.name ??
                        (m.workOrder ? `OS #${m.workOrder.number}` : "—")}
                    </TD>
                    <TD className="max-w-xs truncate text-xs text-slate-500">
                      {m.notes ?? "—"}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </DataTable>
      </div>
    </div>
  );
}
