import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Relatórios"
      description="Análises gerenciais para tomada de decisão"
      actions={[{ label: "Exportar" }]}
      features={[
        "OS por período e status",
        "Faturamento diário, semanal e mensal",
        "Posição de estoque e giro",
        "Clientes ativos e inativos",
        "Serviços realizados e ticket médio",
        "Lucratividade por OS, peça e serviço",
        "Produtividade por mecânico",
        "Exportação Excel e PDF",
      ]}
    />
  );
}
