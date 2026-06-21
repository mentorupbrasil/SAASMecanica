import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Serviços"
      description="Catálogo de serviços com preço, tempo e garantia"
      actions={[{ label: "Novo serviço" }]}
      features={[
        "Código interno e categorias",
        "Preço de venda e custo",
        "Tempo estimado em minutos",
        "Garantia padrão em dias",
        "Matriz de precificação (markup)",
        "Serviços mais vendidos no painel",
      ]}
    />
  );
}
