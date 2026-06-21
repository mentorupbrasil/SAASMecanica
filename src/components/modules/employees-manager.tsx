"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "@/lib/actions/employees";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/crud/modal";
import {
  DataTable,
  EmptyRow,
  Table,
  TBody,
  TD,
  THead,
  TH,
  TR,
} from "@/components/crud/data-table";
import { formatCurrency, formatDocument } from "@/lib/utils";

type Employee = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  type: string;
  specialty: string | null;
  commissionRate: { toString(): string } | number;
  hourlyRate: { toString(): string } | number;
};

const TYPE_LABELS: Record<string, string> = {
  MECHANIC: "Mecânico",
  ADVISOR: "Consultor",
  MANAGER: "Gerente",
  ADMIN: "Administrador",
  OTHER: "Outro",
};

export function EmployeesManager({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(e: Employee) {
    setEditing(e);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateEmployee(editing.id, fd);
      else await createEmployee(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo funcionário
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>Contato</TH>
              <TH>Tipo</TH>
              <TH>Especialidade</TH>
              <TH>Comissão</TH>
              <TH>Hora</TH>
              <TH className="w-24">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {employees.length === 0 ? (
              <EmptyRow colSpan={7} message="Nenhum funcionário cadastrado" />
            ) : (
              employees.map((e) => (
                <TR key={e.id}>
                  <TD>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-slate-400">
                      {e.document ? formatDocument(e.document) : ""}
                    </div>
                  </TD>
                  <TD>
                    <div>{e.phone ?? "—"}</div>
                    <div className="text-xs text-slate-400">{e.email ?? ""}</div>
                  </TD>
                  <TD>
                    <Badge variant="info">{TYPE_LABELS[e.type] ?? e.type}</Badge>
                  </TD>
                  <TD>{e.specialty ?? "—"}</TD>
                  <TD>{Number(e.commissionRate)}%</TD>
                  <TD>{formatCurrency(Number(e.hourlyRate))}</TD>
                  <TD>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            await deleteEmployee(e.id);
                            router.refresh();
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </DataTable>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar funcionário" : "Novo funcionário"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input name="name" required defaultValue={editing?.name ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input name="document" defaultValue={editing?.document ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select name="type" defaultValue={editing?.type ?? "MECHANIC"}>
                <option value="MECHANIC">Mecânico</option>
                <option value="ADVISOR">Consultor</option>
                <option value="MANAGER">Gerente</option>
                <option value="ADMIN">Administrador</option>
                <option value="OTHER">Outro</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input name="phone" defaultValue={editing?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                name="email"
                type="email"
                defaultValue={editing?.email ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Especialidade</Label>
            <Input name="specialty" defaultValue={editing?.specialty ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Comissão (%)</Label>
              <Input
                name="commissionRate"
                type="number"
                min={0}
                step="0.01"
                defaultValue={Number(editing?.commissionRate ?? 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor hora (R$)</Label>
              <Input
                name="hourlyRate"
                type="number"
                min={0}
                step="0.01"
                defaultValue={Number(editing?.hourlyRate ?? 0)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
