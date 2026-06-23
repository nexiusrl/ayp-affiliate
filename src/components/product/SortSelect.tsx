"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    // Reset limit when sorting changes
    params.delete("limit");
    
    // Maintain current path (e.g. category detail pages)
    const targetPath = window.location.pathname;
    router.push(`${targetPath}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0 bg-white border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg shadow-sm">
      <ArrowUpDown size={13} className="text-[#64748B]" />
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-xs font-semibold text-[#0F172A] bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0"
        aria-label="Urutkan produk"
      >
        <option value="newest">Terbaru</option>
        <option value="cheapest">Termurah</option>
        <option value="expensive">Termahal</option>
      </select>
    </div>
  );
}
