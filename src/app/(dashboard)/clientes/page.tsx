import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { SearchBar } from "@/components/crud/search-bar";
import { CustomersManager } from "@/components/modules/customers-manager";
import { listCustomers } from "@/lib/actions/customers";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ClientesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const customers = await listCustomers(q);

  return (
    <>
      <Header
        title="Clientes"
        description={`${customers.length} cliente(s) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <Suspense>
          <SearchBar placeholder="Buscar por nome, CPF, telefone..." />
        </Suspense>
        <CustomersManager customers={customers} />
      </div>
    </>
  );
}
