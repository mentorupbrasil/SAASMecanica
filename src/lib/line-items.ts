import { formatCurrency } from "@/lib/utils";

export type LineItemDraft = {
  id: string;
  type: "SERVICE" | "PART" | "OTHER";
  refId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export function lineItemTotal(item: Pick<LineItemDraft, "quantity" | "unitPrice">) {
  return item.quantity * item.unitPrice;
}

export function sumLineItems(items: LineItemDraft[]) {
  return items.reduce((s, i) => s + lineItemTotal(i), 0);
}

export function parseItemsJson(formData: FormData): LineItemDraft[] {
  const raw = String(formData.get("items") ?? "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LineItemDraft[];
  } catch {
    return [];
  }
}

export function dbItemsToDraft(
  items: { type: string; description: string; quantity: unknown; unitPrice: unknown }[],
): LineItemDraft[] {
  return items.map((item, index) => ({
    id: String(index),
    type: item.type as LineItemDraft["type"],
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));
}

export function buildWhatsAppUrl(phone: string | null | undefined, text: string) {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const wa = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}

export function buildPrintBodyHtml(opts: {
  title: string;
  subtitle?: string;
  meta: { label: string; value: string }[];
  items: LineItemDraft[];
  total: number;
  notes?: string | null;
}) {
  const metaHtml = opts.meta
    .map((m) => `<p><strong>${m.label}:</strong> ${m.value}</p>`)
    .join("");
  const rows = opts.items
    .map((item) => {
      const typeLabel =
        item.type === "SERVICE" ? "Serviço" : item.type === "PART" ? "Peça" : "Terceiro";
      return `<tr>
        <td>${typeLabel}</td>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.unitPrice)}</td>
        <td>${formatCurrency(lineItemTotal(item))}</td>
      </tr>`;
    })
    .join("");

  return `
    <h1>${opts.title}</h1>
    ${opts.subtitle ? `<p class="meta">${opts.subtitle}</p>` : ""}
    <div class="meta">${metaHtml}</div>
    <table>
      <thead><tr><th>Tipo</th><th>Descrição</th><th>Qtd</th><th>Unitário</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="total">Total: ${formatCurrency(opts.total)}</p>
    ${opts.notes ? `<p class="meta">Obs: ${opts.notes}</p>` : ""}
  `;
}

export function formatDocumentText(opts: {
  type: "OS" | "ORCAMENTO";
  number: number;
  customerName: string;
  vehiclePlate: string;
  vehicleLabel: string;
  items: LineItemDraft[];
  total: number;
  notes?: string | null;
  complaint?: string | null;
}) {
  const header =
    opts.type === "OS"
      ? `*Ordem de Serviço #${opts.number}*`
      : `*Orçamento #${opts.number}*`;

  const lines = [
    header,
    `Cliente: ${opts.customerName}`,
    `Veículo: ${opts.vehiclePlate} — ${opts.vehicleLabel}`,
    "",
  ];

  if (opts.complaint) {
    lines.push(`Reclamação: ${opts.complaint}`, "");
  }

  lines.push("*Itens:*");
  for (const item of opts.items) {
    const typeLabel =
      item.type === "SERVICE" ? "Serviço" : item.type === "PART" ? "Peça" : "Terceiro";
    lines.push(
      `• ${item.description} (${typeLabel})`,
      `  ${item.quantity}x ${formatCurrency(item.unitPrice)} = ${formatCurrency(lineItemTotal(item))}`,
    );
  }

  lines.push("", `*Total: ${formatCurrency(opts.total)}*`);

  if (opts.notes) {
    lines.push("", `Obs: ${opts.notes}`);
  }

  return lines.join("\n");
}

export function printHtmlDocument(title: string, bodyHtml: string) {
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 13px; }
      th { background: #f8fafc; }
      .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 16px; }
      @media print { body { padding: 16px; } }
    </style></head><body>${bodyHtml}</body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
