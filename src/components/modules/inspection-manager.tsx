"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import {
  completeInspection,
  createInspection,
  updateInspectionItem,
} from "@/lib/actions/inspections";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/crud/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

type Inspection = {
  id: string;
  templateName: string;
  mileage: number | null;
  completedAt: Date | null;
  createdAt: Date;
  vehicle: {
    plate: string;
    brand: string | null;
    model: string | null;
    customer: { name: string };
  };
  results: {
    id: string;
    itemLabel: string;
    result: string;
    notes: string | null;
  }[];
};

type VehicleOption = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
};

const resultOptions = [
  { value: "OK", label: "OK", color: "bg-emerald-100 text-emerald-800" },
  { value: "ATTENTION", label: "Atenção", color: "bg-amber-100 text-amber-800" },
  { value: "CRITICAL", label: "Crítico", color: "bg-red-100 text-red-800" },
  { value: "NA", label: "N/A", color: "bg-slate-100 text-slate-600" },
];

export function InspectionManager({
  inspections,
  vehicles,
}: {
  inspections: Inspection[];
  vehicles: VehicleOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = inspections.find((i) => i.id === activeId);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const id = await createInspection(fd);
      setOpen(false);
      setActiveId(id);
      router.refresh();
    });
  }

  function setResult(itemId: string, result: "OK" | "ATTENTION" | "CRITICAL" | "NA") {
    startTransition(async () => {
      await updateInspectionItem(itemId, result);
      router.refresh();
    });
  }

  const criticalCount = active?.results.filter((r) => r.result === "CRITICAL").length ?? 0;
  const attentionCount = active?.results.filter((r) => r.result === "ATTENTION").length ?? 0;

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Inspeções realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inspections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">
              {inspections.filter((i) => i.completedAt).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Itens críticos (ativa)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nova inspeção
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Veículo</TH>
                <TH>Data</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {inspections.length === 0 ? (
                <EmptyRow colSpan={3} message="Nenhuma inspeção" />
              ) : (
                inspections.map((i) => (
                  <TR
                    key={i.id}
                    className={cn("cursor-pointer", activeId === i.id && "bg-orange-50")}
                    onClick={() => setActiveId(i.id)}
                  >
                    <TD className="font-medium">
                      {i.vehicle.plate} — {i.vehicle.customer.name}
                    </TD>
                    <TD>{new Date(i.createdAt).toLocaleDateString("pt-BR")}</TD>
                    <TD>
                      <Badge variant={i.completedAt ? "success" : "warning"}>
                        {i.completedAt ? "Concluída" : "Em andamento"}
                      </Badge>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </DataTable>

        {active ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{active.vehicle.plate}</CardTitle>
                <p className="text-sm text-slate-500">
                  {active.vehicle.brand} {active.vehicle.model} · {active.vehicle.customer.name}
                </p>
              </div>
              {!active.completedAt && (
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await completeInspection(active.id);
                      router.refresh();
                    })
                  }
                >
                  <CheckCircle2 className="h-4 w-4" /> Finalizar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {(criticalCount > 0 || attentionCount > 0) && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {criticalCount} crítico(s) · {attentionCount} atenção
                </div>
              )}
              {active.results.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3"
                >
                  <span className="text-sm font-medium">{item.itemLabel}</span>
                  <div className="flex gap-1">
                    {resultOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={pending || !!active.completedAt}
                        onClick={() =>
                          setResult(item.id, opt.value as "OK" | "ATTENTION" | "CRITICAL" | "NA")
                        }
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium transition-all",
                          item.result === opt.value
                            ? opt.color + " ring-2 ring-orange-300"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex h-full min-h-[300px] items-center justify-center text-sm text-slate-500">
              Selecione uma inspeção ou crie uma nova
            </CardContent>
          </Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova inspeção digital">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Veículo *</Label>
            <Select name="vehicleId" required>
              <option value="">Selecione...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand} {v.model}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quilometragem</Label>
            <Input name="mileage" type="number" placeholder="Ex: 45000" />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Input name="notes" placeholder="Observações gerais" />
          </div>
          <p className="text-xs text-slate-500">
            Checklist padrão com 10 itens (freios, pneus, fluidos, etc.)
          </p>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Criando..." : "Iniciar inspeção"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
