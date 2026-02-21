"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useProducts,
  useTransactions,
  useCreateTransaction,
} from "@/lib/hooks/queries";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { PackageOpen, CheckCircle, Clock, Loader2, ListFilter, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RentalFormDialog } from "@/components/rental/RentalFormDialog";
import Link from "next/link";

export default function RentalPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);

  // Fetch rental products
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    type: "RENT",
    active: true,
  });

  // Fetch active rentals count (Transaction Type RENTAL, Status PAID)
  const { data: activeRentalsData } = useTransactions({
    type: "RENTAL",
    status: "PAID",
    limit: 1, // We only need the total count
  });

  const createTransaction = useCreateTransaction();

  const products = productsData?.data ?? [];
  const totalRentedCount = activeRentalsData?.meta.total ?? 0;

  const handleOpenRent = (product: Product) => {
    setSelectedProduct(product);
    setIsRentDialogOpen(true);
  };

  const handleRentSubmit = async (data: {
    customerName: string;
    expectedReturnAt: string;
    depositAmount: number;
    notes: string;
    quantity: number;
  }) => {
    if (!selectedProduct) return;

    try {
      await createTransaction.mutateAsync({
        type: "RENTAL",
        customerName: data.customerName,
        paymentMethod: "CASH", // Default to cash for now
        paidAmount: parseFloat(selectedProduct.price) * data.quantity,
        depositAmount: data.depositAmount,
        items: [
          {
            itemType: "PRODUCT",
            id: selectedProduct.id,
            quantity: data.quantity,
            expectedReturnAt: data.expectedReturnAt,
            notes: data.notes,
          },
        ],
      });

      toast.success(`${selectedProduct.name} rented successfully`);
      setIsRentDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rent product");
    }
  };

  const availableItemsCount = products.filter(p => p.stock > 0).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--gray-900)]">Rental Catalog</h2>
            <p className="text-sm text-[var(--gray-500)]">Select equipment to rent out</p>
          </div>
          <Button asChild className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
            <Link href="/rental/active" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              View Active Rentals
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--brand-50)]">
                  <PackageOpen className="h-6 w-6 text-[var(--brand)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">{products.length}</p>
                  <p className="text-sm text-[var(--gray-500)]">Rental Catalog</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--success-bg)]">
                  <CheckCircle className="h-6 w-6 text-[var(--status-success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">{availableItemsCount}</p>
                  <p className="text-sm text-[var(--gray-500)]">In Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Link href="/rental/active" className="block hover:opacity-90 transition-opacity">
            <Card className="border-0 shadow-sm border-[var(--info-border)] bg-[var(--info-bg)]/30 cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Clock className="h-6 w-6 text-[var(--status-info)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[var(--gray-900)]">{totalRentedCount}</p>
                    <p className="text-sm text-[var(--gray-500)]">Active Rentals</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[var(--gray-400)]" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Rental Catalog */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--gray-900)]">Product Catalog</h3>
          {isLoadingProducts ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Card key={product.id} className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--gray-100)] text-[var(--brand)]">
                        <PackageOpen className="h-6 w-6" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          product.stock > 0
                            ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--status-success)]"
                            : "border-[var(--status-danger)] bg-[var(--status-danger)]/10 text-[var(--status-danger)]"
                        )}
                      >
                        {product.stock > 0 ? "Available" : "Out of Stock"}
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-[var(--gray-900)] line-clamp-1">{product.name}</h4>
                    <p className="text-sm text-[var(--brand)] font-medium">{formatRupiah(parseFloat(product.price))}</p>
                    <p className="text-xs text-[var(--gray-400)] mt-1">
                      Stock: {product.stock} units
                    </p>

                    <Button
                      className="mt-4 w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                      size="sm"
                      onClick={() => handleOpenRent(product)}
                      disabled={product.stock <= 0}
                    >
                      Rent Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <RentalFormDialog
        key={selectedProduct?.id || "empty"}
        product={selectedProduct}
        isOpen={isRentDialogOpen}
        onClose={() => {
          setIsRentDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleRentSubmit}
        isLoading={createTransaction.isPending}
      />
    </MainLayout>
  );
}
