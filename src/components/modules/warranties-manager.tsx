"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createWarranty } from "@/lib/actions/warranties";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

type Warranty = {
  id: string;
  type: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  workOrder: {
    number: number;
    vehicle: { plate: string };
    customer: { name: string };
  };
  _count: { claims: number };
};

type WorkOrderOption = {
  id: string;
  number: number;
  vehicle: { plate: string };
  customer: { name: string };
};

const typeLabels: Record<string, string> = {
  PART: "Peça",
  SERVICE: "Serviço",
};

const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  EXPIRED: { label: "Expirada", variant: "warning" },
  CLAIMED: { label: "Acionada", variant: "info" },
  VOID: { label: "Anulada", variant: "danger" },
};

export function WarrantiesManager({
  warranties,
  workOrders,
}: {
  warranties: Warranty[];
  workOrders: WorkOrderOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createWarranty(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar garantia
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>OS</TH>
              <TH>Veículo</TH>
              <TH>Cliente</TH>
              <TH>Tipo</TH>
              <TH>Descrição</TH>
              <TH>Validade</TH>
              <TH>Status</TH>
              <TH>Acionamentos</TH>
            </TR>
          </THead>
          <TBody>
            {warranties.length === 0 ? (
              <EmptyRow colSpan={8} message="Nenhuma garantia registrada" />
            ) : (
              warranties.map((w) => {
                const st = statusLabels[w.status] ?? { label: w.status, variant: "default" as const };
                return (
                  <TR key={w.id}>
                    <TD>#{w.workOrder.number}</TD>
                    <TD>{w.workOrder.vehicle.plate}</TD>
                    <TD>{w.workOrder.customer.name}</TD>
                    <TD>
                      <Badge variant={w.type === "PART" ? "info" : "orange"}>
                        {typeLabels[w.type] ?? w.type}
                      </Badge>
                    </TD>
                    <TD>{w.description}</TD>
                    <TD>
                      {new Date(w.endDate).toLocaleDateString("pt-BR")}
                    </TD>
                    <TD>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </TD>
                    <TD>{w._count.claims}</TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova garantia">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ordem de serviço *</Label>
            <Select name="workOrderId" required>
              <option value="">Selecione...</option>
              {workOrders.map((wo) => (
                <option key={wo.id} value={wo.id}>
                  #{wo.number} — {wo.vehicle.plate} ({wo.customer.name})
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select name="type" required defaultValue="SERVICE">
                <option value="PART">Peça</option>
                <option value="SERVICE">Serviço</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prazo (dias)</Label>
              <Input name="days" type="number" min={1} defaultValue={90} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea name="description" required rows={3} placeholder="Descreva o que está coberto..." />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Registrar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
