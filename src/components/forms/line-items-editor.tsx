"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { type LineItemDraft, lineItemTotal, sumLineItems } from "@/lib/line-items";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type CatalogOption = { id: string; name: string; price: number };

type LineItemsEditorProps = {
  items: LineItemDraft[];
  onChange: (items: LineItemDraft[]) => void;
  services: CatalogOption[];
  products: CatalogOption[];
};

const TYPE_LABELS = {
  SERVICE: "Serviço",
  PART: "Peça",
  OTHER: "Terceiro / externo",
};

export function LineItemsEditor({ items, onChange, services, products }: LineItemsEditorProps) {
  const [itemType, setItemType] = useState<"SERVICE" | "PART" | "OTHER">("SERVICE");
  const [refId, setRefId] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  function addItem() {
    let description = customDesc;
    let unitPrice = Number(customPrice) || 0;
    let catalogRefId: string | undefined;

    if (itemType === "SERVICE" && refId) {
      const s = services.find((x) => x.id === refId);
      if (!s) return;
      description = s.name;
      unitPrice = s.price;
      catalogRefId = s.id;
    } else if (itemType === "PART" && refId) {
      const p = products.find((x) => x.id === refId);
      if (!p) return;
      description = p.name;
      unitPrice = p.price;
      catalogRefId = p.id;
    } else if (itemType === "OTHER") {
      if (!description.trim()) return;
    } else {
      return;
    }

    const qty = Number(quantity) || 1;
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        type: itemType,
        refId: catalogRefId,
        description,
        quantity: qty,
        unitPrice,
      },
    ]);

    setRefId("");
    setCustomDesc("");
    setCustomPrice("");
    setQuantity("1");
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  const total = sumLineItems(items);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">Adicionar item</p>
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label>Tipo</Label>
            <Select
              value={itemType}
              onChange={(e) => {
                setItemType(e.target.value as "SERVICE" | "PART" | "OTHER");
                setRefId("");
                setCustomDesc("");
              }}
            >
              <option value="SERVICE">Serviço</option>
              <option value="PART">Peça</option>
              <option value="OTHER">Terceiro / externo</option>
            </Select>
          </div>

          {itemType !== "OTHER" ? (
            <div className="md:col-span-5">
              <Label>{itemType === "SERVICE" ? "Serviço" : "Peça"}</Label>
              <Select value={refId} onChange={(e) => setRefId(e.target.value)}>
                <option value="">Selecione do catálogo...</option>
                {(itemType === "SERVICE" ? services : products).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} — {formatCurrency(o.price)}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <>
              <div className="md:col-span-4">
                <Label>Descrição *</Label>
                <Input
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Ex: Funilaria parceira, guincho..."
                />
              </div>
              <div className="md:col-span-2">
                <Label>Valor unit. (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <Label>Qtd</Label>
            <Input
              type="number"
              min={0.001}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="flex items-end md:col-span-2">
            <Button type="button" className="w-full" onClick={addItem}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
          Nenhum item adicionado. Inclua serviços, peças e terceiros.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Qtd</th>
                <th className="px-4 py-3 text-right">Unit.</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="w-12 px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.description}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.type === "OTHER" ? "warning" : item.type === "PART" ? "info" : "orange"}>
                      {TYPE_LABELS[item.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(lineItemTotal(item))}
                  </td>
                  <td className="px-2 py-3">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/80 px-4 py-3">
            <span className="text-sm text-slate-500">Total:&nbsp;</span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function LineItemsHiddenInput({ items }: { items: LineItemDraft[] }) {
  return <input type="hidden" name="items" value={JSON.stringify(items)} />;
}
