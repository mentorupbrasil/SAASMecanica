"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from "@/lib/actions/suppliers";
import { SUPPLIER_CATEGORIES } from "@/lib/catalogs";
import { CategorySelect } from "@/components/forms/category-select";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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

type Supplier = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  contact: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  _count: { products: number };
};

export function SuppliersManager({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateSupplier(editing.id, fd);
      else await createSupplier(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo fornecedor
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>Tipo</TH>
              <TH>CNPJ</TH>
              <TH>Contato</TH>
              <TH>Cidade</TH>
              <TH>Produtos</TH>
              <TH className="w-24">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {suppliers.length === 0 ? (
              <EmptyRow colSpan={7} message="Nenhum fornecedor cadastrado" />
            ) : (
              suppliers.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <div className="font-medium">{s.name}</div>
                    {s.contact && (
                      <div className="text-xs text-slate-400">{s.contact}</div>
                    )}
                  </TD>
                  <TD>
                    {s.category ? (
                      <Badge variant="default">{s.category}</Badge>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD>{s.document ? formatDocument(s.document) : "—"}</TD>
                  <TD>
                    <div>{s.phone ?? "—"}</div>
                    <div className="text-xs text-slate-400">{s.email ?? ""}</div>
                  </TD>
                  <TD>
                    {s.city ?? "—"}
                    {s.state ? ` / ${s.state}` : ""}
                  </TD>
                  <TD>{s._count.products}</TD>
                  <TD>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            await deleteSupplier(s.id);
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
        title={editing ? "Editar fornecedor" : "Novo fornecedor"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input name="name" required defaultValue={editing?.name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de fornecimento *</Label>
            <CategorySelect
              name="category"
              options={SUPPLIER_CATEGORIES}
              defaultValue={editing?.category ?? ""}
              placeholder="Ex: Elétrica e baterias, Peças automotivas..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input name="document" defaultValue={editing?.document ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Contato comercial</Label>
              <Input name="contact" defaultValue={editing?.contact ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input name="phone" defaultValue={editing?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input name="email" type="email" defaultValue={editing?.email ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Cidade</Label>
              <Input name="city" defaultValue={editing?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Input name="state" maxLength={2} defaultValue={editing?.state ?? ""} />
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
