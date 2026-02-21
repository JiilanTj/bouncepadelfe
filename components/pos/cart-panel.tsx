"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, Table } from "@/lib/types";
import { ShoppingCart } from "lucide-react";
import { CartItem } from "./cart-item";
import { CheckoutSummary } from "./checkout-summary";

interface CartPanelProps {
  cart: Array<Menu & { quantity: number }>;
  tables: Table[];
  isLoadingTables: boolean;
  selectedTable: string;
  subtotal: number;

  total: number;
  onTableChange: (value: string) => void;
  onUpdateQuantity: (menuId: string, delta: number) => void;
  onRemove: (menuId: string) => void;
  onCheckout: () => void;
}

export function CartPanel({
  cart,
  tables,
  isLoadingTables,
  selectedTable,
  subtotal,
  total,
  onTableChange,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartPanelProps) {
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
        {/* Table Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--gray-700)]">Select Table</label>
          <Select value={selectedTable} onValueChange={onTableChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a table (optional)" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingTables ? (
                <SelectItem value="loading" disabled>
                  Loading tables...
                </SelectItem>
              ) : tables.length === 0 ? (
                <SelectItem value="none" disabled>
                  No tables available
                </SelectItem>
              ) : (
                tables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.code} {table.name ? `- ${table.name}` : ""} 
                    {table.status === "OCCUPIED" ? " (Occupied)" : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-[var(--gray-400)]">
            Select a table to assign this order
          </p>
        </div>

        <Separator />

        {/* Cart Items */}
        <div className="max-h-[300px] space-y-3 overflow-auto">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-[var(--gray-400)]">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        <Separator />

        {/* Checkout Summary */}
        <CheckoutSummary subtotal={subtotal} total={total} />

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
