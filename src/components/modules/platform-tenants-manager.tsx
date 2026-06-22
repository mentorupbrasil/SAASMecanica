"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Power, PowerOff } from "lucide-react";
import { createTenantForClient, setTenantActive } from "@/lib/actions/platform";
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

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  active: boolean;
  createdAt: Date;
  _count: { users: number; customers: number; workOrders: number };
  users: { name: string; email: string; lastLoginAt: Date | null }[];
};

export function PlatformTenantsManager({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createTenantForClient(fd);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar empresa");
      }
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Cada empresa é um ambiente isolado. O cliente entra só com o e-mail que você cadastrar —{" "}
          <strong>não há menu para trocar de empresa</strong> no login.
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nova empresa
        </Button>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Empresa</TH>
              <TH>Proprietário</TH>
              <TH>Plano</TH>
              <TH>Usuários</TH>
              <TH>OS</TH>
              <TH>Status</TH>
              <TH className="w-24">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {tenants.length === 0 ? (
              <EmptyRow colSpan={7} message="Nenhuma empresa cadastrada" />
            ) : (
              tenants.map((t) => {
                const owner = t.users[0];
                return (
                  <TR key={t.id}>
                    <TD>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-slate-400">ID: {t.slug}</div>
                    </TD>
                    <TD>
                      <div>{owner?.name ?? "—"}</div>
                      <div className="text-xs text-slate-400">{owner?.email ?? ""}</div>
                    </TD>
                    <TD>
                      <Badge variant="default">{t.plan}</Badge>
                    </TD>
                    <TD>{t._count.users}</TD>
                    <TD>{t._count.workOrders}</TD>
                    <TD>
                      <Badge variant={t.active ? "success" : "danger"}>
                        {t.active ? "Ativa" : "Suspensa"}
                      </Badge>
                    </TD>
                    <TD>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t.active ? "Suspender acesso" : "Reativar"}
                        onClick={() =>
                          startTransition(async () => {
                            await setTenantActive(t.id, !t.active);
                            router.refresh();
                          })
                        }
                      >
                        {t.active ? (
                          <PowerOff className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Power className="h-4 w-4 text-emerald-600" />
                        )}
                      </Button>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova empresa (cliente)">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Você cria a empresa e o login do proprietário. Ele personaliza nome, logo e endereço em{" "}
            <strong>Admin → Dados da oficina</strong>.
          </div>

          <div className="space-y-2">
            <Label>Nome da empresa *</Label>
            <Input name="workshopName" required placeholder="Eletromecânica Silva" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CNPJ (opcional)</Label>
              <Input name="document" placeholder="00.000.000/0001-00" />
            </div>
            <div className="space-y-2">
              <Label>Telefone (opcional)</Label>
              <Input name="phone" placeholder="(11) 99999-0000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Plano</Label>
            <Select name="plan" defaultValue="PROFESSIONAL">
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </Select>
          </div>

          <hr className="border-slate-200" />

          <p className="text-sm font-medium text-slate-700">Acesso do proprietário</p>

          <div className="space-y-2">
            <Label>Nome do responsável *</Label>
            <Input name="ownerName" required placeholder="João Silva" />
          </div>
          <div className="space-y-2">
            <Label>E-mail de login *</Label>
            <Input name="ownerEmail" type="email" required placeholder="joao@empresa.com" />
          </div>
          <div className="space-y-2">
            <Label>Senha inicial *</Label>
            <Input name="ownerPassword" type="password" required minLength={6} />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            <Building2 className="h-4 w-4" />
            {pending ? "Criando..." : "Criar empresa e liberar acesso"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
