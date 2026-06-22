"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  addWorkOrderComplaint,
  addWorkOrderItem,
  finishWorkOrder,
  markItemExecuted,
  removeWorkOrderItem,
  updateWorkOrderDiagnosis,
  updateWorkOrderStatus,
} from "@/lib/actions/work-orders";
import { DocumentShareButtons } from "@/components/modules/document-share-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "danger" | "info" | "orange"> = {
  OPEN: "info",
  DIAGNOSIS: "warning",
  WAITING_PARTS: "orange",
  IN_PROGRESS: "info",
  QUALITY_CHECK: "warning",
  FINISHED: "success",
};

type ServiceOption = { id: string; name: string; price: unknown };
type ProductOption = { id: string; name: string; salePrice: unknown; stockQty: unknown };

type WorkOrder = {
  id: string;
  number: number;
  status: string;
  diagnosis: string | null;
  subtotal: unknown;
  discount: unknown;
  total: unknown;
  mileageIn: unknown;
  openedAt: Date;
  customer: { name: string; phone: string | null; email: string | null };
  vehicle: { plate: string; brand: string; model: string; year: number | null };
  assignedMechanic: { name: string } | null;
  items: {
    id: string;
    type: string;
    description: string;
    quantity: unknown;
    unitPrice: unknown;
    total: unknown;
    executed: boolean;
  }[];
  complaints: { id: string; description: string; resolved: boolean }[];
};

