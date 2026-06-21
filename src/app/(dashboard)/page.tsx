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
import { formatCurrency } from "@/lib/utils";

const kpis = [
  {
    title: "Faturamento hoje",
    value: formatCurrency(4280),
    change: "+12%",
    icon: DollarSign,
  },
  {
    title: "OS abertas",
    value: "14",
    change: "3 aguardando peças",
    icon: ClipboardList,
  },
  {
    title: "Veículos atendidos",
    value: "8",
    change: "Meta: 12/dia",
    icon: Car,
  },
  {
    title: "Ticket médio",
    value: formatCurrency(685),
    change: "+8% vs mês anterior",
    icon: TrendingUp,
  },
];

const mechanicProductivity = [
  { name: "Carlos", hours: 38, os: 12 },
  { name: "Rafael", hours: 42, os: 15 },
  { name: "João", hours: 35, os: 10 },
  { name: "Pedro", hours: 40, os: 13 },
];

export default function DashboardPage() {
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
              <RevenueChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>Ações prioritárias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { text: "5 peças abaixo do estoque mínimo", variant: "warning" as const },
                { text: "3 orçamentos aguardando aprovação", variant: "info" as const },
                { text: "2 garantias vencem esta semana", variant: "danger" as const },
                { text: "R$ 2.400 em contas vencidas", variant: "danger" as const },
              ].map((alert) => (
                <div
                  key={alert.text}
                  className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 p-3"
                >
                  <p className="text-sm text-slate-700">{alert.text}</p>
                  <Badge variant={alert.variant}>!</Badge>
                </div>
              ))}
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
              <ServicesChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtividade dos mecânicos</CardTitle>
              <CardDescription>Horas trabalhadas e OS concluídas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mechanicProductivity.map((m) => (
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
                          style={{ width: `${(m.hours / 45) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600">{m.hours}h</span>
                  </div>
                ))}
              </div>
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
              <p className="text-3xl font-bold">248</p>
              <p className="text-sm text-slate-500">+18 este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Taxa conversão orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">72%</p>
              <p className="text-sm text-slate-500">Média mercado: 55%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Margem média OS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">34%</p>
              <p className="text-sm text-slate-500">Peças + mão de obra</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
