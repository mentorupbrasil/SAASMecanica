"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createExpense,
  createPayable,
  markPayablePaid,
  markReceivablePaid,
} from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/crud/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Payable = {
  id: string;
  description: string;
  amount: unknown;
  paidAmount: unknown;
  dueDate: Date;
  status: string;
  category: string | null;
  supplier: { name: string } | null;
};

type Receivable = {
  id: string;
  description: string;
  amount: unknown;
  paidAmount: unknown;
  dueDate: Date;
  status: string;
  customer: { name: string };
  workOrder: { number: number } | null;
};

type CashFlow = {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: unknown;
  date: Date;
};

type SupplierOption = { id: string; name: string };

const paymentStatus: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  PENDING: { label: "Pendente", variant: "warning" },
  PAID: { label: "Pago", variant: "success" },
  OVERDUE: { label: "Vencido", variant: "danger" },
  PARTIAL: { label: "Parcial", variant: "info" },
};

type Tab = "receivables" | "payables" | "cashflow";

export function FinanceManager({
  summary,
  payables,
  receivables,
  cashFlow,
  suppliers,
}: {
  summary: {
    totalReceivable: number;
    totalPayable: number;
    balance: number;
    monthIncome: number;
    monthExpense: number;
    overdueReceivables: number;
  };
  payables: Payable[];
  receivables: Receivable[];
  cashFlow: CashFlow[];
  suppliers: SupplierOption[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("receivables");
  const [payableOpen, setPayableOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handlePayable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createPayable(fd);
      setPayableOpen(false);
      router.refresh();
    });
  }

  async function handleExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createExpense(fd);
      setExpenseOpen(false);
      router.refresh();
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "receivables", label: "A receber" },
    { id: "payables", label: "A pagar" },
    { id: "cashflow", label: "Fluxo de caixa" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">A receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalReceivable)}
            </p>
            {summary.overdueReceivables > 0 && (
              <p className="mt-1 text-xs text-red-500">
                {summary.overdueReceivables} título(s) vencido(s)
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">A pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalPayable)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Saldo do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(summary.balance)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Entradas {formatCurrency(summary.monthIncome)} · Saídas {formatCurrency(summary.monthExpense)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExpenseOpen(true)}>
            <Plus className="h-4 w-4" /> Despesa
          </Button>
          <Button size="sm" onClick={() => setPayableOpen(true)}>
            <Plus className="h-4 w-4" /> Conta a pagar
          </Button>
        </div>
      </div>

      {tab === "receivables" && (
        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Cliente</TH>
                <TH>Descrição</TH>
                <TH>OS</TH>
                <TH>Vencimento</TH>
                <TH>Valor</TH>
                <TH>Status</TH>
                <TH className="w-24">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {receivables.length === 0 ? (
                <EmptyRow colSpan={7} message="Nenhum título a receber" />
              ) : (
                receivables.map((r) => {
                  const st = paymentStatus[r.status] ?? { label: r.status, variant: "default" as const };
                  const remaining = Number(r.amount) - Number(r.paidAmount);
                  return (
                    <TR key={r.id}>
                      <TD>{r.customer.name}</TD>
                      <TD>{r.description}</TD>
                      <TD>{r.workOrder ? `#${r.workOrder.number}` : "—"}</TD>
                      <TD>{new Date(r.dueDate).toLocaleDateString("pt-BR")}</TD>
                      <TD>{formatCurrency(remaining)}</TD>
                      <TD>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TD>
                      <TD>
                        {r.status !== "PAID" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                await markReceivablePaid(r.id);
                                router.refresh();
                              })
                            }
                          >
                            Baixar
                          </Button>
                        )}
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </DataTable>
      )}

      {tab === "payables" && (
        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Fornecedor</TH>
                <TH>Descrição</TH>
                <TH>Categoria</TH>
                <TH>Vencimento</TH>
                <TH>Valor</TH>
                <TH>Status</TH>
                <TH className="w-24">Ações</TH>
              </TR>
            </THead>
            <TBody>
              {payables.length === 0 ? (
                <EmptyRow colSpan={7} message="Nenhuma conta a pagar" />
              ) : (
                payables.map((p) => {
                  const st = paymentStatus[p.status] ?? { label: p.status, variant: "default" as const };
                  const remaining = Number(p.amount) - Number(p.paidAmount);
                  return (
                    <TR key={p.id}>
                      <TD>{p.supplier?.name ?? "—"}</TD>
                      <TD>{p.description}</TD>
                      <TD>{p.category ?? "—"}</TD>
                      <TD>{new Date(p.dueDate).toLocaleDateString("pt-BR")}</TD>
                      <TD>{formatCurrency(remaining)}</TD>
                      <TD>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TD>
                      <TD>
                        {p.status !== "PAID" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                await markPayablePaid(p.id);
                                router.refresh();
                              })
                            }
                          >
                            Baixar
                          </Button>
                        )}
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </DataTable>
      )}

      {tab === "cashflow" && (
        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Data</TH>
                <TH>Tipo</TH>
                <TH>Categoria</TH>
                <TH>Descrição</TH>
                <TH>Valor</TH>
              </TR>
            </THead>
            <TBody>
              {cashFlow.length === 0 ? (
                <EmptyRow colSpan={5} message="Nenhum lançamento" />
              ) : (
                cashFlow.map((c) => (
                  <TR key={c.id}>
                    <TD>{new Date(c.date).toLocaleDateString("pt-BR")}</TD>
                    <TD>
                      <Badge variant={c.type === "INCOME" ? "success" : "danger"}>
                        {c.type === "INCOME" ? "Entrada" : "Saída"}
                      </Badge>
                    </TD>
                    <TD>{c.category}</TD>
                    <TD>{c.description}</TD>
                    <TD className={c.type === "INCOME" ? "text-emerald-600" : "text-red-600"}>
                      {c.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(Number(c.amount))}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </DataTable>
      )}

      <Modal open={payableOpen} onClose={() => setPayableOpen(false)} title="Nova conta a pagar">
        <form onSubmit={handlePayable} className="space-y-4">
          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Select name="supplierId">
              <option value="">Nenhum</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input name="description" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input name="amount" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-2">
              <Label>Vencimento *</Label>
              <Input name="dueDate" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input name="category" placeholder="Ex: Peças, Aluguel..." />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Modal>

      <Modal open={expenseOpen} onClose={() => setExpenseOpen(false)} title="Nova despesa">
        <form onSubmit={handleExpense} className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input name="description" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input name="amount" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input name="category" defaultValue="Despesas" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Lançar despesa"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
