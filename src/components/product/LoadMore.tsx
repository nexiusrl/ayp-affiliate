"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LoadMoreProps {
  currentLimit: number;
  hasMore: boolean;
}

export function LoadMore({ currentLimit, hasMore }: LoadMoreProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", (currentLimit + 12).toString());
    
    const targetPath = window.location.pathname;
    startTransition(() => {
      router.push(`${targetPath}?${params.toString()}`);
    });
  };

  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8 mb-4">
      <Button
        variant="outline"
        onClick={handleLoadMore}
        loading={isPending}
        disabled={isPending}
        className="min-w-[160px] shadow-sm border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
      >
        {isPending ? "Memuat..." : "Muat Lebih Banyak"}
      </Button>
    </div>
  );
}
