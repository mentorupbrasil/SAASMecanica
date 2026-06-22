"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { updateWorkOrderStatus } from "@/lib/actions/work-orders";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, statusLabel } from "@/lib/utils";

const COLUMNS = [
  { status: "OPEN", label: "Aberta", color: "border-blue-200 bg-blue-50/80" },
  { status: "DIAGNOSIS", label: "Diagnóstico", color: "border-amber-200 bg-amber-50/80" },
  { status: "WAITING_APPROVAL", label: "Aguard. aprovação", color: "border-yellow-200 bg-yellow-50/80" },
  { status: "WAITING_PARTS", label: "Aguard. peças", color: "border-orange-200 bg-orange-50/80" },
  { status: "IN_PROGRESS", label: "Em execução", color: "border-indigo-200 bg-indigo-50/80" },
  { status: "QUALITY_CHECK", label: "Controle qualidade", color: "border-purple-200 bg-purple-50/80" },
  { status: "FINISHED", label: "Finalizada", color: "border-emerald-200 bg-emerald-50/80" },
] as const;

type WorkOrder = {
  id: string;
  number: number;
  status: string;
  total: number;
  customer: { name: string };
  vehicle: { plate: string };
  assignedMechanic: { name: string } | null;
};

export function KanbanBoard({ workOrders }: { workOrders: WorkOrder[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDrop(targetStatus: string, workOrderId: string) {
    startTransition(async () => {
      await updateWorkOrderStatus(workOrderId, targetStatus);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const cards = workOrders.filter((wo) => wo.status === col.status);
        return (
          <div
            key={col.status}
            className={`min-w-[260px] flex-1 rounded-xl border-2 ${col.color} p-3`}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("ring-2", "ring-orange-300");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("ring-2", "ring-orange-300");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("ring-2", "ring-orange-300");
              const id = e.dataTransfer.getData("workOrderId");
              if (id) handleDrop(col.status, id);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <Badge variant="default">{cards.length}</Badge>
            </div>

            <div className="space-y-2 min-h-[120px]">
              {cards.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  Arraste OS aqui
                </p>
              ) : (
                cards.map((wo) => (
                  <div
                    key={wo.id}
                    draggable={!pending}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("workOrderId", wo.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="cursor-grab rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/ordens/${wo.id}`}
                            className="font-semibold text-orange-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            OS #{wo.number}
                          </Link>
                          <span className="text-xs font-medium text-slate-600">
                            {formatCurrency(wo.total)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-800">{wo.vehicle.plate}</p>
                        <p className="truncate text-xs text-slate-500">{wo.customer.name}</p>
                        {wo.assignedMechanic && (
                          <p className="mt-1 text-xs text-slate-400">{wo.assignedMechanic.name}</p>
                        )}
                        <p className="mt-2 text-[10px] text-slate-400">
                          {statusLabel(wo.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
