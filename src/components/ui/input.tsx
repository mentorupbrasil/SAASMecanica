import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition-all",
        "placeholder:text-slate-400",
        "focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-semibold text-slate-700", className)}
      {...props}
    />
  );
}
