"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Sparkles, Wrench } from "lucide-react";
import { moduleGroups, adminModuleGroup, platformModuleGroup } from "@/config/modules";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/user-menu";
import { isAdminRole } from "@/lib/roles";

type SidebarProps = {
  user: {
    name: string;
    tenantName: string;
    role: string;
    roleKey: string;
    logoUrl?: string | null;
    isSuperAdmin?: boolean;
  };
};

function NavGroup({
  group,
  pathname,
}: {
  group: (typeof moduleGroups)[0];
  pathname: string;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {group.title}
      </p>
      <ul className="space-y-0.5">
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
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "bg-[var(--sidebar-active)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-slate-400 hover:bg-[var(--sidebar-hover)] hover:text-slate-200",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-orange-500" />
                )}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-white/[0.04] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      active
                        ? "bg-orange-500/25 text-orange-300"
                        : "bg-orange-500/15 text-orange-400/90",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const showAdmin = isAdminRole(user.roleKey);
  const groups = [
    ...moduleGroups,
    ...(showAdmin ? [adminModuleGroup] : []),
    ...(user.isSuperAdmin ? [platformModuleGroup] : []),
  ];

  return (
    <aside className="dark-scroll flex h-full w-[280px] shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
      {/* Brand */}
      <div className="relative overflow-hidden border-b border-[var(--sidebar-border)] px-5 py-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,88,12,0.15),transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          {user.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.logoUrl}
              alt={user.tenantName}
              className="h-11 w-11 rounded-xl object-contain bg-white p-1"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover,#c2410c)] shadow-lg shadow-orange-500/25">
              <Wrench className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight text-white">
              {user.tenantName}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-slate-500">
              <Sparkles className="h-3 w-3 text-orange-400/80" />
              Mecânica & Elétrica
            </p>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="border-b border-[var(--sidebar-border)] p-4">
        <Link
          href="/ordens/nova"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover,#c2410c)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nova OS — entrada
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <NavGroup key={group.title} group={group} pathname={pathname} />
        ))}
      </nav>

      <UserMenu name={user.name} tenantName={user.tenantName} role={user.role} />
    </aside>
  );
}
