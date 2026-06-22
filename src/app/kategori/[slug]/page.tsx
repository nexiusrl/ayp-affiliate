import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Verify category exists
  const category = await db.getCategoryBySlug(slug);

  if (!category) notFound();

  // Fetch all categories for filter
  const categories = await db.getCategories();

  // Fetch products in this category
  const products = await db.getProducts({ categoryId: category.id, limit: 60 });

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

        {/* Heading */}
        <h1 className="text-lg font-bold text-[#0F172A] mb-4">
          {category.name}
          <span className="text-sm font-normal text-[#64748B] ml-2">
            ({products?.length ?? 0} produk)
          </span>
        </h1>

        {/* Product Grid */}
        <section aria-label={`Produk ${category.name}`}>
          <Suspense fallback={<ProductGridSkeleton count={10} />}>
            <ProductGrid products={products ?? []} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
