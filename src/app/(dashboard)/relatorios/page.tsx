import {
  BarChart3,
  ClipboardList,
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReports } from "@/lib/actions/dashboard";
import { formatCurrency } from "@/lib/utils";

export default async function RelatoriosPage() {
  const reports = await getReports();

  const cards = [
    {
      title: "Ordens de serviço",
      value: String(reports.orders),
      subtitle: "Abertas no mês",
      icon: ClipboardList,
    },
    {
      title: "Receitas",
      value: formatCurrency(reports.income),
      subtitle: "Entradas no mês",
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Despesas",
      value: formatCurrency(reports.expense),
      subtitle: "Saídas no mês",
      icon: TrendingUp,
      color: "text-red-600",
    },
    {
      title: "Lucro",
      value: formatCurrency(reports.profit),
      subtitle: "Receitas − despesas",
      icon: BarChart3,
      color: reports.profit >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      title: "Produtos ativos",
      value: String(reports.products),
      subtitle: "No estoque",
      icon: Package,
    },
    {
      title: "Clientes ativos",
      value: String(reports.customers),
      subtitle: "Cadastrados",
      icon: Users,
    },
    {
      title: "Serviços realizados",
      value: String(reports.servicesCount),
      subtitle: formatCurrency(reports.servicesRevenue) + " em receita",
      icon: Wrench,
    },
  ];

  return (
    <>
      <Header
        title="Relatórios"
        description="Análises gerenciais do mês atual"
      />
      <div className="grid gap-4 p-8 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
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
    </>
  );
}
