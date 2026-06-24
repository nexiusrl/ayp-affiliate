"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Eye, EyeOff, Filter } from "lucide-react";
import { type Product } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get unique categories from products list
  const categories = Array.from(
    new Map(
      products
        .map((p) => p.categories)
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => [c.id, c])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const filteredProducts = selectedCategoryId === "all"
    ? products
    : products.filter(
        (p) => p.category_id === selectedCategoryId || p.categories?.id === selectedCategoryId
      );

  // Reset page to 1 when filters or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      success("Produk berhasil dihapus");
      setDeleteId(null);
      router.refresh();
    } catch {
      toastError("Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      if (!res.ok) throw new Error();
      success(
        !product.is_active ? "Produk diaktifkan" : "Produk disembunyikan"
      );
      router.refresh();
    } catch {
      toastError("Gagal mengubah status produk");
    } finally {
      setTogglingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
        <p className="text-sm text-[#64748B]">
          Belum ada produk. Tambahkan produk pertama kamu!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-4 rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Filter size={16} />
          <span className="font-medium text-[#475569]">Saring Kategori:</span>
        </div>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent min-w-[220px]"
        >
          <option value="all">Semua Kategori ({products.length})</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({products.filter(p => p.category_id === cat.id).length})
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <p className="text-sm text-[#64748B]">
            Tidak ada produk dalam kategori ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200",
                !product.is_active && "opacity-70 bg-[#F8FAFC]"
              )}
            >
              {/* Image & Overlay */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    📦
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge platform={product.platform} />
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md",
                      product.is_active
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    )}
                  >
                    {product.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-1.5 flex-grow">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  {product.categories?.name || "Tanpa Kategori"}
                </span>
                <h3
                  className="text-sm font-semibold text-[#0F172A] line-clamp-2 leading-snug min-h-[40px]"
                  title={product.name}
                >
                  {product.name}
                </h3>
                <p className="text-base font-bold text-[#2563EB] mt-auto">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  onClick={() => handleToggle(product)}
                  disabled={togglingId === product.id}
                  className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium disabled:opacity-50 transition-colors"
                >
                  {product.is_active ? (
                    <>
                      <EyeOff size={14} />
                      Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Tampilkan
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </Link>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white p-4 rounded-xl border border-[#E2E8F0]">
          {/* Page Sizer */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs bg-white text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            <span>produk per halaman</span>
          </div>

          {/* Info */}
          <div className="text-sm text-[#64748B]">
            Menampilkan <span className="font-medium text-[#0F172A]">{(currentPage - 1) * pageSize + 1}</span>-
            <span className="font-medium text-[#0F172A]">{Math.min(currentPage * pageSize, filteredProducts.length)}</span> dari{" "}
            <span className="font-medium text-[#0F172A]">{filteredProducts.length}</span> produk
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-8 px-2 text-xs"
            >
              Sebelumnya
            </Button>

            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150",
                    currentPage === page
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="h-8 px-2 text-xs"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Produk"
        description="Apakah kamu yakin ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        confirmVariant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
