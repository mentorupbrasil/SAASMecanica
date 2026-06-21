import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { SearchBar } from "@/components/crud/search-bar";
import { VehiclesManager } from "@/components/modules/vehicles-manager";
import { listCustomersOptions } from "@/lib/actions/customers";
import { listVehicles } from "@/lib/actions/vehicles";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function VeiculosPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [vehicles, customerOptions] = await Promise.all([
    listVehicles(q),
    listCustomersOptions(),
  ]);

  return (
    <>
      <Header
        title="Veículos"
        description={`${vehicles.length} veículo(s) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <Suspense>
          <SearchBar placeholder="Buscar por placa, marca, modelo, cliente..." />
        </Suspense>
        <VehiclesManager vehicles={vehicles} customerOptions={customerOptions} />
      </div>
    </>
  );
}
