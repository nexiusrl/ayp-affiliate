"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHome = pathname === "/";
  const currentSlug = pathname.startsWith("/kategori/")
    ? pathname.replace("/kategori/", "")
    : null;

  const buildHomeUrl = () => {
    const params = searchParams.toString();
    return params ? `/?${params}` : "/";
  };

  const buildCategoryUrl = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const qStr = params.toString();
    return qStr ? `/kategori/${slug}?${qStr}` : `/kategori/${slug}`;
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* "Semua" pill */}
      <Link
        href={buildHomeUrl()}
        className={cn(
          "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1",
          isHome && !currentSlug
            ? "bg-[#2563EB] text-white shadow-sm"
            : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
        )}
      >
        <span>Semua</span>
        <span className={cn(
          "text-[10px] font-normal px-1.5 py-0.5 rounded-full",
          isHome && !currentSlug ? "bg-[#1E40AF] text-white" : "bg-[#F1F5F9] text-[#64748B]"
        )}>
          {totalProducts}
        </span>
      </Link>

      {categories.map((cat) => {
        const isActive = currentSlug === cat.slug;
        const count = cat.product_count || 0;
        return (
          <Link
            key={cat.id}
            href={buildCategoryUrl(cat.slug)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1",
              isActive
                ? "bg-[#2563EB] text-white shadow-sm"
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
            )}
          >
            <span>{cat.name}</span>
            <span className={cn(
              "text-[10px] font-normal px-1.5 py-0.5 rounded-full",
              isActive ? "bg-[#1E40AF] text-white" : "bg-[#F1F5F9] text-[#64748B]"
            )}>
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
