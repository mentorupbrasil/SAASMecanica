"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import {
  addQuoteItem,
  approveQuote,
  convertQuoteToWorkOrder,
  rejectQuote,
  removeQuoteItem,
  sendQuote,
} from "@/lib/actions/quotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  EXPIRED: "Expirado",
  CONVERTED: "Convertido",
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "danger" | "info" | "orange"> = {
  DRAFT: "default",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CONVERTED: "success",
};

type ServiceOption = { id: string; name: string; price: unknown };
type ProductOption = { id: string; name: string; salePrice: unknown };

type Quote = {
  id: string;
  number: number;
  status: string;
  subtotal: unknown;
  discount: unknown;
  total: unknown;
  validUntil: Date | null;
  notes: string | null;
  approvalToken: string | null;
  approvedAt: Date | null;
  approvedByName: string | null;
  rejectionReason: string | null;
  convertedOsId: string | null;
  createdAt: Date;
  customer: { name: string; phone: string | null };
  vehicle: { plate: string; brand: string; model: string };
  workOrder: { id: string; number: number } | null;
  items: {
    id: string;
    type: string;
    description: string;
    quantity: unknown;
    unitPrice: unknown;
    total: unknown;
  }[];
};

export function QuoteDetail({
  quote,
  services,
  products,
}: {
  quote: Quote;
  services: ServiceOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [itemType, setItemType] = useState<"SERVICE" | "PART">("SERVICE");
  const [approvalLink, setApprovalLink] = useState<string | null>(
    quote.approvalToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/aprovacao/${quote.approvalToken}`
      : null,
  );

  function refresh() {
    router.refresh();
  }

  function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("quoteId", quote.id);
    startTransition(async () => {
      await addQuoteItem(fd);
      (e.target as HTMLFormElement).reset();
      refresh();
    });
  }

  const canEdit = quote.status === "DRAFT" || quote.status === "PENDING";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Orçamento #{quote.number}</h2>
              <p className="text-sm text-slate-500">
                Criado em {new Date(quote.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[quote.status] ?? "default"} className="text-sm">
              {STATUS_LABELS[quote.status] ?? quote.status}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Cliente</p>
              <p className="font-medium">{quote.customer.name}</p>
              <p className="text-sm text-slate-500">{quote.customer.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Veículo</p>
              <p className="font-medium">{quote.vehicle.plate}</p>
              <p className="text-sm text-slate-500">
                {quote.vehicle.brand} {quote.vehicle.model}
              </p>
            </div>
            {quote.validUntil ? (
              <div>
                <p className="text-xs uppercase text-slate-400">Validade</p>
                <p className="font-medium">
                  {new Date(quote.validUntil).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ) : null}
            {quote.workOrder ? (
              <div>
                <p className="text-xs uppercase text-slate-400">OS convertida</p>
                <Link href={`/ordens/${quote.workOrder.id}`} className="font-medium text-orange-600 hover:underline">
                  OS #{quote.workOrder.number}
                </Link>
              </div>
            ) : null}
          </div>

          {quote.notes ? (
            <p className="mt-4 text-sm text-slate-600">{quote.notes}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase text-slate-400">Total</p>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(Number(quote.total))}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Subtotal: {formatCurrency(Number(quote.subtotal))}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending || quote.status !== "DRAFT"}
          onClick={() =>
            startTransition(async () => {
              const token = await sendQuote(quote.id);
              const link = `${window.location.origin}/aprovacao/${token}`;
              setApprovalLink(link);
              refresh();
            })
          }
        >
          Enviar ao cliente
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending || quote.status === "APPROVED" || quote.status === "CONVERTED"}
          onClick={() =>
            startTransition(async () => {
              await approveQuote(quote.id);
              refresh();
            })
          }
        >
          Aprovar
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending || quote.status === "REJECTED" || quote.status === "CONVERTED"}
          onClick={() =>
            startTransition(async () => {
              await rejectQuote(quote.id, "Rejeitado pela oficina");
              refresh();
            })
          }
        >
          Rejeitar
        </Button>
        <Button
          size="sm"
          disabled={pending || quote.status !== "APPROVED" || !!quote.convertedOsId}
          onClick={() =>
            startTransition(async () => {
              const woId = await convertQuoteToWorkOrder(quote.id);
              router.push(`/ordens/${woId}`);
            })
          }
        >
          Converter em OS
        </Button>
      </div>

      {(approvalLink || quote.approvalToken) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="mb-2 text-sm font-medium text-blue-800">Link de aprovação</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 break-all rounded bg-white px-3 py-2 text-sm text-blue-900">
              {approvalLink ?? `/aprovacao/${quote.approvalToken}`}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const text = approvalLink ?? `${window.location.origin}/aprovacao/${quote.approvalToken}`;
                navigator.clipboard.writeText(text);
              }}
            >
              <Copy className="h-4 w-4" /> Copiar
            </Button>
          </div>
          {quote.approvalToken && (
            <p className="mt-2 text-xs text-blue-600">Token: {quote.approvalToken}</p>
          )}
        </div>
      )}

      {quote.approvedAt && (
        <p className="text-sm text-emerald-600">
          Aprovado em {new Date(quote.approvedAt).toLocaleString("pt-BR")}
          {quote.approvedByName ? ` por ${quote.approvedByName}` : ""}
        </p>
      )}

      {quote.rejectionReason && (
        <p className="text-sm text-red-600">Motivo: {quote.rejectionReason}</p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold">Itens do orçamento</h3>

        {canEdit && (
          <form onSubmit={addItem} className="mb-4 flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                name="type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as "SERVICE" | "PART")}
                className="w-36"
              >
                <option value="SERVICE">Serviço</option>
                <option value="PART">Peça</option>
              </Select>
            </div>
            <div className="min-w-[200px] flex-1 space-y-1">
              <Label>{itemType === "SERVICE" ? "Serviço" : "Peça"}</Label>
              <Select name="refId" required className="w-full">
                <option value="">Selecione</option>
                {itemType === "SERVICE"
                  ? services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatCurrency(Number(s.price))}
                      </option>
                    ))
                  : products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(Number(p.salePrice))}
                      </option>
                    ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Qtd</Label>
              <Input name="quantity" type="number" min={1} step={1} defaultValue={1} className="w-20" />
            </div>
            <Button type="submit" disabled={pending}>
              Adicionar
            </Button>
          </form>
        )}

        <DataTable>
          <Table>
            <THead>
              <TR>
                <TH>Tipo</TH>
                <TH>Descrição</TH>
                <TH>Qtd</TH>
                <TH>Unitário</TH>
                <TH>Total</TH>
                {canEdit && <TH className="w-12">&nbsp;</TH>}
              </TR>
            </THead>
            <TBody>
              {quote.items.length === 0 ? (
                <EmptyRow colSpan={canEdit ? 6 : 5} message="Nenhum item adicionado" />
              ) : (
                quote.items.map((item) => (
                  <TR key={item.id}>
                    <TD>
                      <Badge variant={item.type === "SERVICE" ? "info" : "default"}>
                        {item.type === "SERVICE" ? "Serviço" : "Peça"}
                      </Badge>
                    </TD>
                    <TD>{item.description}</TD>
                    <TD>{Number(item.quantity)}</TD>
                    <TD>{formatCurrency(Number(item.unitPrice))}</TD>
                    <TD>{formatCurrency(Number(item.total))}</TD>
                    {canEdit && (
                      <TD>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              await removeQuoteItem(item.id, quote.id);
                              refresh();
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TD>
                    )}
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </DataTable>
      </div>
    </div>
  );
}
