import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Kanban de Produção"
      description="Acompanhe todas as OS em tempo real — estilo Tekmetric/Shop-Ware"
      actions={[{ label: "Nova OS", href: "/ordens" }]}
      features={[
        "Colunas por status (diagnóstico, aguardando peças, em execução...)",
        "Drag-and-drop para mover OS entre etapas",
        "Atribuição rápida de mecânico e box",
        "Indicadores de tempo parado por coluna",
        "Filtro por mecânico, prioridade e filial",
        "Alertas visuais de SLA estourado",
      ]}
    />
  );
}
