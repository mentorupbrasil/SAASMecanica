import Link from "next/link";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, statusLabel } from "@/lib/utils";

type ActiveOrder = {
  id: string;
  number: number;
  status: string;
  total: number;
  customer: string;
  plate: string;
  vehicle: string;
  mechanic: string | null;
  openedAt: string;
};

type TodayAppointment = {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  customer: string;
  phone: string | null;
  plate: string;
  mechanic: string | null;
};

const statusVariant: Record<string, "default" | "info" | "warning" | "success" | "danger"> = {
  OPEN: "info",
  DIAGNOSIS: "warning",
  WAITING_APPROVAL: "warning",
  WAITING_PARTS: "warning",
  IN_PROGRESS: "default",
  QUALITY_CHECK: "info",
  FINISHED: "success",
};

export function OperationsPanel({
  activeOrders,
  todayAppointments,
}: {
  activeOrders: ActiveOrder[];
  todayAppointments: TodayAppointment[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">OS em andamento</CardTitle>
            <CardDescription>Veículos na oficina agora</CardDescription>
          </div>
          <Link href="/kanban" className="text-sm font-medium text-orange-600 hover:underline">
            Ver Kanban
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Nenhuma OS ativa</p>
          ) : (
            activeOrders.map((o) => (
              <Link
                key={o.id}
                href={`/ordens/${o.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:border-orange-200 hover:bg-orange-50/30"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-900 text-white">
                  <span className="text-[10px] font-medium opacity-70">OS</span>
                  <span className="text-xs font-bold">{o.number}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{o.plate}</p>
                    <Badge variant={statusVariant[o.status] ?? "default"}>
                      {statusLabel(o.status)}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-slate-600">{o.customer}</p>
                  <p className="text-xs text-slate-400">
                    {o.mechanic ? `${o.mechanic} · ` : ""}
                    {formatCurrency(o.total)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Agenda de hoje</CardTitle>
            <CardDescription>{todayAppointments.length} agendamento(s)</CardDescription>
          </div>
          <Link href="/agenda" className="text-sm font-medium text-orange-600 hover:underline">
            Ver agenda
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayAppointments.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Nenhum agendamento hoje</p>
            </div>
          ) : (
            todayAppointments.map((a) => {
              const time = new Date(a.scheduledAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{time}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-600">
                      {a.plate} · {a.customer}
                    </p>
                    {a.mechanic && (
                      <p className="text-xs text-slate-400">{a.mechanic}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
