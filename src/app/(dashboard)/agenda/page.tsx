import { Header } from "@/components/layout/header";
import { AgendaManager } from "@/components/modules/agenda-manager";
import { listCustomersOptions } from "@/lib/actions/customers";
import { listMechanicsOptions } from "@/lib/actions/employees";
import {
  listAppointments,
  listServiceBays,
} from "@/lib/actions/appointments";
import { listVehiclesOptions } from "@/lib/actions/vehicles";

export default async function AgendaPage() {
  const [appointments, customers, vehicles, employees, serviceBays] = await Promise.all([
    listAppointments(),
    listCustomersOptions(),
    listVehiclesOptions(),
    listMechanicsOptions(),
    listServiceBays(),
  ]);

  return (
    <>
      <Header
        title="Agenda"
        description={`${appointments.length} agendamento(s)`}
      />
      <div className="p-8">
        <AgendaManager
          appointments={appointments}
          customers={customers}
          vehicles={vehicles}
          employees={employees}
          serviceBays={serviceBays}
        />
      </div>
    </>
  );
}
