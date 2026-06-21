"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { registerWorkshop, type RegisterState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: RegisterState = {};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerWorkshop, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (state.success && state.slug) {
      router.push(`/login?registered=1&slug=${state.slug}`);
    }
  }, [state.success, state.slug, router]);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600">
          <Wrench className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Criar oficina</h1>
          <p className="text-sm text-slate-500">Comece seu teste gratuito</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="workshopName">Nome da oficina</Label>
          <Input
            id="workshopName"
            name="workshopName"
            placeholder="Oficina Silva Motors"
            required
            onChange={(e) => {
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Identificador (URL de login)</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="silva-motors"
            required
          />
          <p className="text-xs text-slate-400">Usado no login — ex: silva-motors</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerName">Seu nome</Label>
          <Input id="ownerName" name="ownerName" placeholder="João Silva" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@oficina.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando..." : "Criar oficina"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-orange-600 hover:underline">
          Fazer login
        </Link>
      </p>
    </div>
  );
}
