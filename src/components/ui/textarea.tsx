import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all",
        "placeholder:text-slate-400",
        "focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10",
        className,
      )}
      {...props}
    />
  );
}
