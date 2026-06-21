import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { WorkOrderDetail } from "@/components/modules/work-order-detail";
import { getWorkOrder } from "@/lib/actions/work-orders";
import { listProductsOptions } from "@/lib/actions/products";
import { listServicesOptions } from "@/lib/actions/services";

type Props = { params: Promise<{ id: string }> };

export default async function OrdemDetailPage({ params }: Props) {
  const { id } = await params;
  const [workOrder, services, products] = await Promise.all([
    getWorkOrder(id),
    listServicesOptions(),
    listProductsOptions(),
  ]);

  if (!workOrder) notFound();

  return (
    <>
      <Header
        title={`OS #${workOrder.number}`}
        description={`${workOrder.customer.name} — ${workOrder.vehicle.plate}`}
        action={
          <Link href="/ordens">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <WorkOrderDetail workOrder={workOrder} services={services} products={products} />
      </div>
    </>
  );
}
