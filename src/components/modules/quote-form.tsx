"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuote } from "@/lib/actions/quotes";
import { CustomerVehicleSection } from "@/components/forms/customer-vehicle-section";
import {
  LineItemsEditor,
  LineItemsHiddenInput,
} from "@/components/forms/line-items-editor";
import { type LineItemDraft, sumLineItems } from "@/lib/line-items";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type CustomerOption = { id: string; name: string; document?: string | null; phone?: string | null };
type VehicleOption = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  customerId: string;
};
type CatalogOption = { id: string; name: string; price: number };

export function QuoteForm({
  customers,
  vehicles,
  services,
  products,
}: {
  customers: CustomerOption[];
  vehicles: VehicleOption[];
  services: CatalogOption[];
  products: CatalogOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<LineItemDraft[]>([]);
  const [discount, setDiscount] = useState("0");

  const subtotal = sumLineItems(items);
  const discountNum = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountNum);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) {
      alert("Adicione pelo menos um item ao orçamento.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const id = await createQuote(fd);
      router.push(`/orcamentos/${id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <LineItemsHiddenInput items={items} />

      <CustomerVehicleSection customers={customers} vehicles={vehicles} />

      <Card>
        <CardHeader>
          <CardTitle>Itens do orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsEditor
            items={items}
            onChange={setItems}
            services={services}
            products={products}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condições comerciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Validade (dias)</Label>
              <Input name="validDays" type="number" min={1} defaultValue={7} />
            </div>
            <div className="space-y-2">
              <Label>Desconto (R$)</Label>
              <Input
                name="discount"
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-end rounded-xl bg-slate-50 p-3">
              <span className="text-xs text-slate-500">Total do orçamento</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações para o cliente</Label>
            <Textarea
              name="notes"
              rows={3}
              placeholder="Forma de pagamento, prazo de execução, garantias..."
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Criando orçamento..." : "Criar orçamento completo"}
      </Button>
    </form>
  );
}
