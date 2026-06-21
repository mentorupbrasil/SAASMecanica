import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { WorkOrdersList } from "@/components/modules/work-orders-list";
import { listWorkOrders } from "@/lib/actions/work-orders";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function OrdensPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const workOrders = await listWorkOrders(status);

  return (
    <>
      <Header
        title="Ordens de Serviço"
        description={`${workOrders.length} ordem(ns) de serviço`}
        action={
          <Link href="/ordens/nova">
            <Button>
              <Plus className="h-4 w-4" /> Nova OS
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <Suspense>
          <WorkOrdersList workOrders={workOrders} />
        </Suspense>
      </div>
    </>
  );
}
