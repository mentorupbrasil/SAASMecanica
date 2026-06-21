import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Peças e Produtos"
      description="Catálogo de peças com estoque, preços e localização"
      actions={[{ label: "Nova peça" }]}
      features={[
        "SKU, código de barras e NCM fiscal",
        "Preço de custo e venda",
        "Estoque atual e estoque mínimo",
        "Localização física (prateleira)",
        "Fornecedor padrão",
        "Alertas de reposição automáticos",
        "Saída automática vinculada à OS",
      ]}
    />
  );
}
