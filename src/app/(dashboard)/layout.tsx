import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

const roleLabels: Record<string, string> = {
  OWNER: "Proprietário",
  MANAGER: "Gerente",
  ADVISOR: "Consultor",
  MECHANIC: "Mecânico",
  STOCK: "Estoque",
  FINANCE: "Financeiro",
  RECEPTION: "Recepção",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        user={{
          name: session.user.name,
          tenantName: session.user.tenantName,
          role: roleLabels[session.user.role] ?? session.user.role,
        }}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
