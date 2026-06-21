"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuote } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CustomerOption = { id: string; name: string };
type VehicleOption = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  customerId: string;
};

export function QuoteForm({
  customers,
  vehicles,
}: {
  customers: CustomerOption[];
  vehicles: VehicleOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState("");

  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => v.customerId === customerId),
    [vehicles, customerId],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const id = await createQuote(fd);
      router.push(`/orcamentos/${id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="space-y-2">
        <Label>Cliente *</Label>
        <Select
          name="customerId"
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Selecione o cliente</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Veículo *</Label>
        <Select name="vehicleId" required disabled={!customerId}>
          <option value="">
            {customerId ? "Selecione o veículo" : "Selecione um cliente primeiro"}
          </option>
          {filteredVehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plate} — {v.brand} {v.model}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Validade (dias)</Label>
        <Input name="validDays" type="number" min={1} defaultValue={7} />
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea name="notes" rows={3} placeholder="Condições, observações..." />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Criando..." : "Criar orçamento"}
      </Button>
    </form>
  );
}
