import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { WorkOrderForm } from "@/components/modules/work-order-form";
import { listCustomersOptions } from "@/lib/actions/customers";
import { listMechanicsOptions } from "@/lib/actions/employees";
import { listProductsOptions } from "@/lib/actions/products";
import { listServicesOptions } from "@/lib/actions/services";
import { listVehiclesOptions } from "@/lib/actions/vehicles";

export default async function NovaOrdemPage() {
  const [customers, vehicles, mechanics, services, products] = await Promise.all([
    listCustomersOptions(),
    listVehiclesOptions(),
    listMechanicsOptions(),
    listServicesOptions(),
    listProductsOptions(),
  ]);

  const serviceOpts = services.map((s) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price),
  }));
  const productOpts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.salePrice),
  }));

  return (
    <>
      <Header
        title="Nova ordem de serviço"
        description="Cliente, veículo, itens e reclamação — tudo em uma tela"
        action={
          <Link href="/ordens">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <WorkOrderForm
          customers={customers}
          vehicles={vehicles}
          mechanics={mechanics}
          services={serviceOpts}
          products={productOpts}
        />
      </div>
    </>
  );
}
