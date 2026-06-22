import { cn } from "@/lib/utils";

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--card-border)] bg-white shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm">{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TR({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-orange-50/30",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-5 py-3.5 font-bold", className)}>{children}</th>;
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3.5 text-slate-700", className)}>{children}</td>;
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}
