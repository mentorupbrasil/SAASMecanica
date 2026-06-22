import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { CategoryFilter } from "@/components/crud/category-filter";
import { SearchBar } from "@/components/crud/search-bar";
import { ProductsManager } from "@/components/modules/products-manager";
import { listProducts } from "@/lib/actions/products";
import { listSuppliersOptions } from "@/lib/actions/suppliers";
import { PRODUCT_CATEGORIES } from "@/lib/catalogs";

type Props = { searchParams: Promise<{ q?: string; categoria?: string }> };

export default async function ProdutosPage({ searchParams }: Props) {
  const { q, categoria } = await searchParams;
  const [products, supplierOptions] = await Promise.all([
    listProducts(q, categoria),
    listSuppliersOptions(),
  ]);

  return (
    <>
      <Header
        title="Peças e Produtos"
        description={`${products.length} produto(s) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <Suspense>
            <SearchBar placeholder="Buscar por nome ou SKU..." />
          </Suspense>
        </div>
        <Suspense>
          <CategoryFilter options={PRODUCT_CATEGORIES} />
        </Suspense>
        <ProductsManager products={products} supplierOptions={supplierOptions} />
      </div>
    </>
  );
}
