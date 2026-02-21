"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Loader2, ChevronLeft, ChevronRight, CreditCard, Banknote, QrCode, Wallet, CheckCircle, Receipt, Coffee, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMenus, useTables, useCreateTransaction } from "@/lib/hooks/queries";
import { Menu, PaymentMethod } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { MenuGrid, CartPanel } from "@/components/pos";

// Cart item dengan quantity
type CartItem = Menu & { quantity: number };

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CASH", label: "Cash", icon: <Banknote className="h-5 w-5" /> },
  { value: "QRIS", label: "QRIS", icon: <QrCode className="h-5 w-5" /> },
  { value: "TRANSFER", label: "Transfer", icon: <CreditCard className="h-5 w-5" /> },
  { value: "OTHER", label: "Other", icon: <Wallet className="h-5 w-5" /> },
];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");

  // Success modal state
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdTransaction, setCreatedTransaction] = useState<{ id: string; invoiceNumber: string } | null>(null);

  // Debounce search query (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch menus from API with search & pagination
  const { data: menusData, isLoading: isLoadingMenus } = useMenus({
    available: true,
    active: true,
    search: debouncedSearch || undefined,
    page,
    limit,
  });

  // Fetch tables from API
  const { data: tablesData, isLoading: isLoadingTables } = useTables({
    active: true,
  });

  // Create transaction mutation
  const createTransaction = useCreateTransaction();

  const menus = menusData?.data ?? [];
  const tables = tablesData?.data ?? [];
  const totalPages = menusData?.pagination?.totalPages ?? 1;
  const totalItems = menusData?.pagination?.total ?? 0;



  // Get selected table info
  const selectedTableInfo = useMemo(() => {
    return tables.find((t) => t.id === selectedTable);
  }, [tables, selectedTable]);

  // Calculate totals
  const { subtotal, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.price);
      return sum + price * item.quantity;
    }, 0);
    return { subtotal, total: subtotal };
  }, [cart]);

  // Calculate change for CASH payment
  const changeAmount = useMemo(() => {
    const paid = parseFloat(paidAmount) || 0;
    return Math.max(0, paid - total);
  }, [paidAmount, total]);

  const isPaidAmountSufficient = useMemo(() => {
    if (paymentMethod !== "CASH") return true;
    const paid = parseFloat(paidAmount) || 0;
    return paid >= total;
  }, [paymentMethod, paidAmount, total]);

  // Add menu to cart
  const addToCart = useCallback((menu: Menu) => {
    const hasUnlimitedStock = menu.stock === null;
    const currentStock = menu.stock ?? 0;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      
      if (existing) {
        if (!hasUnlimitedStock && existing.quantity >= currentStock) {
          return prev;
        }
        return prev.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      if (!hasUnlimitedStock && currentStock <= 0) {
        return prev;
      }
      
      return [...prev, { ...menu, quantity: 1 }];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((menuId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === menuId);
      if (!item) return prev;

      const hasUnlimitedStock = item.stock === null;
      const currentStock = item.stock ?? 0;
      const newQuantity = item.quantity + delta;

      if (delta > 0 && !hasUnlimitedStock && newQuantity > currentStock) {
        toast.error(`Cannot add more ${item.name}. Stock limit reached.`);
        return prev;
      }

      return prev
        .map((item) =>
          item.id === menuId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((menuId: string) => {
    const item = cart.find((i) => i.id === menuId);
    if (item) {
      toast.info(`Removed ${item.name} from cart`);
    }
    setCart((prev) => prev.filter((item) => item.id !== menuId));
  }, [cart]);

  // Open checkout modal
  const openCheckout = useCallback(() => {
    setPaymentMethod("CASH");
    setPaidAmount(total.toString());
    setCustomerName("");
    setIsCheckoutOpen(true);
  }, [total]);

  // Handle checkout submit
  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;

    const paid = parseFloat(paidAmount) || 0;
    if (paymentMethod === "CASH" && paid < total) {
      toast.error("Insufficient payment amount");
      return;
    }

    try {
      const result = await createTransaction.mutateAsync({
        type: "POS",
        tableId: selectedTable || undefined,
        customerName: customerName || undefined,
        paymentMethod,
        paidAmount: paymentMethod === "CASH" ? paid : total,
        items: cart.map((item) => ({
          itemType: "MENU" as const,
          id: item.id,
          quantity: item.quantity,
        })),
      });

      setCreatedTransaction({
        id: result.transaction.id,
        invoiceNumber: result.transaction.invoiceNumber,
      });
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
      setCart([]);
      setSelectedTable("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transaction");
    }
  }, [cart, createTransaction, customerName, paidAmount, paymentMethod, selectedTable, total]);

  // Close success modal
  const closeSuccess = useCallback(() => {
    setIsSuccessOpen(false);
    setCreatedTransaction(null);
  }, []);

  const isLoading = isLoadingMenus || isLoadingTables;

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)]">
        {/* Page Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Point of Sale</h2>
          <p className="text-sm text-[var(--gray-500)]">Process food and drink orders</p>
        </div>

        {isLoading && !menus.length ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
            <span className="ml-2 text-[var(--gray-500)]">Loading data...</span>
          </div>
        ) : (
          <div className="grid h-full gap-6 lg:grid-cols-3">
            {/* Products Section */}
            <div className="lg:col-span-2 space-y-4 overflow-auto">
              <MenuGrid
                title="All Items"
                icon="food"
                menus={menus}
                isLoading={isLoadingMenus}
                searchQuery={searchQuery}
                onSearchChange={(query) => {
                  setSearchQuery(query);
                  setPage(1);
                }}
                onAdd={addToCart}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3">
                  <p className="text-sm text-[var(--gray-500)]">
                    Showing {menus.length} of {totalItems} items
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isLoadingMenus}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || isLoadingMenus}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Section */}
            <div className="space-y-4">
              <CartPanel
                cart={cart}
                tables={tables}

                isLoadingTables={isLoadingTables}
                selectedTable={selectedTable}
                subtotal={subtotal}
                total={total}
                onTableChange={setSelectedTable}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onCheckout={openCheckout}
              />
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[var(--brand)]" />
                Checkout
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="rounded-lg bg-[var(--gray-50)] p-4 space-y-3">
                <h4 className="font-medium text-[var(--gray-900)]">Order Summary</h4>
                
                {/* Items */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[var(--gray-600)]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        {formatRupiah(parseFloat(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between">
                  <span className="font-semibold text-[var(--gray-900)]">Total</span>
                  <span className="text-lg font-bold text-[var(--brand)]">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>

              {/* Table Info */}
              {selectedTableInfo && (
                <div className="flex items-center justify-between rounded-lg border border-[var(--gray-200)] p-3">
                  <span className="text-sm text-[var(--gray-500)]">Table</span>
                  <Badge variant="secondary">
                    {selectedTableInfo.code} {selectedTableInfo.name && `- ${selectedTableInfo.name}`}
                  </Badge>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`flex items-center gap-2 rounded-lg border p-3 transition-all ${
                        paymentMethod === method.value
                          ? "border-[var(--brand)] bg-[var(--brand-50)] text-[var(--brand)]"
                          : "border-[var(--gray-200)] bg-white hover:border-[var(--gray-300)]"
                      }`}
                    >
                      {method.icon}
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Amount (CASH only) */}
              {paymentMethod === "CASH" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Paid Amount</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      min={total}
                      placeholder="Enter amount"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                    />
                  </div>
                  
                  {/* Change Calculation */}
                  {parseFloat(paidAmount) > 0 && (
                    <div className="flex justify-between rounded-lg bg-[var(--success-bg)] p-3">
                      <span className="text-sm text-[var(--status-success)]">Change</span>
                      <span className="font-bold text-[var(--status-success)]">
                        {formatRupiah(changeAmount)}
                      </span>
                    </div>
                  )}

                  {!isPaidAmountSufficient && (
                    <p className="text-sm text-[var(--status-danger)]">
                      Insufficient payment amount
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={!isPaidAmountSufficient || createTransaction.isPending}
                className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
              >
                {createTransaction.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={isSuccessOpen} onOpenChange={closeSuccess}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader className="sr-only">
              <DialogTitle>Payment Successful</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-bg)]">
                <CheckCircle className="h-8 w-8 text-[var(--status-success)]" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[var(--gray-900)]">
                  Payment Successful!
                </h3>
                <p className="text-sm text-[var(--gray-500)]">
                  Transaction has been created successfully
                </p>
              </div>

              {createdTransaction && (
                <div className="w-full rounded-lg bg-[var(--gray-50)] p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--gray-500)]">Invoice</span>
                    <span className="font-mono font-medium">{createdTransaction.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--gray-500)]">Amount</span>
                    <span className="font-bold text-[var(--brand)]">{formatRupiah(total)}</span>
                  </div>
                </div>
              )}

              <Button onClick={closeSuccess} className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
