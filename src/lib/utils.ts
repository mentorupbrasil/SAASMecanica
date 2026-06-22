import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDocument(doc: string) {
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }
  return doc;
}

export function formatPlate(plate: string) {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const num = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Aberta",
    DIAGNOSIS: "Diagnóstico",
    WAITING_APPROVAL: "Aguard. aprovação",
    WAITING_PARTS: "Aguard. peças",
    IN_PROGRESS: "Em execução",
    QUALITY_CHECK: "Controle qualidade",
    FINISHED: "Finalizada",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelada",
    DRAFT: "Rascunho",
  };
  return labels[status] ?? status;
}
