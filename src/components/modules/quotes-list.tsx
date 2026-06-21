"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  SENT: "info",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  EXPIRED: "orange",
  CONVERTED: "success",
};

type Quote = {
  id: string;
  number: number;
  status: string;
  total: unknown;
  validUntil: Date | null;
  createdAt: Date;
  customer: { name: string };
  vehicle: { plate: string; brand: string; model: string };
  _count: { items: number };
};

export function QuotesList({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "ALL";

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete("status");
    else params.set("status", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-48"
        >
          <option value="ALL">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Link href="/orcamentos/nova">
          <Button>
            <Plus className="h-4 w-4" /> Novo orçamento
          </Button>
        </Link>
      </div>

      <DataTable>
        <Table>
          <THead>
            <TR>
              <TH>Nº</TH>
              <TH>Cliente</TH>
              <TH>Veículo</TH>
              <TH>Status</TH>
              <TH>Itens</TH>
              <TH>Total</TH>
              <TH>Validade</TH>
              <TH>Criado em</TH>
            </TR>
          </THead>
          <TBody>
            {quotes.length === 0 ? (
              <EmptyRow colSpan={8} message="Nenhum orçamento encontrado" />
            ) : (
              quotes.map((q) => (
                <TR key={q.id}>
                  <TD>
                    <Link
                      href={`/orcamentos/${q.id}`}
                      className="font-medium text-orange-600 hover:underline"
                    >
                      #{q.number}
                    </Link>
                  </TD>
                  <TD>{q.customer.name}</TD>
                  <TD>
                    <div>{q.vehicle.plate}</div>
                    <div className="text-xs text-slate-400">
                      {q.vehicle.brand} {q.vehicle.model}
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={STATUS_VARIANTS[q.status] ?? "default"}>
                      {STATUS_LABELS[q.status] ?? q.status}
                    </Badge>
                  </TD>
                  <TD>{q._count.items}</TD>
                  <TD>{formatCurrency(Number(q.total))}</TD>
                  <TD>
                    {q.validUntil
                      ? new Date(q.validUntil).toLocaleDateString("pt-BR")
                      : "—"}
                  </TD>
                  <TD>{new Date(q.createdAt).toLocaleDateString("pt-BR")}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </DataTable>
    </>
  );
}
