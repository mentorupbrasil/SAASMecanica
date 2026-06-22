"use client";

import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Appointment = {
  id: string;
  title: string;
  scheduledAt: Date | string;
  status: string;
  customer: { name: string };
  vehicle: { plate: string };
  employee: { name: string } | null;
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
};

export function AgendaCalendar({ appointments }: { appointments: Appointment[] }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
          <div className="p-3 text-xs font-semibold text-slate-500">Horário</div>
          {days.map((day) => {
            const today = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "border-l border-slate-200 p-3 text-center",
                  today && "bg-orange-50",
                )}
              >
                <p className="text-xs font-medium uppercase text-slate-500">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <p className={cn("text-lg font-bold", today ? "text-orange-600" : "text-slate-900")}>
                  {format(day, "dd")}
                </p>
              </div>
            );
          })}
        </div>

        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-slate-100 last:border-0">
            <div className="flex items-start p-2 text-xs text-slate-400">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const slotAppointments = appointments.filter((a) => {
                const d = new Date(a.scheduledAt);
                return isSameDay(d, day) && d.getHours() === hour;
              });

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="min-h-[52px] border-l border-slate-100 p-1"
                >
                  {slotAppointments.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        "mb-1 rounded-md border px-2 py-1 text-[10px] leading-tight",
                        statusColors[a.status] ?? "bg-slate-100 text-slate-700 border-slate-200",
                      )}
                    >
                      <p className="font-semibold truncate">{a.title}</p>
                      <p className="truncate opacity-80">{a.vehicle.plate}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-slate-200 px-4 py-3">
        <Badge variant="info">Agendado</Badge>
        <Badge variant="success">Confirmado</Badge>
        <Badge variant="warning">Em andamento</Badge>
      </div>
    </div>
  );
}
