import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Metas & CRM"
      description="Fidelização, campanhas e metas de vendas"
      actions={[{ label: "Nova campanha" }]}
      features={[
        "Programa de fidelidade com pontos",
        "Campanhas WhatsApp pós-venda",
        "Metas mensais de faturamento",
        "Follow-up de orçamentos não aprovados",
        "Lembretes de revisão automáticos",
        "Clientes inativos há X meses",
        "Aniversário e datas especiais",
      ]}
    />
  );
}
