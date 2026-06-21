import { Header } from "@/components/layout/header";
import { EmployeesManager } from "@/components/modules/employees-manager";
import { listEmployees } from "@/lib/actions/employees";

export default async function FuncionariosPage() {
  const employees = await listEmployees();

  return (
    <>
      <Header
        title="Funcionários"
        description={`${employees.length} funcionário(s) cadastrado(s)`}
      />
      <div className="space-y-4 p-8">
        <EmployeesManager employees={employees} />
      </div>
    </>
  );
}
