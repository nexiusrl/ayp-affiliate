import { cn } from "@/lib/utils";
import { type Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./EmptyState";

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3",
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 5} />
      ))}
    </div>
  );
}
