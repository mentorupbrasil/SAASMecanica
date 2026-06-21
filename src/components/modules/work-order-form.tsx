"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkOrder } from "@/lib/actions/work-orders";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CustomerOption = { id: string; name: string; document: string | null };
type VehicleOption = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  customerId: string;
  mileage: unknown;
};
type MechanicOption = { id: string; name: string };

export function WorkOrderForm({
  customers,
  vehicles,
  mechanics,
}: {
  customers: CustomerOption[];
  vehicles: VehicleOption[];
  mechanics: MechanicOption[];
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
      const id = await createWorkOrder(fd);
      router.push(`/ordens/${id}`);
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

      <div className="grid grid-cols-2 gap-4">
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
        <Label>Reclamação do cliente</Label>
        <Textarea
          name="complaint"
          rows={3}
          placeholder="Descreva o problema relatado pelo cliente"
        />
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea name="customerNotes" rows={2} placeholder="Observações adicionais" />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Abrindo OS..." : "Abrir ordem de serviço"}
      </Button>
    </form>
  );
}
