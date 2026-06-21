import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Ordens de Serviço"
      description="Ciclo completo: abertura, diagnóstico, execução e entrega"
      actions={[{ label: "Abrir OS" }]}
      features={[
        "Abertura com check-in do veículo (km, combustível, fotos)",
        "Registro de defeitos relatados pelo cliente",
        "Diagnóstico técnico com laudo",
        "Serviços e peças executados com controle de margem",
        "Controle de horas por mecânico",
        "Fotos do veículo (entrada, progresso, saída)",
        "Assinatura digital do cliente",
        "Impressão PDF e envio por WhatsApp",
        "Histórico de status com auditoria",
      ]}
    />
  );
}
