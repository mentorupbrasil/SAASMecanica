/** E-mails autorizados a gerenciar todas as empresas (plataforma SaaS). */
export function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = getSuperAdminEmails();
  if (list.length === 0) return false;
  return list.includes(email.toLowerCase().trim());
}

export function isPublicRegistrationEnabled(): boolean {
  return process.env.ALLOW_PUBLIC_REGISTRATION === "true";
}
