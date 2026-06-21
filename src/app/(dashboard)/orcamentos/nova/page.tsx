import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/modules/quote-form";
import { listCustomersOptions } from "@/lib/actions/customers";
import { listVehiclesOptions } from "@/lib/actions/vehicles";

export default async function NovoOrcamentoPage() {
  const [customers, vehicles] = await Promise.all([
    listCustomersOptions(),
    listVehiclesOptions(),
  ]);

  return (
    <>
      <Header
        title="Novo orçamento"
        description="Montar proposta comercial para o cliente"
        action={
          <Link href="/orcamentos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <QuoteForm customers={customers} vehicles={vehicles} />
      </div>
    </>
  );
}
