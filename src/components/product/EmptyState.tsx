import { PackageSearch } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Produk tidak ditemukan",
  description = "Coba kata kunci lain atau pilih kategori yang berbeda.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-4">
        <PackageSearch size={28} className="text-[#2563EB]" />
      </div>
      <h3 className="text-sm font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-xs">{description}</p>
    </div>
  );
}
