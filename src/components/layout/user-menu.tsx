"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  name: string;
  tenantName: string;
  role: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({ name, tenantName, role }: UserMenuProps) {
  return (
    <div className="border-t border-[var(--sidebar-border)] p-4">
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/10 text-sm font-bold text-orange-300 ring-1 ring-orange-500/20">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-200">{name}</p>
          <p className="truncate text-[11px] text-slate-500">{tenantName}</p>
        </div>
      </div>
      <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
        {role}
      </p>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08]",
          "bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-slate-400",
          "transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-slate-200",
        )}
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </button>
    </div>
  );
}
