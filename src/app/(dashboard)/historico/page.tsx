import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Histórico do Veículo"
      description="Linha do tempo completa de manutenções por veículo"
      actions={[{ label: "Buscar placa" }]}
      features={[
        "Todas as manutenções realizadas",
        "Quilometragem registrada em cada visita",
        "Peças substituídas com datas",
        "Garantias concedidas e status",
        "Inspeções digitais anteriores",
        "Exportação PDF para o cliente",
        "Lembretes de próxima revisão",
      ]}
    />
  );
}
