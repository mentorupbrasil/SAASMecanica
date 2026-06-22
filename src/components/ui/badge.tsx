import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/60",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-200/60",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
