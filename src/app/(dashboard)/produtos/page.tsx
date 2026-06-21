import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { SearchBar } from "@/components/crud/search-bar";
import { ProductsManager } from "@/components/modules/products-manager";
import { listProducts } from "@/lib/actions/products";
import { listSuppliersOptions } from "@/lib/actions/suppliers";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ProdutosPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [products, supplierOptions] = await Promise.all([
    listProducts(q),
    listSuppliersOptions(),
  ]);

  return (
    <>
      <Header
        title="Peças e Produtos"
        description={`${products.length} produto(s) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <Suspense>
          <SearchBar placeholder="Buscar por nome ou SKU..." />
        </Suspense>
        <ProductsManager products={products} supplierOptions={supplierOptions} />
      </div>
    </>
  );
}
