"use client";

import { useMemo, useState } from "react";
import { UserPlus, Car } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { VehicleModelPickerInline } from "@/components/forms/vehicle-model-picker";
import { cn } from "@/lib/utils";

type CustomerOption = {
  id: string;
  name: string;
  document?: string | null;
  phone?: string | null;
};

type VehicleOption = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  customerId: string;
  mileage?: unknown;
};

export function CustomerVehicleSection({
  customers,
  vehicles,
}: {
  customers: CustomerOption[];
  vehicles: VehicleOption[];
}) {
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => v.customerId === customerId),
    [vehicles, customerId],
  );

  return (
    <div className="space-y-6">
      <input type="hidden" name="customerMode" value={customerMode} />
      <input type="hidden" name="vehicleMode" value={vehicleMode} />

      {/* Cliente */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-orange-600" />
            <h3 className="font-bold text-slate-900">Cliente</h3>
          </div>
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs">
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold transition-colors",
                customerMode === "existing" ? "bg-orange-600 text-white" : "text-slate-600",
              )}
              onClick={() => setCustomerMode("existing")}
            >
              Já cadastrado
            </button>
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold transition-colors",
                customerMode === "new" ? "bg-orange-600 text-white" : "text-slate-600",
              )}
              onClick={() => {
                setCustomerMode("new");
                setCustomerId("");
              }}
            >
              Cliente novo
            </button>
          </div>
        </div>

        {customerMode === "existing" ? (
          <div className="space-y-2">
            <Label>Selecione o cliente *</Label>
            <Select
              name="customerId"
              required={customerMode === "existing"}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setVehicleMode("existing");
              }}
            >
              <option value="">Busque na lista...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.phone ? ` · ${c.phone}` : ""}
                </option>
              ))}
            </Select>
            <p className="text-xs text-slate-400">
              Não encontrou? Use a aba &quot;Cliente novo&quot; ao lado.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nome completo *</Label>
              <Input name="newCustomerName" required={customerMode === "new"} placeholder="João Silva" />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input name="newCustomerPhone" placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label>CPF (opcional)</Label>
              <Input name="newCustomerDocument" placeholder="000.000.000-00" />
            </div>
          </div>
        )}
      </section>

      {/* Veículo */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-orange-600" />
            <h3 className="font-bold text-slate-900">Veículo</h3>
          </div>
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs">
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold transition-colors",
                vehicleMode === "existing" ? "bg-orange-600 text-white" : "text-slate-600",
                customerMode === "new" && "opacity-40 pointer-events-none",
              )}
              onClick={() => setVehicleMode("existing")}
            >
              Já cadastrado
            </button>
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold transition-colors",
                vehicleMode === "new" ? "bg-orange-600 text-white" : "text-slate-600",
              )}
              onClick={() => setVehicleMode("new")}
            >
              Veículo novo
            </button>
          </div>
        </div>

        {vehicleMode === "existing" && customerMode === "existing" ? (
          <div className="space-y-2">
            <Label>Selecione o veículo *</Label>
            <Select
              name="vehicleId"
              required={vehicleMode === "existing" && customerMode === "existing"}
              disabled={!customerId}
            >
              <option value="">
                {customerId ? "Placa do veículo..." : "Selecione o cliente primeiro"}
              </option>
              {filteredVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand} {v.model}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="space-y-4">
            <VehicleModelPickerInline
              brand={vehicleBrand}
              model={vehicleModel}
              onBrandChange={setVehicleBrand}
              onModelChange={setVehicleModel}
            />
            <input type="hidden" name="newVehicleBrand" value={vehicleBrand} />
            <input type="hidden" name="newVehicleModel" value={vehicleModel} />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Placa *</Label>
                <Input name="newVehiclePlate" required={vehicleMode === "new"} placeholder="ABC1D23" />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input name="newVehicleYear" type="number" placeholder="2020" />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input name="newVehicleColor" placeholder="Prata" />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
