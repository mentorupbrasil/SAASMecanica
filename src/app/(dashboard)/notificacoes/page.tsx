import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
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

const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" }> = {
  PENDING: { label: "Pendente", variant: "warning" },
  SENT: { label: "Enviada", variant: "success" },
  FAILED: { label: "Falhou", variant: "danger" },
};

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  SMS: "SMS",
};

export default async function NotificacoesPage() {
  const tenantId = await requireTenantId();

  const notifications = await prisma.notification.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <Header
        title="Notificações"
        description={`${notifications.length} notificação(ões) recente(s)`}
      />
      <div className="p-8">
        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Data</TH>
                <TH>Canal</TH>
                <TH>Destinatário</TH>
                <TH>Assunto</TH>
                <TH>Mensagem</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {notifications.length === 0 ? (
                <EmptyRow colSpan={6} message="Nenhuma notificação registrada" />
              ) : (
                notifications.map((n) => {
                  const st = statusLabels[n.status] ?? {
                    label: n.status,
                    variant: "default" as const,
                  };
                  return (
                    <TR key={n.id}>
                      <TD>
                        {new Date(n.createdAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TD>
                      <TD>{channelLabels[n.channel] ?? n.channel}</TD>
                      <TD>{n.recipient}</TD>
                      <TD>{n.subject ?? "—"}</TD>
                      <TD className="max-w-xs truncate">{n.body}</TD>
                      <TD>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </DataTable>
      </div>
    </>
  );
}
