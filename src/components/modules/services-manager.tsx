"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createService,
  deleteService,
  updateService,
} from "@/lib/actions/services";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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
import { formatCurrency } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  category: string | null;
  price: { toString(): string } | number;
  cost: { toString(): string } | number;
  durationMin: number;
  warrantyDays: number;
};

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateService(editing.id, fd);
      else await createService(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>Categoria</TH>
              <TH>Preço</TH>
              <TH>Custo</TH>
              <TH>Duração</TH>
              <TH>Garantia</TH>
              <TH className="w-24">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {services.length === 0 ? (
              <EmptyRow colSpan={7} message="Nenhum serviço cadastrado" />
            ) : (
              services.map((s) => (
                <TR key={s.id}>
                  <TD className="font-medium">{s.name}</TD>
                  <TD>{s.category ?? "—"}</TD>
                  <TD>{formatCurrency(Number(s.price))}</TD>
                  <TD>{formatCurrency(Number(s.cost))}</TD>
                  <TD>{s.durationMin} min</TD>
                  <TD>{s.warrantyDays} dias</TD>
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
                            await deleteService(s.id);
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
        title={editing ? "Editar serviço" : "Novo serviço"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input name="name" required defaultValue={editing?.name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input name="category" defaultValue={editing?.category ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço (R$) *</Label>
              <Input
                name="price"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={Number(editing?.price ?? 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Custo (R$)</Label>
              <Input
                name="cost"
                type="number"
                min={0}
                step="0.01"
                defaultValue={Number(editing?.cost ?? 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input
                name="durationMin"
                type="number"
                min={0}
                defaultValue={editing?.durationMin ?? 60}
              />
            </div>
            <div className="space-y-2">
              <Label>Garantia (dias)</Label>
              <Input
                name="warrantyDays"
                type="number"
                min={0}
                defaultValue={editing?.warrantyDays ?? 0}
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
