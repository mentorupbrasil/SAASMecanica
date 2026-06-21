import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Clientes"
      description="Cadastro completo PF/PJ com histórico e CRM"
      actions={[{ label: "Novo cliente" }]}
      features={[
        "CPF/CNPJ com validação",
        "Múltiplos contatos (telefone, WhatsApp, e-mail)",
        "Endereço completo",
        "Veículos vinculados",
        "Histórico de OS e orçamentos",
        "Programa de fidelidade (pontos)",
        "Inadimplência e limite de crédito",
      ]}
    />
  );
}
