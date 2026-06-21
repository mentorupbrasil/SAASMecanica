"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveQuoteByToken } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function QuoteApprovalForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-6 space-y-4 border-t pt-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await approveQuoteByToken(token, name || "Cliente");
            router.refresh();
          } catch {
            setError("Não foi possível aprovar. Tente novamente.");
          }
        });
      }}
    >
      <div className="space-y-2">
        <Label>Seu nome (para registro)</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Aprovando..." : "Aprovar orçamento"}
      </Button>
    </form>
  );
}
