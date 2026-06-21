"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Aberta",
  DIAGNOSIS: "Diagnóstico",
  WAITING_APPROVAL: "Aguard. aprovação",
  WAITING_PARTS: "Aguard. peças",
  IN_PROGRESS: "Em execução",
  QUALITY_CHECK: "Controle qualidade",
  FINISHED: "Finalizada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
  DRAFT: "Rascunho",
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "danger" | "info" | "orange"> = {
  OPEN: "info",
  DIAGNOSIS: "warning",
  WAITING_APPROVAL: "orange",
  WAITING_PARTS: "orange",
  IN_PROGRESS: "info",
  QUALITY_CHECK: "warning",
  FINISHED: "success",
  DELIVERED: "success",
  CANCELLED: "danger",
};

type WorkOrder = {
  id: string;
  number: number;
  status: string;
  openedAt: Date;
  total: unknown;
  customer: { name: string; phone: string | null };
  vehicle: { plate: string; brand: string; model: string };
  assignedMechanic: { name: string } | null;
  _count: { items: number };
};

export function WorkOrdersList({ workOrders }: { workOrders: WorkOrder[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "ALL";

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete("status");
    else params.set("status", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-48"
        >
          <option value="ALL">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Link href="/ordens/nova">
          <Button>
            <Plus className="h-4 w-4" /> Nova OS
          </Button>
        </Link>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Nº</TH>
              <TH>Cliente</TH>
              <TH>Veículo</TH>
              <TH>Status</TH>
              <TH>Mecânico</TH>
              <TH>Itens</TH>
              <TH>Total</TH>
              <TH>Aberta em</TH>
            </TR>
          </THead>
          <TBody>
            {workOrders.length === 0 ? (
              <EmptyRow colSpan={8} message="Nenhuma ordem de serviço encontrada" />
            ) : (
              workOrders.map((wo) => (
                <TR key={wo.id}>
                  <TD>
                    <Link
                      href={`/ordens/${wo.id}`}
                      className="font-medium text-orange-600 hover:underline"
                    >
                      #{wo.number}
                    </Link>
                  </TD>
                  <TD>
                    <div className="font-medium">{wo.customer.name}</div>
                    <div className="text-xs text-slate-400">{wo.customer.phone ?? ""}</div>
                  </TD>
                  <TD>
                    <div>{wo.vehicle.plate}</div>
                    <div className="text-xs text-slate-400">
                      {wo.vehicle.brand} {wo.vehicle.model}
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={STATUS_VARIANTS[wo.status] ?? "default"}>
                      {STATUS_LABELS[wo.status] ?? wo.status}
                    </Badge>
                  </TD>
                  <TD>{wo.assignedMechanic?.name ?? "—"}</TD>
                  <TD>{wo._count.items}</TD>
                  <TD>{formatCurrency(Number(wo.total))}</TD>
                  <TD>{new Date(wo.openedAt).toLocaleDateString("pt-BR")}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </DataTable>
    </>
  );
}
