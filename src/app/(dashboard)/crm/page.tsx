import { Header } from "@/components/layout/header";
import { CrmManager } from "@/components/modules/crm-manager";
import { listCrmReminders } from "@/lib/actions/crm";
import { listVehiclesOptions } from "@/lib/actions/vehicles";

export default async function CrmPage() {
  const [reminders, vehicles] = await Promise.all([
    listCrmReminders(),
    listVehiclesOptions(),
  ]);

  return (
    <>
      <Header
        title="Metas & CRM"
        description="Lembretes de revisão e pós-venda — estilo UltraCar / Oficina Integrada"
      />
      <div className="p-8">
        <CrmManager reminders={reminders} vehicles={vehicles} />
      </div>
    </>
  );
}
