import { db } from "@/lib/db";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await db.getCategories();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Kategori</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Kelola kategori produk
        </p>
      </div>
      <CategoryManager categories={categories ?? []} />
    </AdminLayout>
  );
}
