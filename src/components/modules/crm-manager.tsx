"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, Plus } from "lucide-react";
import {
  completeReminder,
  createMaintenanceReminder,
  logWhatsAppNotification,
  markReminderSent,
} from "@/lib/actions/crm";
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
import { whatsappLink } from "@/lib/utils";

type Reminder = {
  id: string;
  title: string;
  type: string;
  dueDate: Date | null;
  dueMileage: number | null;
  sentAt: Date | null;
  vehicle: {
    plate: string;
    brand: string | null;
    model: string | null;
    customer: { name: string; phone: string | null };
  };
};

type VehicleOption = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
};

export function CrmManager({
  reminders,
  vehicles,
}: {
  reminders: Reminder[];
  vehicles: VehicleOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const overdue = reminders.filter(
    (r) => r.dueDate && new Date(r.dueDate) < new Date() && !r.sentAt,
  ).length;

  function sendWhatsApp(r: Reminder) {
    const phone = r.vehicle.customer.phone;
    if (!phone) return;

    const message = `Olá ${r.vehicle.customer.name}! Lembrete da oficina: ${r.title} para o veículo ${r.vehicle.plate}. Entre em contato para agendar.`;
    const link = whatsappLink(phone, message);
    if (!link) return;

    startTransition(async () => {
      await markReminderSent(r.id);
      await logWhatsAppNotification(phone, message);
      window.open(link, "_blank");
      router.refresh();
    });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createMaintenanceReminder(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Lembretes pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{reminders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Enviados este mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">
              {reminders.filter((r) => r.sentAt).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo lembrete
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Veículo</TH>
              <TH>Cliente</TH>
              <TH>Lembrete</TH>
              <TH>Vencimento</TH>
              <TH>Status</TH>
              <TH className="w-40">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {reminders.length === 0 ? (
              <EmptyRow colSpan={6} message="Nenhum lembrete cadastrado" />
            ) : (
              reminders.map((r) => (
                <TR key={r.id}>
                  <TD className="font-medium">
                    {r.vehicle.plate} — {r.vehicle.brand} {r.vehicle.model}
                  </TD>
                  <TD>{r.vehicle.customer.name}</TD>
                  <TD>{r.title}</TD>
                  <TD>
                    {r.dueDate
                      ? new Date(r.dueDate).toLocaleDateString("pt-BR")
                      : r.dueMileage
                        ? `${r.dueMileage.toLocaleString("pt-BR")} km`
                        : "—"}
                  </TD>
                  <TD>
                    <Badge variant={r.sentAt ? "success" : "warning"}>
                      {r.sentAt ? "Enviado" : "Pendente"}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      {r.vehicle.customer.phone && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Enviar WhatsApp"
                          disabled={pending}
                          onClick={() => sendWhatsApp(r)}
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Concluir"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await completeReminder(r.id);
                            router.refresh();
                          })
                        }
                      >
                        <Check className="h-4 w-4 text-slate-600" />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo lembrete de revisão">
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
            <Label>Título *</Label>
            <Input name="title" required placeholder="Ex: Troca de óleo 10.000 km" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select name="type" defaultValue="TIME">
                <option value="TIME">Por data</option>
                <option value="KM">Por quilometragem</option>
                <option value="SERVICE">Por serviço</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data prevista</Label>
              <Input name="dueDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quilometragem prevista</Label>
            <Input name="dueMileage" type="number" placeholder="Ex: 50000" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Cadastrar lembrete"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
