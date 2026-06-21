"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({ placeholder = "Buscar..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  return (
    <form
      className="relative max-w-md flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const query = String(fd.get("q") ?? "");
        const params = new URLSearchParams(searchParams.toString());
        if (query) params.set("q", query);
        else params.delete("q");
        router.push(`?${params.toString()}`);
      }}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="pl-9"
      />
    </form>
  );
}
