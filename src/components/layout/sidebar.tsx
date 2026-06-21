"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { moduleGroups } from "@/config/modules";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">SAASMecanica</p>
          <p className="text-xs text-slate-400">Gestão de Oficina</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {moduleGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-orange-600 text-white"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="orange"
                          className={cn(
                            "text-[10px]",
                            active && "bg-white/20 text-white",
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-lg bg-slate-900 p-3">
          <p className="text-xs font-medium text-slate-300">Plano Professional</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Multi-filial · WhatsApp · DVI
          </p>
        </div>
      </div>
    </aside>
  );
}
