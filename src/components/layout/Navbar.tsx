"use client";

import Link from "next/link";
import { Search, ShoppingBag, Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

function useDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    }) as T,
    [fn, delay]
  );
}

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSearch = searchParams.get("q") || "";

  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      // Reset limit on search to avoid offset mismatches
      params.delete("limit");

      const targetPath = pathname.startsWith("/kategori/") ? pathname : "/";

      startTransition(() => {
        router.push(`${targetPath}?${params.toString()}`);
        setIsSearching(false);
      });
    },
    [router, searchParams, pathname]
  );

  const debouncedSearch = useDebounce(handleSearch, 300);

  const onInputChange = (val: string) => {
    setIsSearching(true);
    debouncedSearch(val);
  };

  const showLoading = isPending || isSearching;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[#0F172A] shrink-0 hover:opacity-80 transition-opacity"
        >
          <ShoppingBag size={20} className="text-[#2563EB]" />
          <span className="hidden sm:block text-sm">AYP Affiliate</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 relative max-w-xl">
          {showLoading ? (
            <Loader2
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2563EB] animate-spin"
            />
          ) : (
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
          )}
          <input
            type="search"
            placeholder={pathname.startsWith("/kategori/") ? "Cari di kategori ini..." : "Cari produk..."}
            defaultValue={currentSearch}
            onChange={(e) => onInputChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition-all duration-200"
            aria-label="Cari produk"
          />
        </div>
      </div>
    </header>
  );
}
