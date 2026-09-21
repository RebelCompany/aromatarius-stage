"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pl } from "@/i18n/pl";
import type { SortKey } from "@/lib/shopify/types";

export function SortSelect({ current }: { current: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "relevance") params.delete("sort");
    else params.set("sort", e.target.value);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-600">{pl.collection.sort}</span>
      <select
        value={current}
        onChange={onChange}
        className="h-10 rounded-lg border border-sand-200 bg-card px-3 text-sm focus:border-leaf-500 focus:outline-none"
      >
        {(Object.keys(pl.collection.sortOptions) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            {pl.collection.sortOptions[k]}
          </option>
        ))}
      </select>
    </label>
  );
}