export function WorkOrderDetail({
  workOrder,
  services,
  products,
}: {
  workOrder: WorkOrder;
  services: ServiceOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [itemType, setItemType] = useState<"SERVICE" | "PART" | "OTHER">("SERVICE");
  const [diagnosis, setDiagnosis] = useState(workOrder.diagnosis ?? "");
  const [complaint, setComplaint] = useState("");

  function refresh() {
    router.refresh();
  }

  function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("workOrderId", workOrder.id);
    startTransition(async () => {
      await addWorkOrderItem(fd);
      (e.target as HTMLFormElement).reset();
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">OS #{workOrder.number}</h2>
              <p className="text-sm text-slate-500">
                Aberta em {new Date(workOrder.openedAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[workOrder.status] ?? "default"} className="text-sm">
              {STATUS_LABELS[workOrder.status] ?? workOrder.status}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Cliente</p>
              <p className="font-medium">{workOrder.customer.name}</p>
              <p className="text-sm text-slate-500">
                {workOrder.customer.phone ?? workOrder.customer.email ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Veículo</p>
              <p className="font-medium">{workOrder.vehicle.plate}</p>
              <p className="text-sm text-slate-500">
                {workOrder.vehicle.brand} {workOrder.vehicle.model}
                {workOrder.vehicle.year ? ` (${workOrder.vehicle.year})` : ""}
              </p>
              {workOrder.mileageIn ? (
                <p className="text-sm text-slate-500">{Number(workOrder.mileageIn)} km</p>
              ) : null}
            </div>
            {workOrder.assignedMechanic ? (
              <div>
                <p className="text-xs uppercase text-slate-400">Mecânico</p>
                <p className="font-medium">{workOrder.assignedMechanic.name}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase text-slate-400">Total</p>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(Number(workOrder.total))}
          </p>
          <div className="mt-2 space-y-1 text-sm text-slate-500">
            <p>Subtotal: {formatCurrency(Number(workOrder.subtotal))}</p>
            {Number(workOrder.discount) > 0 && (
              <p>Desconto: {formatCurrency(Number(workOrder.discount))}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DocumentShareButtons
          docType="OS"
          number={workOrder.number}
          customerName={workOrder.customer.name}
          customerPhone={workOrder.customer.phone}
          vehiclePlate={workOrder.vehicle.plate}
          vehicleBrand={workOrder.vehicle.brand}
          vehicleModel={workOrder.vehicle.model}
          vehicleYear={workOrder.vehicle.year}
          items={workOrder.items}
          total={Number(workOrder.total)}
          complaint={workOrder.complaints[0]?.description}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending || workOrder.status === "DIAGNOSIS"}
          onClick={() =>
            startTransition(async () => {
              await updateWorkOrderStatus(workOrder.id, "DIAGNOSIS");
              refresh();
            })
          }
        >
          Diagnóstico
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending || workOrder.status === "IN_PROGRESS"}
          onClick={() =>
            startTransition(async () => {
              await updateWorkOrderStatus(workOrder.id, "IN_PROGRESS");
              refresh();
            })
          }
        >
          Em execução
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending || workOrder.status === "WAITING_PARTS"}
          onClick={() =>
            startTransition(async () => {
              await updateWorkOrderStatus(workOrder.id, "WAITING_PARTS");
              refresh();
            })
          }
        >
          Aguard. peças
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={pending || workOrder.status === "FINISHED"}
          onClick={() =>
            startTransition(async () => {
              await finishWorkOrder(workOrder.id);
              refresh();
            })
          }
        >
          Finalizar OS
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Itens da OS</h3>
        <form onSubmit={addItem} className="mb-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select
              name="type"
              value={itemType}
              onChange={(e) => setItemType(e.target.value as "SERVICE" | "PART" | "OTHER")}
              className="w-40"
            >
              <option value="SERVICE">Serviço</option>
              <option value="PART">Peça</option>
              <option value="OTHER">Terceiro / outro</option>
            </Select>
          </div>
          {itemType === "OTHER" ? (
            <>
              <div className="min-w-[200px] flex-1 space-y-1">
                <Label>Descrição</Label>
                <Input name="customDescription" required placeholder="Funilaria, guincho..." />
              </div>
              <div className="space-y-1">
                <Label>Valor (R$)</Label>
                <Input name="customPrice" type="number" min={0.01} step="0.01" required className="w-28" />
              </div>
            </>
          ) : (
            <div className="min-w-[200px] flex-1 space-y-1">
              <Label>{itemType === "SERVICE" ? "Serviço" : "Peça"}</Label>
              <Select name="refId" required className="w-full">
                <option value="">Selecione</option>
                {itemType === "SERVICE"
                  ? services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatCurrency(Number(s.price))}
                      </option>
                    ))
                  : products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(Number(p.salePrice))} (est: {Number(p.stockQty)})
                      </option>
                    ))}
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>Qtd</Label>
            <Input name="quantity" type="number" min={1} step={1} defaultValue={1} className="w-20" />
          </div>
          <Button type="submit" disabled={pending}>
            Adicionar
          </Button>
        </form>

        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Tipo</TH>
                <TH>Descrição</TH>
                <TH>Qtd</TH>
                <TH>Unitário</TH>
                <TH>Total</TH>
                <TH>Executado</TH>
                <TH className="w-12">&nbsp;</TH>
              </TR>
            </THead>
            <TBody>
              {workOrder.items.length === 0 ? (
                <EmptyRow colSpan={7} message="Nenhum item adicionado" />
              ) : (
                workOrder.items.map((item) => (
                  <TR key={item.id}>
                    <TD>
                      <Badge
                        variant={
                          item.type === "SERVICE"
                            ? "info"
                            : item.type === "OTHER"
                              ? "orange"
                              : "default"
                        }
                      >
                        {item.type === "SERVICE"
                          ? "Serviço"
                          : item.type === "OTHER"
                            ? "Terceiro"
                            : "Peça"}
                      </Badge>
                    </TD>
                    <TD>{item.description}</TD>
                    <TD>{Number(item.quantity)}</TD>
                    <TD>{formatCurrency(Number(item.unitPrice))}</TD>
                    <TD>{formatCurrency(Number(item.total))}</TD>
                    <TD>
                      {item.type === "PART" ? (
                        <input
                          type="checkbox"
                          checked={item.executed}
                          disabled={pending}
                          onChange={(e) =>
                            startTransition(async () => {
                              await markItemExecuted(item.id, workOrder.id, e.target.checked);
                              refresh();
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      ) : (
                        "—"
                      )}
                    </TD>
                    <TD>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await removeWorkOrderItem(item.id, workOrder.id);
                            refresh();
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </DataTable>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold">Reclamações</h3>
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!complaint.trim()) return;
              startTransition(async () => {
                await addWorkOrderComplaint(workOrder.id, complaint.trim());
                setComplaint("");
                refresh();
              });
            }}
          >
            <Input
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Nova reclamação..."
              className="flex-1"
            />
            <Button type="submit" disabled={pending || !complaint.trim()}>
              Adicionar
            </Button>
          </form>
          {workOrder.complaints.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma reclamação registrada</p>
          ) : (
            <ul className="space-y-2">
              {workOrder.complaints.map((c) => (
                <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  {c.description}
                  {c.resolved && (
                    <Badge variant="success" className="ml-2">
                      Resolvida
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold">Diagnóstico técnico</h3>
          <Textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            rows={5}
            placeholder="Laudo técnico e diagnóstico..."
          />
          <Button
            className="mt-3"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await updateWorkOrderDiagnosis(workOrder.id, diagnosis);
                refresh();
              })
            }
          >
            Salvar diagnóstico
          </Button>
        </div>
      </div>
    </div>
  );
}
