import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { SortSelect } from "@/components/product/SortSelect";
import { LoadMore } from "@/components/product/LoadMore";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string; limit?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.getCategoryBySlug(slug);

  if (!category) return { title: "Kategori tidak ditemukan" };

  return {
    title: `${category.name} — AYP Affiliate`,
    description: `Temukan produk ${category.name} pilihan terbaik dari Shopee dan Tokopedia.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { q: search, sort, limit } = await searchParams;

  const currentLimit = parseInt(limit || "12", 10);
  const currentSort = (sort || "newest") as "newest" | "cheapest" | "expensive";

  // Fetch category details and all categories in parallel to optimize TTFB
  const [category, categories] = await Promise.all([
    db.getCategoryBySlug(slug),
    db.getCategories(),
  ]);

  if (!category) notFound();

  // Fetch products in this category (fetch limit + 1 to detect hasMore)
  const products = await db.getProducts({ 
    categoryId: category.id, 
    search,
    limit: currentLimit + 1, 
    sort: currentSort 
  });

  const hasMore = products.length > currentLimit;
  const displayProducts = hasMore ? products.slice(0, currentLimit) : products;

  return (
    <>
      {/* Category Filter */}
      <section className="mb-5" aria-label="Filter kategori">
        <Suspense fallback={null}>
          <CategoryFilter categories={categories ?? []} />
        </Suspense>
      </section>

      {/* Heading & Sort Tool bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-[#F1F5F9] pb-3">
        <div>
          <h1 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <span>Kategori: {category.name}</span>
            <span className="text-xs font-normal text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
              {hasMore ? `${currentLimit}+` : displayProducts.length} produk
            </span>
          </h1>
          {search && (
            <p className="text-xs text-[#64748B] mt-1">
              Filter kata kunci: &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
        <SortSelect />
      </div>

      {/* Product Grid */}
      <section aria-label={`Produk ${category.name}`}>
        <Suspense fallback={<ProductGridSkeleton count={10} />}>
          <ProductGrid products={displayProducts} />
        </Suspense>
        <LoadMore currentLimit={currentLimit} hasMore={hasMore} />
      </section>
    </>
  );
}
