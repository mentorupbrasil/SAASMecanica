import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-all",
        "focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10",
        className,
      )}
      {...props}
    />
  );
}
