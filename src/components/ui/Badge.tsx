import { cn } from "@/lib/utils";
import { type Platform } from "@/types";

interface BadgeProps {
  platform: Platform;
  className?: string;
}

export function Badge({ platform, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
        platform === "shopee" && "bg-orange-100 text-[#EE4D2D]",
        platform === "tokopedia" && "bg-green-100 text-[#03AC0E]",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {platform === "shopee" ? "Shopee" : "Tokopedia"}
    </span>
  );
}
