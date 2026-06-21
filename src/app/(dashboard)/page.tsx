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
import { RevenueChart, ServicesChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { extraFeatures } from "@/config/modules";
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
    },
    {
      title: "OS abertas",
      value: String(stats.openOrders),
      change: `${stats.pendingQuotes} orçamento(s) pendente(s)`,
      icon: ClipboardList,
    },
    {
      title: "Veículos atendidos hoje",
      value: String(stats.vehiclesToday),
      change: "Entradas na oficina",
      icon: Car,
    },
    {
      title: "Ticket médio",
      value: formatCurrency(stats.ticketMedio),
      change: "Média do mês",
      icon: TrendingUp,
    },
  ];

  const alerts = [
    stats.lowStockCount > 0 && {
      text: `${stats.lowStockCount} peça(s) abaixo do estoque mínimo`,
      variant: "warning" as const,
    },
    stats.pendingQuotes > 0 && {
      text: `${stats.pendingQuotes} orçamento(s) aguardando aprovação`,
      variant: "info" as const,
    },
    stats.overdueReceivables > 0 && {
      text: `${stats.overdueReceivables} conta(s) a receber em aberto`,
      variant: "danger" as const,
    },
  ].filter(Boolean) as { text: string; variant: "warning" | "info" | "danger" }[];

  const maxHours = Math.max(...stats.productivity.map((m) => m.hours), 1);

  return (
    <>
      <Header
        title="Painel Gerencial"
        description="Visão em tempo real da operação da oficina"
      />

      <div className="space-y-8 p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
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
            );
          })}
        </div>

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
                  <div
                    key={alert.text}
                    className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 p-3"
                  >
                    <p className="text-sm text-slate-700">{alert.text}</p>
                    <Badge variant={alert.variant}>!</Badge>
                  </div>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Diferenciais SAASMecanica</CardTitle>
                <CardDescription>
                  Funcionalidades além da sua lista — inspiradas nos melhores sistemas do mercado
                </CardDescription>
              </div>
              <Badge variant="orange">+19 extras</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {extraFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-orange-600" />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Clientes ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.customers}</p>
              <p className="text-sm text-slate-500">Cadastrados na oficina</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Orçamentos pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pendingQuotes}</p>
              <p className="text-sm text-slate-500">Aguardando resposta</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">OS finalizadas hoje</CardTitle>
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
