import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ADMIN_ROLES } from "@/lib/roles";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireTenantId() {
  const session = await requireSession();
  return session.user.tenantId;
}

export async function requireUserId() {
  const session = await requireSession();
  return session.user.id;
}

const adminRoles = ADMIN_ROLES;

export async function requireAdmin() {
  const session = await requireSession();
  if (!adminRoles.has(session.user.role)) {
    redirect("/");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireSession();
  const { isSuperAdminEmail } = await import("@/lib/super-admin");
  if (!isSuperAdminEmail(session.user.email)) {
    redirect("/");
  }
  return session;
}

export { isAdminRole } from "@/lib/roles";
