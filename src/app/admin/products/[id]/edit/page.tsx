import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.getProductById(id),
    db.getCategories(),
  ]);

  if (!product) notFound();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Edit Produk</h1>
        <p className="text-sm text-[#64748B] mt-0.5 truncate max-w-md">
          {product.name}
        </p>
      </div>
      <ProductForm categories={categories ?? []} product={product} />
    </AdminLayout>
  );
}
