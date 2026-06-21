import { notFound } from "next/navigation";
import { getQuoteByToken } from "@/lib/actions/quotes";
import { QuoteApprovalForm } from "@/components/modules/quote-approval-form";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ token: string }> };

export default async function AprovacaoPage({ params }: Props) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);
  if (!quote) notFound();

  const statusLabel: Record<string, string> = {
    PENDING: "Aguardando",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
    CONVERTED: "Convertido em OS",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-orange-50 p-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">{quote.tenant.name}</p>
        <h1 className="mt-1 text-2xl font-bold">Orçamento #{quote.number}</h1>
        <Badge variant="info" className="mt-2">
          {statusLabel[quote.status] ?? quote.status}
        </Badge>

        <div className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-4 text-sm">
          <div>
            <span className="text-slate-500">Cliente: </span>
            {quote.customer.name}
          </div>
          <div>
            <span className="text-slate-500">Veículo: </span>
            {quote.vehicle.plate} — {quote.vehicle.brand} {quote.vehicle.model}
          </div>
          {quote.validUntil && (
            <div>
              <span className="text-slate-500">Válido até: </span>
              {quote.validUntil.toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Item</th>
              <th className="py-2">Qtd</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2">{item.description}</td>
                <td className="py-2">{Number(item.quantity)}</td>
                <td className="py-2 text-right">{formatCurrency(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-orange-600">{formatCurrency(Number(quote.total))}</span>
        </div>

        {quote.status === "PENDING" && (
          <QuoteApprovalForm token={token} />
        )}

        {quote.status === "APPROVED" && (
          <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-center text-emerald-700">
            Orçamento aprovado em {quote.approvedAt?.toLocaleDateString("pt-BR")}. A oficina dará continuidade ao serviço.
          </p>
        )}
      </div>
    </div>
  );
}
