import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/modules/kanban-board";
import { listWorkOrdersKanban } from "@/lib/actions/work-orders";

export default async function KanbanPage() {
  const workOrders = await listWorkOrdersKanban();

  return (
    <>
      <Header
        title="Kanban de Produção"
        description="Acompanhe as OS em tempo real por etapa"
        action={
          <Link href="/ordens/nova">
            <Button>
              <Plus className="h-4 w-4" /> Nova OS
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <KanbanBoard workOrders={workOrders} />
      </div>
    </>
  );
}
