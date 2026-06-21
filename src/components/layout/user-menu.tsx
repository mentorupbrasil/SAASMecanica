"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserMenuProps = {
  name: string;
  tenantName: string;
  role: string;
};

export function UserMenu({ name, tenantName, role }: UserMenuProps) {
  return (
    <div className="border-t border-slate-800 p-4">
      <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-900 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600/20">
          <User className="h-4 w-4 text-orange-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">{name}</p>
          <p className="truncate text-xs text-slate-500">{tenantName}</p>
        </div>
      </div>
      <p className="mb-2 px-1 text-[10px] uppercase tracking-wider text-slate-500">
        {role}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );
}
