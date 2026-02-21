"use client";

import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";

interface CheckoutSummaryProps {
  subtotal: number;
  total: number;
}

export function CheckoutSummary({ subtotal, total }: CheckoutSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--gray-500)]">Subtotal</span>
        <span className="font-medium">{formatRupiah(subtotal)}</span>
      </div>

      <div className="flex justify-between">
        <span className="font-semibold text-[var(--gray-900)]">Total</span>
        <span className="text-lg font-bold text-[var(--brand)]">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
}
