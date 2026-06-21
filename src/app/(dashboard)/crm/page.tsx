import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
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
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/session";

export default async function CrmPage() {
  const tenantId = await requireTenantId();

  const [reminders, pendingCount] = await Promise.all([
    prisma.maintenanceReminder.findMany({
      where: { tenantId, completed: false },
      include: { vehicle: { select: { plate: true, brand: true, model: true } } },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    prisma.maintenanceReminder.count({
      where: { tenantId, completed: false },
    }),
  ]);

  return (
    <>
      <Header
        title="Metas & CRM"
        description={`${pendingCount} lembrete(s) de manutenção pendente(s)`}
      />
      <div className="space-y-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lembretes de revisão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-3xl font-bold text-orange-600">{pendingCount}</p>
            <p className="text-sm text-slate-500">
              Clientes com manutenção programada por km ou tempo
            </p>
          </CardContent>
        </Card>

        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Veículo</TH>
                <TH>Título</TH>
                <TH>Tipo</TH>
                <TH>Vencimento</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {reminders.length === 0 ? (
                <EmptyRow colSpan={5} message="Nenhum lembrete pendente" />
              ) : (
                reminders.map((r) => (
                  <TR key={r.id}>
                    <TD>
                      {r.vehicle.plate} — {r.vehicle.brand} {r.vehicle.model}
                    </TD>
                    <TD>{r.title}</TD>
                    <TD>{r.type}</TD>
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
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </DataTable>
      </div>
    </>
  );
}
