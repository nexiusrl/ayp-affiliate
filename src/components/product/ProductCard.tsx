"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { type Product } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);

  const handleClick = () => {
    window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`Buka ${product.name} di ${product.platform}`}
      className="group bg-white rounded-xl border border-[#E2E8F0] overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
    >
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description || `Beli ${product.name} dengan harga terbaik di ${product.platform === 'shopee' ? 'Shopee' : 'Tokopedia'}`,
            "image": product.image_url || "",
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "IDR",
              "availability": "https://schema.org/InStock",
              "url": product.affiliate_url
            }
          })
        }}
      />

      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F8FAFC]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              "object-cover transition-all duration-300 group-hover:scale-105",
              priority
                ? "scale-100 blur-0 opacity-100"
                : (imageLoading ? "scale-95 blur-sm opacity-0" : "scale-100 blur-0 opacity-100")
            )}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F8FAFC'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%2364748B' font-size='30'%3E📦%3C/text%3E%3C/svg%3E";
              setImageLoading(false);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            📦
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center">
          <ExternalLink
            size={20}
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5">
        <p
          className="text-[13px] font-medium text-[#0F172A] line-clamp-2 leading-snug"
          title={product.name}
        >
          {product.name}
        </p>
        <p className="text-[15px] font-bold text-[#2563EB]">
          {formatPrice(product.price)}
        </p>
        <Badge platform={product.platform} />
      </div>
    </article>
  );
}
