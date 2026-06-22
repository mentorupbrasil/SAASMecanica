"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { loginUser, type LoginState } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: LoginState = {};

const authErrors: Record<string, string> = {
  Configuration: "Erro de configuração no servidor. Contate o suporte.",
  CredentialsSignin: "E-mail ou senha incorretos",
  Default: "Não foi possível entrar. Tente novamente.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered") === "1";
  const workshopName = searchParams.get("workshop");
  const urlError = searchParams.get("error");
  const [state, formAction, pending] = useActionState(loginUser, initialState);

  const errorMessage =
    state.error ?? (urlError ? authErrors[urlError] ?? authErrors.Default : null);

  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Acesse o painel da sua oficina"
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-semibold text-orange-600 hover:underline">
            Criar minha oficina
          </Link>
        </>
      }
    >
      {registered && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {workshopName ? (
            <>
              <strong>{decodeURIComponent(workshopName)}</strong> foi criada com sucesso!
              Entre com seu e-mail e senha.
            </>
          ) : (
            "Oficina criada! Entre com seu e-mail e senha."
          )}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              className="pl-10"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>
        )}

        <Button type="submit" className="h-11 w-full text-base" disabled={pending}>
          {pending ? "Entrando..." : (
            <>
              Entrar na oficina
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
