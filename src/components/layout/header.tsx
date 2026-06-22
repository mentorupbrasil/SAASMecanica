import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";

type HeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="glass-header sticky top-0 z-10">
      <div className="flex items-center justify-between gap-6 px-8 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 truncate text-sm text-slate-500">{description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <GlobalSearch />
          <NotificationBell />
          {action}
        </div>
      </div>
    </header>
  );
}
