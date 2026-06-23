"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { type Product } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";
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
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] w-12">
                  Img
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">
                  Nama Produk
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] hidden sm:table-cell">
                  Harga
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] hidden md:table-cell">
                  Platform
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] hidden md:table-cell">
                  Kategori
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B]">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748B]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <tr
                  key={product.id}
                  className={`border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC] transition-colors ${
                    !product.is_active ? "opacity-50" : ""
                  }`}
                >
                  {/* Image */}
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] relative">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full text-lg">
                          📦
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0F172A] line-clamp-1 max-w-[200px]">
                      {product.name}
                    </p>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 hidden sm:table-cell text-[#64748B]">
                    {formatPrice(product.price)}
                  </td>

                  {/* Platform */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge platform={product.platform} />
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 hidden md:table-cell text-[#64748B] text-xs">
                    {product.categories?.name || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(product)}
                        disabled={togglingId === product.id}
                        className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors disabled:opacity-50"
                        title={product.is_active ? "Sembunyikan" : "Aktifkan"}
                      >
                        {product.is_active ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
