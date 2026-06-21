import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Notificações"
      description="WhatsApp, e-mail e SMS — confirmações e alertas automáticos"
      actions={[{ label: "Configurar WhatsApp" }]}
      features={[
        "Envio de OS e orçamento por WhatsApp",
        "Confirmação de agendamento",
        "Alerta de veículo pronto",
        "Lembrete de revisão por km/tempo",
        "Cobrança de contas vencidas",
        "Log de envios e falhas",
        "Templates personalizáveis",
      ]}
    />
  );
}
