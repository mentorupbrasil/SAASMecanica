import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Car,
  ClipboardList,
  FileText,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    n: 1,
    title: "Cliente chegou",
    text: "Primeira vez? Cadastre cliente + veículo. Já é cliente? Pule direto para a OS.",
    links: [
      { href: "/clientes", label: "Cadastrar cliente", icon: UserPlus },
      { href: "/veiculos", label: "Cadastrar veículo", icon: Car },
    ],
  },
  {
    n: 2,
    title: "Entrada do veículo",
    text: "Abrir OS = dar entrada. Não existe tela separada de check-in — a OS registra km, reclamação e coloca o carro no Kanban.",
    links: [{ href: "/ordens/nova", label: "Nova OS (entrada)", icon: ClipboardList }],
  },
  {
    n: 3,
    title: "Diagnóstico e orçamento na OS",
    text: "A equipe técnica analisa (mecânica e/ou elétrica), adiciona peças e serviços na OS. Se o cliente precisa aprovar antes, mude o status para Aguard. aprovação.",
    links: [{ href: "/kanban", label: "Ver no Kanban", icon: ClipboardList }],
  },
  {
    n: 4,
    title: "Execução e entrega",
    text: "Aprovado → Em execução → Finalizar OS. O sistema baixa estoque e gera conta a receber automaticamente.",
    links: [{ href: "/ordens", label: "Ordens de serviço", icon: ClipboardList }],
  },
];

export function AttendanceGuide() {
  return (
    <Card className="border-orange-200/60 bg-gradient-to-br from-orange-50/50 via-white to-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]">
      <CardHeader>
        <CardTitle className="text-lg">Como atender — fluxo da eletromecânica</CardTitle>
        <CardDescription>
          Regra de ouro: <strong>cliente na porta → Nova OS</strong>. Orçamento separado só quando o cliente
          ainda não deixou o carro ou quer aprovar antes de começar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="mb-2 text-sm font-bold text-emerald-800">
              Cenário A — Cliente chegou (90% dos casos)
            </p>
            <ol className="space-y-1 text-sm text-emerald-900">
              <li>1. Busque cliente/placa no topo ou cadastre se for novo</li>
              <li>2. <strong>Nova OS</strong> → km + o que o cliente reclamou</li>
              <li>3. Diagnóstico mecânico/elétrico → peças e serviços na OS</li>
              <li>4. Kanban até entregar o veículo</li>
            </ol>
            <Link href="/ordens/nova" className="mt-3 inline-block">
              <Button size="sm">
                Iniciar atendimento <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="mb-2 text-sm font-bold text-blue-800">
              Cenário B — Só quer orçamento (WhatsApp / telefone)
            </p>
            <ol className="space-y-1 text-sm text-blue-900">
              <li>1. <strong>Novo orçamento</strong> → peças e serviços</li>
              <li>2. Envie link de aprovação ao cliente</li>
              <li>3. Aprovou → botão &quot;Converter em OS&quot;</li>
              <li>4. Cliente traz o carro → continua na OS</li>
            </ol>
            <Link href="/orcamentos/nova" className="mt-3 inline-block">
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4" /> Novo orçamento
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-violet-800">
            <Calendar className="h-4 w-4" />
            Cenário C — Cliente agendado
          </p>
          <p className="text-sm text-violet-900">
            Na hora marcada: confirme na <Link href="/agenda" className="font-semibold underline">Agenda</Link>,
            depois abra a <strong>Nova OS</strong> — mesma coisa que o cenário A.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                {s.n}
              </div>
              <p className="text-sm font-semibold text-slate-900">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-xs font-medium text-orange-600 hover:underline"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Não faça:</strong> abrir orçamento e OS ao mesmo tempo para o mesmo carro · cadastrar cliente
          de novo se já existe · pular a OS quando o veículo está na oficina (a OS é a entrada oficial).
        </div>
      </CardContent>
    </Card>
  );
}
