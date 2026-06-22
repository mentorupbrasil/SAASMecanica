import { Wrench, CheckCircle2 } from "lucide-react";
import { WORKSHOP_TAGLINE } from "@/lib/workshop-labels";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const features = [
  "Mecânica, elétrica e diagnóstico na OS",
  "Orçamentos com aprovação digital",
  "Estoque, financeiro e equipe técnica",
  "Multi-usuário por oficina",
];

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden w-[44%] overflow-hidden bg-[#0c0f14] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,88,12,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-500/30">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SAASMecanica</span>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
              Gestão profissional
              <br />
              para sua eletromecânica
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400">
              {WORKSHOP_TAGLINE}. Organize clientes, veículos, serviços elétricos e mecânicos em um só lugar.
            </p>
          </div>
          <ul className="space-y-3.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/15">
                  <CheckCircle2 className="h-3.5 w-3.5 text-orange-400" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-600">
          © {new Date().getFullYear()} SAASMecanica
        </p>
      </div>

      <div className="surface-main flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">SAASMecanica</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-white p-8 shadow-[var(--shadow-md)]">
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
