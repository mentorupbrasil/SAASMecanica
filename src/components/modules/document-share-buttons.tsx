"use client";

import { MessageCircle, Printer } from "lucide-react";
import {
  buildPrintBodyHtml,
  buildWhatsAppUrl,
  dbItemsToDraft,
  formatDocumentText,
  printHtmlDocument,
} from "@/lib/line-items";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocumentItem = {
  type: string;
  description: string;
  quantity: unknown;
  unitPrice: unknown;
};

type DocumentShareButtonsProps = {
  docType: "OS" | "ORCAMENTO";
  number: number;
  customerName: string;
  customerPhone: string | null;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear?: number | null;
  items: DocumentItem[];
  total: number;
  notes?: string | null;
  complaint?: string | null;
  subtitle?: string;
};

export function DocumentShareButtons({
  docType,
  number,
  customerName,
  customerPhone,
  vehiclePlate,
  vehicleBrand,
  vehicleModel,
  vehicleYear,
  items,
  total,
  notes,
  complaint,
  subtitle,
}: DocumentShareButtonsProps) {
  const drafts = dbItemsToDraft(items);
  const vehicleLabel = `${vehicleBrand} ${vehicleModel}${vehicleYear ? ` (${vehicleYear})` : ""}`;
  const title = docType === "OS" ? `Ordem de Serviço #${number}` : `Orçamento #${number}`;

  const whatsappText = formatDocumentText({
    type: docType,
    number,
    customerName,
    vehiclePlate,
    vehicleLabel,
    items: drafts,
    total,
    notes,
    complaint,
  });

  const whatsappUrl = buildWhatsAppUrl(customerPhone, whatsappText);

  function handlePrint() {
    const body = buildPrintBodyHtml({
      title,
      subtitle,
      meta: [
        { label: "Cliente", value: customerName },
        { label: "Veículo", value: `${vehiclePlate} — ${vehicleLabel}` },
        ...(complaint ? [{ label: "Reclamação", value: complaint }] : []),
      ],
      items: drafts,
      total,
      notes,
    });
    printHtmlDocument(title, body);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
        </a>
      ) : (
        <Button variant="outline" size="sm" disabled title="Cliente sem telefone cadastrado">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={handlePrint} disabled={items.length === 0}>
        <Printer className="h-4 w-4" /> Imprimir
      </Button>
    </div>
  );
}
