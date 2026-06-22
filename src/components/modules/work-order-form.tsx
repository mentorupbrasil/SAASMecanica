"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkOrder } from "@/lib/actions/work-orders";
import { CustomerVehicleSection } from "@/components/forms/customer-vehicle-section";
import {
  LineItemsEditor,
  LineItemsHiddenInput,
} from "@/components/forms/line-items-editor";
import { type LineItemDraft } from "@/lib/line-items";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomerOption = { id: string; name: string; document?: string | null; phone?: string | null };
type VehicleOption = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  customerId: string;
  mileage?: unknown;
};
type MechanicOption = { id: string; name: string };
type CatalogOption = { id: string; name: string; price: number };

export function WorkOrderForm({
  customers,
  vehicles,
  mechanics,
  services,
  products,
}: {
  customers: CustomerOption[];
  vehicles: VehicleOption[];
  mechanics: MechanicOption[];
  services: CatalogOption[];
  products: CatalogOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<LineItemDraft[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const id = await createWorkOrder(fd);
      router.push(`/ordens/${id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <LineItemsHiddenInput items={items} />

      <CustomerVehicleSection customers={customers} vehicles={vehicles} />

      <Card>
        <CardHeader>
          <CardTitle>Entrada e diagnóstico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Quilometragem</Label>
              <Input name="mileageIn" type="number" min={0} placeholder="Km atual" />
            </div>
            <div className="space-y-2">
              <Label>Mecânico responsável</Label>
              <Select name="assignedMechanicId">
                <option value="">Não atribuído</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reclamação do cliente *</Label>
            <Textarea
              name="complaint"
              rows={3}
              required
              placeholder="O que o cliente relatou? Ex: barulho na suspensão, luz da injeção acesa..."
            />
          </div>
          <div className="space-y-2">
            <Label>Observações internas</Label>
            <Textarea name="customerNotes" rows={2} placeholder="Observações visíveis na OS" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços, peças e terceiros</CardTitle>
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

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Abrindo OS..." : "Abrir ordem de serviço"}
      </Button>
    </form>
  );
}
