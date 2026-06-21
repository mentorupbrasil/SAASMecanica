import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Garantias"
      description="Garantia de peças e serviços com controle de vencimentos"
      actions={[{ label: "Registrar garantia" }]}
      features={[
        "Garantia de peça ou serviço",
        "Prazo por dias ou quilometragem",
        "Alertas de vencimento",
        "Acionamento de garantia pelo cliente",
        "Histórico de acionamentos",
        "Vinculação automática à OS de origem",
      ]}
    />
  );
}
