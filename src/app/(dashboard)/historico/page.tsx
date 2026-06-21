import { Header } from "@/components/layout/header";
import { HistorySearch } from "@/components/modules/history-search";
import { getVehicleByPlate } from "@/lib/actions/vehicles";

type Props = { searchParams: Promise<{ plate?: string }> };

export default async function HistoricoPage({ searchParams }: Props) {
  const { plate } = await searchParams;
  const vehicle = plate ? await getVehicleByPlate(plate) : null;

  return (
    <>
      <Header
        title="Histórico do Veículo"
        description="Linha do tempo de manutenções por placa"
      />
      <div className="p-8">
        <HistorySearch plate={plate} vehicle={vehicle} />
      </div>
    </>
  );
}
