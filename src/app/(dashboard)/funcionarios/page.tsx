import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Funcionários"
      description="Equipe, especialidades, comissões e produtividade"
      actions={[{ label: "Novo funcionário" }]}
      features={[
        "Cadastro com CPF e dados profissionais",
        "Tipos: mecânico, consultor, gerente",
        "Taxa de comissão configurável",
        "Valor hora para mão de obra",
        "Vínculo com usuário do sistema (login)",
        "Relatório de produtividade e horas",
        "Metas individuais de faturamento",
      ]}
    />
  );
}
