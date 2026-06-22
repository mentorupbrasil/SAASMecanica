"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, User, Mail, Lock, ArrowRight } from "lucide-react";
import { registerWorkshop, type RegisterState } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: RegisterState = {};

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerWorkshop, initialState);

  useEffect(() => {
    if (state.success && state.workshopName) {
      const params = new URLSearchParams({
        registered: "1",
        workshop: state.workshopName,
      });
      router.push(`/login?${params.toString()}`);
    }
  }, [state.success, state.workshopName, router]);

  return (
    <AuthShell
      title="Crie sua oficina"
      subtitle="Configure em minutos — teste grátis, sem cartão"
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            Fazer login
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="workshopName">Nome da oficina</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="workshopName"
              name="workshopName"
              className="pl-10"
              placeholder="Ex: Oficina Silva Motors"
              required
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-400">
            Cada oficina é isolada — seus dados ficam separados das demais.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerName">Seu nome</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="ownerName"
              name="ownerName"
              className="pl-10"
              placeholder="João Silva"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail de acesso</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              className="pl-10"
              placeholder="voce@oficina.com"
              required
              autoComplete="email"
            />
          </div>
          <p className="text-xs text-slate-400">Será usado para entrar no sistema.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              name="password"
              type="password"
              className="pl-10"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
        )}

        <Button type="submit" className="h-11 w-full text-base" disabled={pending}>
          {pending ? "Criando oficina..." : (
            <>
              Criar minha oficina
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-slate-400">
          Ao criar, você será o administrador da oficina e poderá convidar sua equipe depois.
        </p>
      </form>
    </AuthShell>
  );
}
