import { Header } from "@/components/layout/header";
import { StockManager } from "@/components/modules/stock-manager";
import { listProducts } from "@/lib/actions/products";
import { listStockMovements } from "@/lib/actions/stock";
import { listSuppliersOptions } from "@/lib/actions/suppliers";

export default async function EstoquePage() {
  const [movements, products, supplierOptions] = await Promise.all([
    listStockMovements(),
    listProducts(),
    listSuppliersOptions(),
  ]);

  return (
    <>
      <Header
        title="Controle de Estoque"
        description={`${movements.length} movimentação(ões) recente(s)`}
      />
      <div className="space-y-4 p-8">
        <StockManager
          movements={movements}
          products={products}
          supplierOptions={supplierOptions}
        />
      </div>
    </>
  );
}
