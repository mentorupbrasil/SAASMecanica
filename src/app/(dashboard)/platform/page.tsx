import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformTenantsManager } from "@/components/modules/platform-tenants-manager";
import { listAllTenants } from "@/lib/actions/platform";
import { requireSuperAdmin } from "@/lib/session";
import { Building2, Lock, Users } from "lucide-react";

export default async function PlatformPage() {
  await requireSuperAdmin();
  const tenants = await listAllTenants();

  return (
    <>
      <Header
        title="Plataforma SaaS"
        description="Gerencie as empresas clientes — cada uma com dados totalmente isolados"
      />

      <div className="space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Empresas
              </CardDescription>
              <CardTitle className="text-2xl">{tenants.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Ativas
              </CardDescription>
              <CardTitle className="text-2xl">
                {tenants.filter((t) => t.active).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Isolamento
              </CardDescription>
              <CardTitle className="text-base font-semibold leading-snug">
                Banco separado por tenantId
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Empresa X nunca vê dados da Empresa Y. Login amarra o usuário à empresa dele.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Empresas cadastradas</CardTitle>
            <CardDescription>
              Crie a empresa aqui e envie e-mail + senha ao cliente. Ele configura logo e cores em
              Administração → Painel Admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformTenantsManager tenants={tenants} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
