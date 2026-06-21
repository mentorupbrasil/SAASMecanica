import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Inspeção Digital (DVI)"
      description="Checklist multiponto com fotos — padrão Shop-Ware/Tekmetric"
      actions={[{ label: "Nova inspeção" }]}
      features={[
        "Templates de checklist por tipo de veículo",
        "Itens: OK, Atenção, Crítico, N/A",
        "Foto e vídeo por item inspecionado",
        "Relatório visual para o cliente aprovar serviços",
        "Vinculação automática à OS",
        "Histórico de inspeções por veículo",
        "Aumento de taxa de aprovação de serviços adicionais",
      ]}
    />
  );
}
