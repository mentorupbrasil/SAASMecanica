"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, ClipboardList, FileText, Loader2, Search, User } from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

const typeIcons = {
  work_order: ClipboardList,
  customer: User,
  vehicle: Car,
  quote: FileText,
};

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearch(query);
        setResults(data);
        setOpen(true);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function selectResult(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 shadow-sm transition-all focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-500/10">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <Search className="h-4 w-4 text-slate-400" />
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar OS, placa, cliente..."
          className="w-56 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-72"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-lg)]">
          <div className="border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
            {results.length} resultado(s)
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {results.map((r) => {
              const Icon = typeIcons[r.type];
              return (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    type="button"
                    onClick={() => selectResult(r.href)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                      <Icon className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{r.title}</p>
                      <p className="truncate text-xs text-slate-500">{r.subtitle}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-100 px-3 py-2 text-center">
            <Link
              href={`/ordens?search=${encodeURIComponent(query)}`}
              className="text-xs font-medium text-orange-600 hover:underline"
              onClick={() => setOpen(false)}
            >
              Ver todas as OS
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
