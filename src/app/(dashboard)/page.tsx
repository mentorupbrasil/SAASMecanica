import Link from "next/link";
import {
  ArrowUpRight,
  Car,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { OperationsPanel } from "@/components/dashboard/operations-panel";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AttendanceGuide } from "@/components/dashboard/attendance-guide";
import { RevenueChart, ServicesChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      title: "Faturamento do mês",
      value: formatCurrency(stats.monthRevenue),
      change: `${stats.todayFinished} OS finalizada(s) hoje`,
      icon: DollarSign,
      href: "/relatorios",
    },
    {
      title: "OS abertas",
      value: String(stats.openOrders),
      change: `${stats.pendingQuotes} orçamento(s) pendente(s)`,
      icon: ClipboardList,
      href: "/kanban",
    },
    {
      title: "Veículos atendidos hoje",
      value: String(stats.vehiclesToday),
      change: "Entradas na oficina",
      icon: Car,
      href: "/ordens",
    },
    {
      title: "Ticket médio",
      value: formatCurrency(stats.ticketMedio),
      change: "Média do mês",
      icon: TrendingUp,
      href: "/relatorios",
    },
  ];

  const alerts = [
    stats.lowStockCount > 0 && {
      text: `${stats.lowStockCount} peça(s) abaixo do estoque mínimo`,
      variant: "warning" as const,
      href: "/estoque",
    },
    stats.pendingQuotes > 0 && {
      text: `${stats.pendingQuotes} orçamento(s) aguardando aprovação`,
      variant: "info" as const,
      href: "/orcamentos",
    },
    stats.overdueReceivables > 0 && {
      text: `${stats.overdueReceivables} conta(s) a receber em aberto`,
      variant: "danger" as const,
      href: "/financeiro",
    },
  ].filter(Boolean) as { text: string; variant: "warning" | "info" | "danger"; href: string }[];

  const maxHours = Math.max(...stats.productivity.map((m) => m.hours), 1);

  return (
    <>
      <Header
        title="Painel Gerencial"
        description="Visão em tempo real da operação da oficina"
        action={
          <Link href="/ordens/nova">
            <Button>Nova OS</Button>
          </Link>
        }
      />

      <div className="space-y-8 p-8">
        <QuickActions />

        <AttendanceGuide />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link key={kpi.title} href={kpi.href}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription>{kpi.title}</CardDescription>
                    <div className="rounded-lg bg-orange-50 p-2">
                      <Icon className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{kpi.change}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <OperationsPanel
          activeOrders={stats.activeOrders}
          todayAppointments={stats.todayAppointments}
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Faturamento da semana</CardTitle>
              <CardDescription>Receita diária consolidada</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <RevenueChart data={stats.revenueByDay} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>Ações prioritárias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum alerta no momento</p>
              ) : (
                alerts.map((alert) => (
                  <Link
                    key={alert.text}
                    href={alert.href}
                    className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 p-3 transition-colors hover:border-orange-200 hover:bg-orange-50/30"
                  >
                    <p className="text-sm text-slate-700">{alert.text}</p>
                    <Badge variant={alert.variant}>!</Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Serviços mais vendidos</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ServicesChart data={stats.topServices} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtividade dos mecânicos</CardTitle>
              <CardDescription>Horas estimadas e OS do mês</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.productivity.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum dado de produtividade</p>
              ) : (
                <div className="space-y-4">
                  {stats.productivity.map((m) => (
                    <div key={m.name} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Wrench className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.os} OS</p>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${(m.hours / maxHours) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-600">{m.hours}h</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Users className="mb-2 h-5 w-5 text-orange-600" />
                <CardTitle className="text-base">Clientes ativos</CardTitle>
              </div>
              <Link href="/clientes">
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.customers}</p>
              <p className="text-sm text-slate-500">Cadastrados na oficina</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <ClipboardList className="mb-2 h-5 w-5 text-orange-600" />
                <CardTitle className="text-base">Orçamentos pendentes</CardTitle>
              </div>
              <Link href="/orcamentos">
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pendingQuotes}</p>
              <p className="text-sm text-slate-500">Aguardando resposta</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <TrendingUp className="mb-2 h-5 w-5 text-orange-600" />
                <CardTitle className="text-base">OS finalizadas hoje</CardTitle>
              </div>
              <Link href="/ordens">
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.todayFinished}</p>
              <p className="text-sm text-slate-500">Concluídas no dia</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
