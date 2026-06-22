"use client";

import { cn } from "@/lib/utils";

type CategorySelectProps = {
  name: string;
  options: readonly string[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export function CategorySelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Selecione ou digite...",
  className,
  required,
}: CategorySelectProps) {
  return (
    <>
      <input
        name={name}
        list={`${name}-list`}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={cn(
          "flex h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-all",
          "placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10",
          className,
        )}
      />
      <datalist id={`${name}-list`}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
}
