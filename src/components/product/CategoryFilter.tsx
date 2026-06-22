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

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* "Semua" pill */}
      <Link
        href={buildHomeUrl()}
        className={cn(
          "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
          isHome && !currentSlug
            ? "bg-[#2563EB] text-white shadow-sm"
            : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
        )}
      >
        Semua
      </Link>

      {categories.map((cat) => {
        const isActive = currentSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={`/kategori/${cat.slug}`}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[#2563EB] text-white shadow-sm"
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
            )}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
