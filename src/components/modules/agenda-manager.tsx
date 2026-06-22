"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X, CalendarDays, List } from "lucide-react";
import {
  createAppointment,
  updateAppointmentStatus,
} from "@/lib/actions/appointments";
import { AgendaCalendar } from "@/components/modules/agenda-calendar";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TECHNICIAN_COLUMN, TECHNICIAN_LABEL } from "@/lib/workshop-labels";
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

type Appointment = {
  id: string;
  title: string;
  scheduledAt: Date;
  status: string;
  customer: { name: string; phone: string | null };
  vehicle: { plate: string };
  employee: { name: string } | null;
  serviceBay: { name: string } | null;
};

type Option = { id: string; name: string };
type VehicleOption = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
  customerId: string;
};

const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  SCHEDULED: { label: "Agendado", variant: "info" },
  CONFIRMED: { label: "Confirmado", variant: "success" },
  IN_PROGRESS: { label: "Em andamento", variant: "warning" },
  COMPLETED: { label: "Concluído", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "danger" },
  NO_SHOW: { label: "Não compareceu", variant: "danger" },
};

export function AgendaManager({
  appointments,
  customers,
  vehicles,
  employees,
  serviceBays,
}: {
  appointments: Appointment[];
  customers: Option[];
  vehicles: VehicleOption[];
  employees: Option[];
  serviceBays: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [customerId, setCustomerId] = useState("");
  const [pending, startTransition] = useTransition();

  const filteredVehicles = customerId
    ? vehicles.filter((v) => v.customerId === customerId)
    : vehicles;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createAppointment(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-slate-200 p-1">
          <Button
            variant={view === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="h-4 w-4" /> Semana
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" /> Lista
          </Button>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo agendamento
        </Button>
      </div>

      {view === "calendar" ? (
        <AgendaCalendar appointments={appointments} />
      ) : (
      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Data/Hora</TH>
              <TH>Título</TH>
              <TH>Cliente</TH>
              <TH>Veículo</TH>
              <TH>{TECHNICIAN_COLUMN}</TH>
              <TH>Box</TH>
              <TH>Status</TH>
              <TH className="w-32">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {appointments.length === 0 ? (
              <EmptyRow colSpan={8} message="Nenhum agendamento" />
            ) : (
              appointments.map((a) => {
                const st = statusLabels[a.status] ?? { label: a.status, variant: "default" as const };
                return (
                  <TR key={a.id}>
                    <TD>
                      {new Date(a.scheduledAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TD>
                    <TD className="font-medium">{a.title}</TD>
                    <TD>
                      <div>{a.customer.name}</div>
                      <div className="text-xs text-slate-400">{a.customer.phone ?? ""}</div>
                    </TD>
                    <TD>{a.vehicle.plate}</TD>
                    <TD>{a.employee?.name ?? "—"}</TD>
                    <TD>{a.serviceBay?.name ?? "—"}</TD>
                    <TD>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </TD>
                    <TD>
                      <div className="flex gap-1">
                        {a.status === "SCHEDULED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Confirmar"
                            onClick={() =>
                              startTransition(async () => {
                                await updateAppointmentStatus(a.id, "CONFIRMED");
                                router.refresh();
                              })
                            }
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        {a.status !== "CANCELLED" && a.status !== "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Cancelar"
                            onClick={() =>
                              startTransition(async () => {
                                await updateAppointmentStatus(a.id, "CANCELLED");
                                router.refresh();
                              })
                            }
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </DataTable>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo agendamento" wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                name="customerId"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Veículo *</Label>
              <Select name="vehicleId" required>
                <option value="">Selecione...</option>
                {filteredVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} — {v.brand} {v.model}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input name="title" required placeholder="Ex: Revisão 10.000 km" />
          </div>
          <div className="space-y-2">
            <Label>Data e hora *</Label>
            <Input name="scheduledAt" type="datetime-local" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{TECHNICIAN_LABEL}</Label>
              <Select name="employeeId">
                <option value="">Nenhum</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Box / Elevador</Label>
              <Select name="serviceBayId">
                <option value="">Nenhum</option>
                {serviceBays.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Agendar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
