export const ADMIN_ROLES = new Set(["OWNER", "MANAGER"]);

export function isAdminRole(role: string) {
  return ADMIN_ROLES.has(role);
}

export const roleLabels: Record<string, string> = {
  OWNER: "Proprietário",
  MANAGER: "Gerente",
  ADVISOR: "Consultor",
  MECHANIC: "Técnico",
  STOCK: "Estoque",
  FINANCE: "Financeiro",
  RECEPTION: "Recepção",
};
