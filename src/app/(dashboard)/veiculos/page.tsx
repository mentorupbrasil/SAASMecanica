import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Veículos"
      description="Frota de clientes com histórico completo de manutenção"
      actions={[{ label: "Novo veículo" }]}
      features={[
        "Placa, marca, modelo, ano, cor",
        "Chassi, motor, Renavam",
        "Quilometragem atual e histórico por visita",
        "Consulta placa/VIN (integração futura)",
        "Lembretes de revisão por km ou tempo",
        "Todas as OS, peças trocadas e garantias",
        "QR Code para identificação rápida na oficina",
      ]}
    />
  );
}
