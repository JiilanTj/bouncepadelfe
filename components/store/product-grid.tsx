"use client";

import { Product, Category } from "@/lib/types";
import { Package, Search, X } from "lucide-react";
import { ProductCard } from "./product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  title: string;
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: (product: Product) => void;
  selectedCategory: string | "ALL";
  onCategoryChange: (category: string | "ALL") => void;
  categories: Category[];
}

export function ProductGrid({
  title,
  products,
  isLoading,
  searchQuery,
  onSearchChange,
  onAdd,
  selectedCategory,
  onCategoryChange,
  categories,
}: ProductGridProps) {
  // Filter products by category (Type filtering is handled by the parent/API)
  const filteredProducts = products.filter((product) => {
    return selectedCategory === "ALL" || product.productCategoryId === selectedCategory;
  });


  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4">
          {/* Title and Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </div>
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--gray-200)] bg-white pl-9 pr-8 text-sm outline-none placeholder:text-[var(--gray-400)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--gray-400)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>


          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--gray-500)]">Category:</span>
              <Button
                variant={selectedCategory === "ALL" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange("ALL")}
                className="text-xs h-7"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className="text-xs h-7"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg border border-[var(--gray-200)] bg-[var(--gray-100)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-8 text-center text-[var(--gray-400)]">
            <Package className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">
              {searchQuery
                ? `No items found for "${searchQuery}"`
                : "No products available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
