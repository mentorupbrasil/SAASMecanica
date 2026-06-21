import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { QuotesList } from "@/components/modules/quotes-list";
import { listQuotes } from "@/lib/actions/quotes";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function OrcamentosPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const quotes = await listQuotes(status);

  return (
    <>
      <Header
        title="Orçamentos"
        description={`${quotes.length} orçamento(s)`}
        action={
          <Link href="/orcamentos/nova">
            <Button>
              <Plus className="h-4 w-4" /> Novo orçamento
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <Suspense>
          <QuotesList quotes={quotes} />
        </Suspense>
      </div>
    </>
  );
}
