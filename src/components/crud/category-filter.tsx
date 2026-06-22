"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  options: readonly string[];
  paramName?: string;
  allLabel?: string;
};

export function CategoryFilter({
  options,
  paramName = "categoria",
  allLabel = "Todos",
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "ALL";

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete(paramName);
    else params.set(paramName, value);
    router.push(`?${params.toString()}`);
  }

  const chips = [{ value: "ALL", label: allLabel }, ...options.map((o) => ({ value: o, label: o }))];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.value}
          type="button"
          onClick={() => setCategory(chip.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            current === chip.value
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50",
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
