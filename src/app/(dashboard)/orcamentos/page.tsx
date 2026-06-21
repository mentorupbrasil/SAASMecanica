import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Orçamentos"
      description="Propostas comerciais com aprovação digital e conversão automática"
      actions={[{ label: "Novo orçamento" }]}
      features={[
        "Montagem de orçamento com peças e serviços",
        "Envio por WhatsApp com link de aprovação",
        "Aprovação digital com registro de IP e data",
        "Conversão automática em OS ao aprovar",
        "Controle: pendentes, aprovados, rejeitados, expirados",
        "Validade configurável do orçamento",
        "Comparativo custo x preço de venda",
      ]}
    />
  );
}
