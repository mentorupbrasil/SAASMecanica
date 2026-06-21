"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { updateWorkOrderStatus } from "@/lib/actions/work-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { status: "OPEN", label: "Aberta", color: "border-blue-200 bg-blue-50" },
  { status: "DIAGNOSIS", label: "Diagnóstico", color: "border-amber-200 bg-amber-50" },
  { status: "WAITING_PARTS", label: "Aguard. peças", color: "border-orange-200 bg-orange-50" },
  { status: "IN_PROGRESS", label: "Em execução", color: "border-indigo-200 bg-indigo-50" },
  { status: "QUALITY_CHECK", label: "Controle qualidade", color: "border-purple-200 bg-purple-50" },
  { status: "FINISHED", label: "Finalizada", color: "border-emerald-200 bg-emerald-50" },
] as const;

const NEXT_STATUS: Record<string, string> = {
  OPEN: "DIAGNOSIS",
  DIAGNOSIS: "IN_PROGRESS",
  WAITING_PARTS: "IN_PROGRESS",
  IN_PROGRESS: "QUALITY_CHECK",
  QUALITY_CHECK: "FINISHED",
};

type WorkOrder = {
  id: string;
  number: number;
  status: string;
  customer: { name: string };
  vehicle: { plate: string };
  assignedMechanic: { name: string } | null;
};

export function KanbanBoard({ workOrders }: { workOrders: WorkOrder[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function moveNext(id: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    startTransition(async () => {
      await updateWorkOrderStatus(id, next);
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
            className={`min-w-[240px] flex-1 rounded-xl border-2 ${col.color} p-3`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <Badge variant="default">{cards.length}</Badge>
            </div>

            <div className="space-y-2">
              {cards.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Vazio</p>
              ) : (
                cards.map((wo) => (
                  <div
                    key={wo.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <Link
                      href={`/ordens/${wo.id}`}
                      className="font-medium text-orange-600 hover:underline"
                    >
                      OS #{wo.number}
                    </Link>
                    <p className="mt-1 text-sm font-medium">{wo.vehicle.plate}</p>
                    <p className="text-xs text-slate-500">{wo.customer.name}</p>
                    {wo.assignedMechanic && (
                      <p className="mt-1 text-xs text-slate-400">{wo.assignedMechanic.name}</p>
                    )}
                    {NEXT_STATUS[wo.status] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full justify-between"
                        disabled={pending}
                        onClick={() => moveNext(wo.id, wo.status)}
                      >
                        Avançar
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
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
