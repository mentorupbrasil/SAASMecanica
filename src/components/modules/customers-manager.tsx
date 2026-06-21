"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { formatDocument } from "@/lib/utils";

type Customer = {
  id: string;
  type: string;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  _count: { vehicles: number; workOrders: number };
};

export function CustomersManager({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateCustomer(editing.id, fd);
      else await createCustomer(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo cliente
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>Documento</TH>
              <TH>Contato</TH>
              <TH>Veículos</TH>
              <TH>OS</TH>
              <TH className="w-24">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {customers.length === 0 ? (
              <EmptyRow colSpan={6} message="Nenhum cliente cadastrado" />
            ) : (
              customers.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <div className="font-medium">{c.name}</div>
                    <Badge variant={c.type === "COMPANY" ? "info" : "default"}>
                      {c.type === "COMPANY" ? "PJ" : "PF"}
                    </Badge>
                  </TD>
                  <TD>{c.document ? formatDocument(c.document) : "—"}</TD>
                  <TD>
                    <div>{c.phone ?? c.whatsapp ?? "—"}</div>
                    <div className="text-xs text-slate-400">{c.email ?? ""}</div>
                  </TD>
                  <TD>{c._count.vehicles}</TD>
                  <TD>{c._count.workOrders}</TD>
                  <TD>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            await deleteCustomer(c.id);
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
        title={editing ? "Editar cliente" : "Novo cliente"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select name="type" defaultValue={editing?.type ?? "INDIVIDUAL"}>
                <option value="INDIVIDUAL">Pessoa Física</option>
                <option value="COMPANY">Pessoa Jurídica</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CPF/CNPJ</Label>
              <Input name="document" defaultValue={editing?.document ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input name="name" required defaultValue={editing?.name ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input name="phone" defaultValue={editing?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input name="whatsapp" defaultValue={editing?.whatsapp ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input name="email" type="email" defaultValue={editing?.email ?? ""} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Cidade</Label>
              <Input name="city" defaultValue={editing?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Input name="state" maxLength={2} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea name="notes" rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
