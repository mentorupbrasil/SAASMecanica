import Link from "next/link";
import {
  CalendarPlus,
  ClipboardList,
  FileText,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    href: "/ordens/nova",
    label: "Nova OS",
    description: "Entrada do veículo na oficina",
    icon: ClipboardList,
    color: "bg-orange-600",
  },
  {
    href: "/orcamentos/nova",
    label: "Novo orçamento",
    description: "Enviar proposta ao cliente",
    icon: FileText,
    color: "bg-blue-600",
  },
  {
    href: "/agenda",
    label: "Agendar",
    description: "Marcar atendimento",
    icon: CalendarPlus,
    color: "bg-emerald-600",
  },
  {
    href: "/clientes",
    label: "Novo cliente",
    description: "Cadastrar cliente",
    icon: UserPlus,
    color: "bg-violet-600",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ações rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-sm)] transition-all hover:border-orange-200 hover:shadow-[var(--shadow-md)]"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.color} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-orange-600">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
