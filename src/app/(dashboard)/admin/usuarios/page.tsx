import { Header } from "@/components/layout/header";
import { AdminUsersManager } from "@/components/modules/admin-users-manager";
import { listTenantUsers } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/session";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listTenantUsers();

  return (
    <>
      <Header
        title="Usuários do sistema"
        description="Gerencie quem acessa a oficina e com qual perfil"
      />
      <div className="p-8">
        <AdminUsersManager users={users} />
      </div>
    </>
  );
}
