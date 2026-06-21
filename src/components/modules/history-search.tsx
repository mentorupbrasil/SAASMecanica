"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTable,
  Table,
  TBody,
  TD,
  THead,
  TH,
  TR,
} from "@/components/crud/data-table";
import { formatCurrency } from "@/lib/utils";

type VehicleHistory = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  mileage: number | null;
  customer: { name: string; phone: string | null };
  workOrders: {
    id: string;
    number: number;
    status: string;
    openedAt: Date;
    finishedAt: Date | null;
    total: unknown;
    items: {
      type: string;
      description: string;
      quantity: unknown;
      total: unknown;
    }[];
    warranties: {
      type: string;
      description: string;
      endDate: Date;
      status: string;
    }[];
  }[];
};

const orderStatus: Record<string, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  WAITING_PARTS: "Aguardando peças",
  FINISHED: "Finalizada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

export function HistorySearch({
  plate,
  vehicle,
}: {
  plate?: string;
  vehicle: VehicleHistory | null;
}) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = String(fd.get("plate") ?? "").trim();
    if (p) router.push(`/historico?plate=${encodeURIComponent(p)}`);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="plate">Placa do veículo</Label>
          <Input
            id="plate"
            name="plate"
            defaultValue={plate ?? ""}
            placeholder="ABC1D23"
            className="uppercase"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit">
            <Search className="h-4 w-4" /> Buscar
          </Button>
        </div>
      </form>

      {plate && !vehicle && (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Nenhum veículo encontrado para a placa &quot;{plate.toUpperCase()}&quot;
          </CardContent>
        </Card>
      )}

      {vehicle && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {vehicle.plate} — {vehicle.brand} {vehicle.model}
                {vehicle.year ? ` (${vehicle.year})` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-slate-600 md:grid-cols-3">
              <div>
                <span className="font-medium text-slate-800">Cliente:</span> {vehicle.customer.name}
              </div>
              <div>
                <span className="font-medium text-slate-800">Telefone:</span>{" "}
                {vehicle.customer.phone ?? "—"}
              </div>
              <div>
                <span className="font-medium text-slate-800">Km atual:</span>{" "}
                {vehicle.mileage?.toLocaleString("pt-BR") ?? "—"}
              </div>
            </CardContent>
          </Card>

          {vehicle.workOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                Nenhuma ordem de serviço registrada
              </CardContent>
            </Card>
          ) : (
            vehicle.workOrders.map((wo) => (
              <Card key={wo.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      OS #{wo.number}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge>{orderStatus[wo.status] ?? wo.status}</Badge>
                      <span className="text-sm font-medium text-orange-600">
                        {formatCurrency(Number(wo.total))}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Aberta em {new Date(wo.openedAt).toLocaleDateString("pt-BR")}
                    {wo.finishedAt &&
                      ` · Finalizada em ${new Date(wo.finishedAt).toLocaleDateString("pt-BR")}`}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wo.items.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Itens</p>
                      <DataTable>
                        <Table>
                          <THead>
                            <TR>
                              <TH>Tipo</TH>
                              <TH>Descrição</TH>
                              <TH>Qtd</TH>
                              <TH>Total</TH>
                            </TR>
                          </THead>
                          <TBody>
                            {wo.items.map((item, i) => (
                              <TR key={i}>
                                <TD>
                                  <Badge variant={item.type === "SERVICE" ? "orange" : "info"}>
                                    {item.type === "SERVICE" ? "Serviço" : "Peça"}
                                  </Badge>
                                </TD>
                                <TD>{item.description}</TD>
                                <TD>{Number(item.quantity)}</TD>
                                <TD>{formatCurrency(Number(item.total))}</TD>
                              </TR>
                            ))}
                          </TBody>
                        </Table>
                      </DataTable>
                    </div>
                  )}

                  {wo.warranties.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Garantias</p>
                      <div className="space-y-2">
                        {wo.warranties.map((w, i) => (
                          <div
                            key={i}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3 text-sm"
                          >
                            <div>
                              <Badge variant={w.type === "PART" ? "info" : "orange"}>
                                {w.type === "PART" ? "Peça" : "Serviço"}
                              </Badge>{" "}
                              {w.description}
                            </div>
                            <div className="text-slate-500">
                              Válida até {new Date(w.endDate).toLocaleDateString("pt-BR")} ·{" "}
                              {w.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}
