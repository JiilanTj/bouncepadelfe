"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/lib/types";
import { ShoppingCart, Package, RotateCcw, Minus, Plus, Trash2 } from "lucide-react";

interface CartItem extends Product {
  quantity: number;
}

interface StoreCartPanelProps {
  cart: CartItem[];
  subtotal: number;
  total: number;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function StoreCartPanel({
  cart,
  subtotal,
  total,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: StoreCartPanelProps) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-[var(--brand)]" />
          <CardTitle className="text-lg font-semibold">Cart</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {totalItems} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="max-h-[400px] space-y-3 overflow-auto">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-[var(--gray-400)]">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Add products to get started</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--gray-200)] p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gray-100)] shrink-0 overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    item.type === "RENT" ? (
                      <RotateCcw className="h-5 w-5 text-[var(--status-warning)]" />
                    ) : (
                      <Package className="h-5 w-5 text-[var(--brand)]" />
                    )
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--gray-900)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--gray-500)]">
                    {item.type === "RENT" ? "Rent" : "Sell"} • {" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(parseFloat(item.price))}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--gray-200)] hover:bg-[var(--gray-100)]"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    disabled={item.quantity >= item.stock}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--gray-200)] hover:bg-[var(--gray-100)] disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-400)] hover:bg-[var(--danger-bg)] hover:text-[var(--status-danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--gray-600)]">Subtotal</span>
            <span className="font-medium">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-[var(--gray-900)]">Total</span>
            <span className="text-[var(--brand)]">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Checkout
        </Button>
      </CardContent>
    </Card>
  );
}
