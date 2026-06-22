"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Tag } from "lucide-react";
import { type Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slugify(name.trim()) }),
      });
      if (!res.ok) {
        const data = await res.json();
        toastError(data.error || "Gagal menambah kategori");
        return;
      }
      success("Kategori berhasil ditambahkan!");
      setName("");
      router.refresh();
    } catch {
      toastError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      success("Kategori berhasil dihapus");
      setDeleteId(null);
      router.refresh();
    } catch {
      toastError("Gagal menghapus kategori");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-5">
      {/* Add form */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
          Tambah Kategori Baru
        </h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori..."
            className="flex-1"
          />
          <Button
            type="submit"
            loading={adding}
            disabled={!name.trim()}
            className="shrink-0"
          >
            <Plus size={16} />
            Tambah
          </Button>
        </form>
        {name && (
          <p className="text-xs text-[#64748B] mt-2">
            Slug: <code className="font-mono">{slugify(name)}</code>
          </p>
        )}
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            Belum ada kategori. Tambahkan kategori pertama!
          </div>
        ) : (
          <ul>
            {categories.map((cat, i) => (
              <li
                key={cat.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < categories.length - 1 ? "border-b border-[#E2E8F0]" : ""
                }`}
              >
                <Tag size={14} className="text-[#64748B] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A]">
                    {cat.name}
                  </p>
                  <p className="text-xs text-[#64748B] font-mono">
                    {cat.slug}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                  title="Hapus kategori"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Kategori"
        description="Produk dalam kategori ini tidak akan dihapus, hanya kategorinya yang hilang."
        confirmLabel="Hapus"
        confirmVariant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
