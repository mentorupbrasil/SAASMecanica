import {
  BarChart3,
  ClipboardList,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { ProfitTrendChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReports } from "@/lib/actions/dashboard";
import { formatCurrency, statusLabel } from "@/lib/utils";

export default async function RelatoriosPage() {
  const reports = await getReports();

  const cards = [
    {
      title: "Receitas",
      value: formatCurrency(reports.income),
      subtitle: `${reports.incomeGrowth >= 0 ? "+" : ""}${reports.incomeGrowth.toFixed(1)}% vs mês anterior`,
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Despesas",
      value: formatCurrency(reports.expense),
      subtitle: "Saídas no mês",
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Lucro líquido",
      value: formatCurrency(reports.profit),
      subtitle: `Margem ${reports.margin.toFixed(1)}%`,
      icon: BarChart3,
      color: reports.profit >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      title: "Ordens de serviço",
      value: String(reports.orders),
      subtitle: "Abertas no mês",
      icon: ClipboardList,
    },
    {
      title: "Receita serviços",
      value: formatCurrency(reports.servicesRevenue),
      subtitle: `${reports.servicesCount} serviço(s)`,
      icon: Wrench,
    },
    {
      title: "Receita peças",
      value: formatCurrency(reports.partsRevenue),
      subtitle: "Vendas de produtos",
      icon: Package,
    },
    {
      title: "Clientes ativos",
      value: String(reports.customers),
      subtitle: "Cadastrados",
      icon: Users,
    },
  ];

  return (
    <>
      <Header
        title="Relatórios Gerenciais"
        description="DRE simplificado e indicadores do mês — padrão UltraCar / Oficina Integrada"
      />

      <div className="space-y-8 p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.slice(0, 4).map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${card.color ?? ""}`}>{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolução financeira</CardTitle>
              <CardDescription>Receitas e despesas — últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ProfitTrendChart data={reports.monthlyTrend.slice(-6)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DRE do mês</CardTitle>
              <CardDescription>Demonstrativo simplificado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Receita de serviços</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(reports.servicesRevenue)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Receita de peças</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(reports.partsRevenue)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-800">Receita total</span>
                <span className="font-bold">{formatCurrency(reports.income)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Despesas</span>
                <span className="font-semibold text-red-600">
                  − {formatCurrency(reports.expense)}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-900">Lucro</span>
                <span className={`text-lg font-bold ${reports.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(reports.profit)}
                </span>
              </div>
              {reports.incomeGrowth !== 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  {reports.incomeGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-xs text-slate-600">
                    {reports.incomeGrowth >= 0 ? "Crescimento" : "Queda"} de{" "}
                    {Math.abs(reports.incomeGrowth).toFixed(1)}% na receita
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>OS por status (mês)</CardTitle>
            <CardDescription>Distribuição operacional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {reports.statusBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma OS no período</p>
              ) : (
                reports.statusBreakdown.map((s) => (
                  <div
                    key={s.status}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2"
                  >
                    <Badge variant="default">{s.count}</Badge>
                    <span className="text-sm text-slate-700">{statusLabel(s.status)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.slice(4).map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${card.color ?? ""}`}>{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
