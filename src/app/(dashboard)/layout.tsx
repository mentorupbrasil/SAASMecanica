import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TenantBrandingStyles } from "@/components/layout/tenant-branding-styles";
import { roleLabels } from "@/lib/roles";
import { isSuperAdminEmail } from "@/lib/super-admin";
import { getTenantBranding } from "@/lib/tenant-branding";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const branding = await getTenantBranding(session.user.tenantId);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <TenantBrandingStyles brandColor={branding?.brandColor ?? "#ea580c"} />
      <Sidebar
        user={{
          name: session.user.name,
          tenantName: branding?.name ?? session.user.tenantName,
          role: roleLabels[session.user.role] ?? session.user.role,
          roleKey: session.user.role,
          logoUrl: branding?.logoUrl ?? null,
          isSuperAdmin: isSuperAdminEmail(session.user.email),
        }}
      />
      <main className="surface-main flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
