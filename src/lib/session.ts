import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
