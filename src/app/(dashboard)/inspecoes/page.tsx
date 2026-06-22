import { Header } from "@/components/layout/header";
import { InspectionManager } from "@/components/modules/inspection-manager";
import { listInspections } from "@/lib/actions/inspections";
import { listVehiclesOptions } from "@/lib/actions/vehicles";

export default async function InspecoesPage() {
  const [inspections, vehicles] = await Promise.all([
    listInspections(),
    listVehiclesOptions(),
  ]);

  return (
    <>
      <Header
        title="Inspeção Digital (DVI)"
        description="Checklist multiponto com OK, Atenção e Crítico"
        action={null}
      />
      <div className="p-8">
        <InspectionManager inspections={inspections} vehicles={vehicles} />
      </div>
    </>
  );
}
