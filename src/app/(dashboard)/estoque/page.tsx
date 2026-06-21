import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Controle de Estoque"
      description="Entradas, saídas, inventário e alertas de reposição"
      actions={[{ label: "Nova entrada" }]}
      features={[
        "Entrada manual ou via NF-e XML",
        "Saída automática por OS",
        "Inventário com contagem e ajuste",
        "Alertas de estoque mínimo",
        "Movimentações com rastreabilidade",
        "Curva ABC de produtos",
        "Transferência entre filiais",
      ]}
    />
  );
}
