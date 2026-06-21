"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, UserCheck, UserX } from "lucide-react";
import {
  createTenantUser,
  toggleUserActive,
  updateTenantUser,
} from "@/lib/actions/admin";
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

const roleLabels: Record<string, string> = {
  OWNER: "Proprietário",
  MANAGER: "Gerente",
  ADVISOR: "Consultor",
  MECHANIC: "Mecânico",
  STOCK: "Estoque",
  FINANCE: "Financeiro",
  RECEPTION: "Recepção",
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export function AdminUsersManager({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) await updateTenantUser(editing.id, fd);
      else await createTenantUser(fd);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Novo usuário
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>E-mail</TH>
              <TH>Perfil</TH>
              <TH>Status</TH>
              <TH>Último login</TH>
              <TH className="w-28">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {users.length === 0 ? (
              <EmptyRow colSpan={6} message="Nenhum usuário" />
            ) : (
              users.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-slate-400">{u.phone ?? ""}</div>
                  </TD>
                  <TD>{u.email}</TD>
                  <TD>
                    <Badge variant="orange">{roleLabels[u.role] ?? u.role}</Badge>
                  </TD>
                  <TD>
                    <Badge variant={u.active ? "success" : "danger"}>
                      {u.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TD>
                  <TD>
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString("pt-BR")
                      : "—"}
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditing(u); setOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            await toggleUserActive(u.id, !u.active);
                            router.refresh();
                          })
                        }
                      >
                        {u.active ? (
                          <UserX className="h-4 w-4 text-red-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-emerald-500" />
                        )}
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
        title={editing ? "Editar usuário" : "Novo usuário"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input name="name" defaultValue={editing?.name} required />
          </div>
          {!editing && (
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input name="email" type="email" required />
            </div>
          )}
          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select name="role" defaultValue={editing?.role ?? "RECEPTION"}>
              {Object.entries(roleLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input name="phone" defaultValue={editing?.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>{editing ? "Nova senha (opcional)" : "Senha"}</Label>
            <Input
              name="password"
              type="password"
              required={!editing}
              minLength={6}
              placeholder={editing ? "Deixe vazio para manter" : "Mínimo 6 caracteres"}
            />
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={editing.active}
              />
              Usuário ativo
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
