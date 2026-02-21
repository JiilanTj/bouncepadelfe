"use client";

import { Menu } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Coffee, UtensilsCrossed } from "lucide-react";

interface MenuCardProps {
  menu: Menu;
  onAdd: (menu: Menu) => void;
}

export function MenuCard({ menu, onAdd }: MenuCardProps) {
  const isFood = 
    menu.category?.slug?.includes("food") || 
    menu.category?.name?.toLowerCase().includes("food") ||
    menu.category?.slug?.includes("makanan") || 
    menu.category?.name?.toLowerCase().includes("makanan");
  
  const price = parseFloat(menu.price);
  const hasUnlimitedStock = menu.stock === null;
  const isOutOfStock = !hasUnlimitedStock && (menu.stock ?? 0) <= 0;

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(menu)}
      disabled={isOutOfStock}
      className={`flex flex-col items-start rounded-lg border border-[var(--gray-200)] bg-white p-4 text-left transition-all hover:border-[var(--brand-light)] hover:shadow-sm ${
        isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gray-100)]">
        {isFood ? (
          <UtensilsCrossed className="h-5 w-5 text-[var(--gray-600)]" />
        ) : (
          <Coffee className="h-5 w-5 text-[var(--gray-600)]" />
        )}
      </div>
      <p className="font-medium text-[var(--gray-900)]">{menu.name}</p>
      <p className="text-sm text-[var(--brand)]">{formatRupiah(price)}</p>
      <p className="text-xs text-[var(--gray-400)]">
        {hasUnlimitedStock ? "Stock: Unlimited" : `Stock: ${menu.stock}`}
      </p>
    </button>
  );
}
