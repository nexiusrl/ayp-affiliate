import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImportProductCSV } from "@/components/admin/ImportProductCSV";

export default async function ImportProductsPage() {
  let categories;
  try {
    categories = await db.getCategories();
  } catch (error) {
    redirect("/admin/login");
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Impor Produk dari CSV</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Unggah berkas CSV untuk menambahkan banyak produk sekaligus ke database
        </p>
      </div>
      <ImportProductCSV categories={categories ?? []} />
    </AdminLayout>
  );
}
