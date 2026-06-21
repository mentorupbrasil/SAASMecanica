import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Agenda"
      description="Agendamentos, boxes/elevadores e escala dos mecânicos"
      actions={[{ label: "Novo agendamento" }]}
      features={[
        "Calendário diário, semanal e mensal",
        "Controle de boxes e elevadores",
        "Agenda individual por mecânico",
        "Confirmação automática por WhatsApp",
        "Status: agendado, confirmado, no-show",
        "Conversão de agendamento em OS",
        "Bloqueio de horários e feriados",
      ]}
    />
  );
}
