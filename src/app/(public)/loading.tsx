import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function PublicLoading() {
  return (
    <div>
      {/* Skeleton Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-[#F1F5F9] pb-3">
        <div className="h-4 w-40 bg-[#E2E8F0] animate-pulse rounded-md" />
        <div className="h-9 w-32 bg-[#E2E8F0] animate-pulse rounded-lg" />
      </div>

      {/* Skeleton Product Grid (10 items) */}
      <ProductGridSkeleton count={10} />
    </div>
  );
}
