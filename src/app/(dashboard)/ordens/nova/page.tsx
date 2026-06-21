import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { WorkOrderForm } from "@/components/modules/work-order-form";
import { listCustomersOptions } from "@/lib/actions/customers";
import { listMechanicsOptions } from "@/lib/actions/employees";
import { listVehiclesOptions } from "@/lib/actions/vehicles";

export default async function NovaOrdemPage() {
  const [customers, vehicles, mechanics] = await Promise.all([
    listCustomersOptions(),
    listVehiclesOptions(),
    listMechanicsOptions(),
  ]);

  return (
    <>
      <Header
        title="Nova ordem de serviço"
        description="Abrir OS com check-in do veículo"
        action={
          <Link href="/ordens">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <WorkOrderForm customers={customers} vehicles={vehicles} mechanics={mechanics} />
      </div>
    </>
  );
}
