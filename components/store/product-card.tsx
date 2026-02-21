"use client";

import Image from "next/image";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const price = parseFloat(product.price);
  const isOutOfStock = product.stock <= 0;

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      disabled={isOutOfStock}
      className={`flex flex-col items-start rounded-lg border border-[var(--gray-200)] bg-white text-left transition-all hover:border-[var(--brand-light)] hover:shadow-sm ${
        isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Product Image */}
      <div className="w-full aspect-square rounded-t-lg bg-[var(--gray-100)] overflow-hidden relative">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-[var(--gray-400)]" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 w-full">
        <p className="font-medium text-[var(--gray-900)] line-clamp-1">{product.name}</p>
        <p className="text-xs text-[var(--gray-500)] line-clamp-1 mt-0.5">
          {product.category?.name || "Uncategorized"}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-[var(--brand)] font-semibold">{formatRupiah(price)}</p>
          <p className={`text-xs ${isOutOfStock ? "text-[var(--status-danger)]" : "text-[var(--gray-400)]"}`}>
            Stock: {product.stock}
          </p>
        </div>
      </div>
    </button>
  );
}
