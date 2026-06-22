"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getNotificationCounts } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getNotificationCounts().then((c) => setCount(c.total)).catch(() => {});
  }, []);

  return (
    <Link href="/notificacoes" className="relative">
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm",
          "transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <Bell className="h-4 w-4" />
      </span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-1 text-[10px] font-bold text-white shadow-md shadow-orange-500/30">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
