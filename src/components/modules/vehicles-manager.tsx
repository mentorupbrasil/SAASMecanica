"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createVehicle,
  deleteVehicle,
  updateVehicle,
} from "@/lib/actions/vehicles";
import { VehicleModelPicker } from "@/components/forms/vehicle-model-picker";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

type Vehicle = {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  chassis: string | null;
  mileage: number;
  customer: { id: string; name: string };
};

type CustomerOption = { id: string; name: string; document: string | null };

export function VehiclesManager({
  vehicles,
  customerOptions,
}: {
  vehicles: Vehicle[];
  customerOptions: CustomerOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditing(v);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateVehicle(editing.id, fd);
      else await createVehicle(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo veículo
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Placa</TH>
              <TH>Veículo</TH>
              <TH>Cliente</TH>
              <TH>Cor</TH>
              <TH>Km</TH>
              <TH className="w-24">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {vehicles.length === 0 ? (
              <EmptyRow colSpan={6} message="Nenhum veículo cadastrado" />
            ) : (
              vehicles.map((v) => (
                <TR key={v.id}>
                  <TD className="font-medium">{v.plate}</TD>
                  <TD>
                    <div className="font-medium">
                      {v.brand} {v.model}
                    </div>
                    <div className="text-xs text-slate-400">{v.year ?? "—"}</div>
                  </TD>
                  <TD>{v.customer.name}</TD>
                  <TD>{v.color ?? "—"}</TD>
                  <TD>{v.mileage.toLocaleString("pt-BR")}</TD>
                  <TD>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            await deleteVehicle(v.id);
                            router.refresh();
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </DataTable>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar veículo" : "Novo veículo"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select
              name="customerId"
              required
              defaultValue={editing?.customerId ?? ""}
            >
              <option value="">Selecione...</option>
              {customerOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placa *</Label>
              <Input
                name="plate"
                required
                defaultValue={editing?.plate ?? ""}
                placeholder="ABC1D23"
              />
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input name="year" type="number" defaultValue={editing?.year ?? ""} />
            </div>
          </div>
          <VehicleModelPicker
            defaultBrand={editing?.brand ?? ""}
            defaultModel={editing?.model ?? ""}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor</Label>
              <Input name="color" defaultValue={editing?.color ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Quilometragem</Label>
              <Input
                name="mileage"
                type="number"
                min={0}
                defaultValue={editing?.mileage ?? 0}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Chassi</Label>
            <Input name="chassis" defaultValue={editing?.chassis ?? ""} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
