import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Fornecedores"
      description="Parceiros de peças com histórico de compras e contas a pagar"
      actions={[{ label: "Novo fornecedor" }]}
      features={[
        "CNPJ, contato comercial e financeiro",
        "Peças vinculadas ao fornecedor",
        "Histórico de entradas de estoque",
        "Contas a pagar por fornecedor",
        "Prazo médio de entrega",
        "Importação XML NF-e automática",
      ]}
    />
  );
}
