import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview, updateTenantSettings } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/session";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, ClipboardList, Car, ShieldCheck } from "lucide-react";

export default async function AdminPage() {
  await requireAdmin();
  const { tenant, usersCount, activeUsers, recentLogs } = await getAdminOverview();

  async function saveSettings(formData: FormData) {
    "use server";
    await updateTenantSettings(formData);
  }

  return (
    <>
      <Header
        title="Painel Administrativo"
        description="Configurações da oficina, usuários e auditoria"
      />

      <div className="space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Identificador de login</CardDescription>
              <CardTitle className="text-2xl">{tenant?.slug}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="orange">Usado no login</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Usuários</CardDescription>
              <CardTitle className="text-2xl">{usersCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">{activeUsers} ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Clientes</CardDescription>
              <CardTitle className="text-2xl">{tenant?._count.customers ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ordens de serviço</CardDescription>
              <CardTitle className="text-2xl">{tenant?._count.workOrders ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                Dados da oficina
              </CardTitle>
              <CardDescription>Nome e contatos exibidos no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da oficina</Label>
                  <Input name="name" defaultValue={tenant?.name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input name="email" type="email" defaultValue={tenant?.email ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input name="phone" defaultValue={tenant?.phone ?? ""} />
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Plano: <strong>{tenant?.plan ?? "STARTER"}</strong>
                </div>
                <Button type="submit">Salvar configurações</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acesso rápido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link
                href="/admin/usuarios"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Gerenciar usuários</p>
                  <p className="text-sm text-slate-500">Criar, editar perfis e desativar acessos</p>
                </div>
              </Link>
              <Link
                href="/clientes"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <Car className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Cadastros</p>
                  <p className="text-sm text-slate-500">Clientes, veículos e equipe</p>
                </div>
              </Link>
              <Link
                href="/relatorios"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <ClipboardList className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Relatórios</p>
                  <p className="text-sm text-slate-500">Faturamento e produtividade</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria recente</CardTitle>
            <CardDescription>Últimas ações registradas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum registro ainda.</p>
            ) : (
              <ul className="space-y-2">
                {recentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span>
                      <strong>{log.action}</strong>
                      {log.user?.name ? ` — ${log.user.name}` : ""}
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
