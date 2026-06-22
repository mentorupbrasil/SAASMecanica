import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

import { roleLabels } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar
        user={{
          name: session.user.name,
          tenantName: session.user.tenantName,
          role: roleLabels[session.user.role] ?? session.user.role,
          roleKey: session.user.role,
        }}
      />
      <main className="surface-main flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
