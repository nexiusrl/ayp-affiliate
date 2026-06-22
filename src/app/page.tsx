import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "AYP Affiliate — Temukan Produk Terbaik",
  description:
    "Temukan produk-produk pilihan terbaik dari Shopee dan Tokopedia. Harga terjangkau, kualitas terpercaya.",
};

interface HomePageProps {
  searchParams: Promise<{ q?: string; kategori?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: search } = await searchParams;

  // Fetch categories for filter
  const categories = await db.getCategories();

  // Fetch products
  const products = await db.getProducts({ search, limit: 60 });

  return (
    <>
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Category Filter */}
        <section className="mb-5" aria-label="Filter kategori">
          <Suspense fallback={null}>
            <CategoryFilter categories={categories ?? []} />
          </Suspense>
        </section>

        {/* Search result label */}
        {search && (
          <p className="text-sm text-[#64748B] mb-4">
            Hasil pencarian untuk{" "}
            <span className="font-semibold text-[#0F172A]">
              &ldquo;{search}&rdquo;
            </span>{" "}
            — {products?.length ?? 0} produk ditemukan
          </p>
        )}

        {/* Product Grid */}
        <section aria-label="Daftar produk">
          <Suspense fallback={<ProductGridSkeleton count={10} />}>
            <ProductGrid products={products ?? []} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
