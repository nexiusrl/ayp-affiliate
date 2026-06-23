import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { db } from "@/lib/db";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductTable } from "@/components/admin/ProductTable";
import { Button } from "@/components/ui/Button";

export default async function AdminProductsPage() {
  let products;
  try {
    products = await db.getProducts({ includeInactive: true });
  } catch (error) {
    redirect("/admin/login");
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Produk</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {products?.length ?? 0} produk terdaftar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/import">
            <Button variant="outline">
              <Upload size={16} />
              Impor CSV
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus size={16} />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </div>
      <ProductTable products={products ?? []} />
    </AdminLayout>
  );
}
