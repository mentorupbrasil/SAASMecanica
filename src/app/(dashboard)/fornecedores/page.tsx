import { Header } from "@/components/layout/header";
import { SuppliersManager } from "@/components/modules/suppliers-manager";
import { listSuppliers } from "@/lib/actions/suppliers";

export default async function FornecedoresPage() {
  const suppliers = await listSuppliers();

  return (
    <>
      <Header
        title="Fornecedores"
        description={`${suppliers.length} fornecedor(es) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <SuppliersManager suppliers={suppliers} />
      </div>
    </>
  );
}
