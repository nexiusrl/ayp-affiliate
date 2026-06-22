"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { type Category, type Product, type Platform } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEdit = !!product;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    price: product?.price?.toString() ?? "",
    image_url: product?.image_url ?? "",
    affiliate_url: product?.affiliate_url ?? "",
    platform: (product?.platform ?? "shopee") as Platform,
    category_id: product?.category_id ?? "",
    description: product?.description ?? "",
    is_active: product?.is_active ?? true,
  });



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        category_id: form.category_id || null,
      };

      const url = isEdit
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toastError(data.error || "Gagal menyimpan produk");
        return;
      }

      success(isEdit ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toastError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Manual form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4"
      >
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Data Produk
        </h2>

        <Input
          label="Nama Produk"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Contoh: Headset Gaming RGB..."
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Harga (Rp)"
            type="number"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            placeholder="150000"
            min="0"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              Platform <span className="text-red-500">*</span>
            </label>
            <select
              value={form.platform}
              onChange={(e) =>
                setForm((p) => ({ ...p, platform: e.target.value as Platform }))
              }
              className="px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            >
              <option value="shopee">Shopee</option>
              <option value="tokopedia">Tokopedia</option>
            </select>
          </div>
        </div>

        <Input
          label="Link Affiliate"
          value={form.affiliate_url}
          onChange={(e) =>
            setForm((p) => ({ ...p, affiliate_url: e.target.value }))
          }
          placeholder="https://shopee.co.id/..."
          type="url"
          required
        />

        <Input
          label="URL Gambar"
          value={form.image_url}
          onChange={(e) =>
            setForm((p) => ({ ...p, image_url: e.target.value }))
          }
          placeholder="https://..."
          type="url"
          hint="URL gambar produk dari Shopee/Tokopedia"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#0F172A]">Kategori</label>
          <select
            value={form.category_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, category_id: e.target.value }))
            }
            className="px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">— Tanpa Kategori —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#0F172A]">
            Deskripsi (opsional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Deskripsi singkat produk..."
            rows={3}
            className="px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
          />
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((p) => ({ ...p, is_active: e.target.checked }))
              }
              className="w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-[#0F172A]">Produk aktif (tampil di publik)</span>
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
          </Button>
        </div>
      </form>
    </div>
  );
}
