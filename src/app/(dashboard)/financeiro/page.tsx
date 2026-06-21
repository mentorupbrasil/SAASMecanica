import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Financeiro"
      description="Contas, fluxo de caixa, comissões e conciliação bancária"
      actions={[{ label: "Lançamento" }]}
      features={[
        "Contas a pagar e a receber",
        "Fluxo de caixa diário/mensal",
        "Controle de inadimplência",
        "Conciliação bancária",
        "Comissões por mecânico/consultor",
        "PIX, boleto, cartão e dinheiro",
        "DRE e margem por OS",
        "Matriz de precificação peças/mão de obra",
      ]}
    />
  );
}
