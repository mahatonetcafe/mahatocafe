"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { buildIndex, fuzzySearch } from "@/lib/fuzzy";

type Item = { slug: string; name: string; category: string; price: number; other: string };

export function HeroSearch({ items }: { items: Item[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const index = useMemo(() => buildIndex(items, (i) => i.name, (i) => i.other), [items]);
  const matches = useMemo(() => fuzzySearch(index, q).slice(0, 6).map((h) => h.item), [index, q]);

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <label htmlFor="hero-search" className="sr-only">Service dhundhein</label>
      <div className="flex items-center gap-2 rounded-full bg-white border border-brand-200 shadow-card p-1 pl-4">
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <input
          id="hero-search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Likhein: PAN card, voter, mug…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none"
        />
        <button className="btn btn-blue !rounded-full shrink-0">Search</button>
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lift text-left">
          {matches.map((m) => (
            <li key={m.slug}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => router.push(`/service/${m.slug}`)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-brand-50"
              >
                <span className="min-w-0">
                  <span className="block font-medium truncate">{m.name}</span>
                  <span className="block text-xs text-muted">{m.category}</span>
                </span>
                <span className="font-bold text-brand-900">₹{m.price}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
