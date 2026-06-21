"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Wrench } from "lucide-react";
import { loginUser, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: LoginState = {};

const authErrors: Record<string, string> = {
  Configuration: "Erro de configuração no servidor. Verifique AUTH_SECRET e AUTH_URL na Vercel.",
  CredentialsSignin: "Identificador, e-mail ou senha incorretos",
  Default: "Não foi possível entrar. Tente novamente.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered") === "1";
  const urlError = searchParams.get("error");
  const [state, formAction, pending] = useActionState(loginUser, initialState);

  const errorMessage =
    state.error ??
    (urlError ? authErrors[urlError] ?? authErrors.Default : null);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600">
          <Wrench className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SAASMecanica</h1>
          <p className="text-sm text-slate-500">Entre na sua oficina</p>
        </div>
      </div>

      {registered && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Oficina criada! Faça login com suas credenciais.
        </div>
      )}

      <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="space-y-2">
          <Label htmlFor="slug">Identificador da oficina</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={searchParams.get("slug") ?? ""}
            placeholder="ex: admin"
            required
            autoComplete="organization"
          />
          <p className="text-xs text-slate-400">O mesmo ID definido no cadastro</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@oficina.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-medium text-orange-600 hover:underline">
          Cadastrar oficina
        </Link>
      </p>
    </div>
  );
}
