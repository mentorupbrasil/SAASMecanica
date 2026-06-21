import { Header } from "@/components/layout/header";
import { WarrantiesManager } from "@/components/modules/warranties-manager";
import {
  listWarranties,
  listWorkOrdersForWarranty,
} from "@/lib/actions/warranties";

export default async function GarantiasPage() {
  const [warranties, workOrders] = await Promise.all([
    listWarranties(),
    listWorkOrdersForWarranty(),
  ]);

  return (
    <>
      <Header
        title="Garantias"
        description={`${warranties.length} garantia(s) registrada(s)`}
      />
      <div className="p-8">
        <WarrantiesManager warranties={warranties} workOrders={workOrders} />
      </div>
    </>
  );
}
