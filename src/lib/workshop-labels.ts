/** Terminologia padrão para oficinas mecânicas e eletromecânicas automotivas */

export const WORKSHOP_NAME = "SAASMecanica";
export const WORKSHOP_TAGLINE = "Mecânica e elétrica automotiva";
export const WORKSHOP_DESCRIPTION =
  "Sistema SaaS para oficinas mecânicas e eletromecânicas: OS, orçamentos, elétrica, mecânica, estoque e financeiro.";

export const TECHNICIAN_LABEL = "Técnico responsável";
export const TECHNICIAN_COLUMN = "Técnico";
export const TEAM_PRODUCTIVITY_TITLE = "Produtividade da equipe técnica";

export const EMPLOYEE_TYPE_LABELS: Record<string, string> = {
  MECHANIC: "Técnico mecânico",
  ELECTRICIAN: "Técnico elétrico",
  ELECTROMECHANIC: "Eletromecânico",
  ADVISOR: "Consultor",
  MANAGER: "Gerente",
  ADMIN: "Administrador",
  OTHER: "Outro",
};

export const TECHNICAL_EMPLOYEE_TYPES = [
  "MECHANIC",
  "ELECTRICIAN",
  "ELECTROMECHANIC",
  "OTHER",
] as const;

export function employeeTypeLabel(type: string) {
  return EMPLOYEE_TYPE_LABELS[type] ?? type;
}
