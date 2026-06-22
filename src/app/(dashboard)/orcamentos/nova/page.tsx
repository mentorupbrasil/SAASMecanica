import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/modules/quote-form";
import { listCustomersOptions } from "@/lib/actions/customers";
import { listProductsOptions } from "@/lib/actions/products";
import { listServicesOptions } from "@/lib/actions/services";
import { listVehiclesOptions } from "@/lib/actions/vehicles";

export default async function NovoOrcamentoPage() {
  const [customers, vehicles, services, products] = await Promise.all([
    listCustomersOptions(),
    listVehiclesOptions(),
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
        title="Novo orçamento"
        description="Monte a proposta completa com serviços, peças e terceiros"
        action={
          <Link href="/orcamentos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <QuoteForm
          customers={customers}
          vehicles={vehicles}
          services={serviceOpts}
          products={productOpts}
        />
      </div>
    </>
  );
}
