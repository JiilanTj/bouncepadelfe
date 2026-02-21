"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: Menu & { quantity: number };
  onUpdateQuantity: (menuId: string, delta: number) => void;
  onRemove: (menuId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const price = parseFloat(item.price);
  const hasUnlimitedStock = item.stock === null;
  const currentStock = item.stock ?? 0;
  const maxReached = !hasUnlimitedStock && item.quantity >= currentStock;

  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--gray-50)] p-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--gray-900)] truncate">{item.name}</p>
        <p className="text-sm text-[var(--gray-500)]">
          {formatRupiah(price)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.id, -1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.id, 1)}
          disabled={maxReached}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[var(--status-danger)] hover:text-[var(--status-danger)]"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
