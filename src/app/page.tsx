import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { SortSelect } from "@/components/product/SortSelect";
import { LoadMore } from "@/components/product/LoadMore";

export const metadata: Metadata = {
  title: "AYP Affiliate — Temukan Produk Terbaik",
  description:
    "Temukan produk-produk pilihan terbaik dari Shopee dan Tokopedia. Harga terjangkau, kualitas terpercaya.",
};

interface HomePageProps {
  searchParams: Promise<{ q?: string; sort?: string; limit?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: search, sort, limit } = await searchParams;

  const currentLimit = parseInt(limit || "12", 10);
  const currentSort = (sort || "newest") as "newest" | "cheapest" | "expensive";

  // Fetch categories for filter
  const categories = await db.getCategories();

  // Fetch products (fetch limit + 1 to detect hasMore)
  const products = await db.getProducts({ 
    search, 
    limit: currentLimit + 1, 
    sort: currentSort 
  });

  const hasMore = products.length > currentLimit;
  const displayProducts = hasMore ? products.slice(0, currentLimit) : products;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Category Filter */}
        <section className="mb-5" aria-label="Filter kategori">
          <Suspense fallback={null}>
            <CategoryFilter categories={categories ?? []} />
          </Suspense>
        </section>

        {/* Header toolbar: Search info and Sort select */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-[#F1F5F9] pb-3">
          <div>
            {search ? (
              <p className="text-sm text-[#64748B]">
                Hasil pencarian untuk{" "}
                <span className="font-semibold text-[#0F172A]">
                  &ldquo;{search}&rdquo;
                </span>{" "}
                — {hasMore ? `${currentLimit}+` : displayProducts.length} produk ditemukan
              </p>
            ) : (
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Rekomendasi Produk
              </p>
            )}
          </div>
          <SortSelect />
        </div>

        {/* Product Grid */}
        <section aria-label="Daftar produk">
          <Suspense fallback={<ProductGridSkeleton count={10} />}>
            <ProductGrid products={displayProducts} />
          </Suspense>
          <LoadMore currentLimit={currentLimit} hasMore={hasMore} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
