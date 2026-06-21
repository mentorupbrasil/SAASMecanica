import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
        className,
      )}
      {...props}
    />
  );
}
