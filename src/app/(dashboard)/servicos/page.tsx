import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { CategoryFilter } from "@/components/crud/category-filter";
import { ServicesManager } from "@/components/modules/services-manager";
import { listServices } from "@/lib/actions/services";
import { SERVICE_CATEGORIES } from "@/lib/catalogs";

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function ServicosPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const services = await listServices(categoria);

  return (
    <>
      <Header
        title="Serviços"
        description={`${services.length} serviço(s) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <Suspense>
          <CategoryFilter options={SERVICE_CATEGORIES} />
        </Suspense>
        <ServicesManager services={services} />
      </div>
    </>
  );
}
