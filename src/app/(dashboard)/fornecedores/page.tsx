import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { CategoryFilter } from "@/components/crud/category-filter";
import { SuppliersManager } from "@/components/modules/suppliers-manager";
import { listSuppliers } from "@/lib/actions/suppliers";
import { SUPPLIER_CATEGORIES } from "@/lib/catalogs";

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function FornecedoresPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const suppliers = await listSuppliers(categoria);

  return (
    <>
      <Header
        title="Fornecedores"
        description={`${suppliers.length} fornecedor(es) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <Suspense>
          <CategoryFilter options={SUPPLIER_CATEGORIES} />
        </Suspense>
        <SuppliersManager suppliers={suppliers} />
      </div>
    </>
  );
}
