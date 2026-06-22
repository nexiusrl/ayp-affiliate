import { db } from "@/lib/db";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await db.getCategories();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Tambah Produk</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Tambahkan produk affiliate baru
        </p>
      </div>
      <ProductForm categories={categories ?? []} />
    </AdminLayout>
  );
}
