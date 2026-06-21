import { Header } from "@/components/layout/header";
import { ServicesManager } from "@/components/modules/services-manager";
import { listServices } from "@/lib/actions/services";

export default async function ServicosPage() {
  const services = await listServices();

  return (
    <>
      <Header
        title="Serviços"
        description={`${services.length} serviço(s) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <ServicesManager services={services} />
      </div>
    </>
  );
}
