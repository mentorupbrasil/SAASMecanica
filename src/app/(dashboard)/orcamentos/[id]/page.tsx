import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { QuoteDetail } from "@/components/modules/quote-detail";
import { getQuote } from "@/lib/actions/quotes";
import { listProductsOptions } from "@/lib/actions/products";
import { listServicesOptions } from "@/lib/actions/services";

type Props = { params: Promise<{ id: string }> };

export default async function OrcamentoDetailPage({ params }: Props) {
  const { id } = await params;
  const [quote, services, products] = await Promise.all([
    getQuote(id),
    listServicesOptions(),
    listProductsOptions(),
  ]);

  if (!quote) notFound();

  return (
    <>
      <Header
        title={`Orçamento #${quote.number}`}
        description={`${quote.customer.name} — ${quote.vehicle.plate}`}
        action={
          <Link href="/orcamentos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <QuoteDetail quote={quote} services={services} products={products} />
      </div>
    </>
  );
}
