"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Loader2, ChevronLeft, ChevronRight, CreditCard, Banknote, QrCode, Wallet, CheckCircle, Receipt, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProducts, useCreateTransaction, useProductCategories } from "@/lib/hooks/queries";
import { Product, PaymentMethod, Category } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

// Reusing POS components but with product data
// Ideally these should be refactored to be generic, but for now copying structure to ensure speed and stability
// Check if we can import MenuGrid/CartPanel or need to recreate

// Simple Product Grid Component (Inline for now to avoid complexity of refactoring POS components immediately)
function ProductGrid({
  products,
  isLoading,
  searchQuery,
  onSearchChange,
  onAdd,
  categories,
  selectedCategory,
  onCategorySelect,
}: {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: (product: Product) => void;
  categories: Category[] | undefined;
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--gray-200)] bg-white p-4">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-50)]">
                <ShoppingBag className="h-5 w-5 text-[var(--brand)]" />
            </div>
            <h3 className="font-semibold text-[var(--gray-900)]">Products</h3>
            </div>
            <div className="relative flex-1 max-w-xs">
            <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9"
            />
            <ShoppingBag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
            </div>
        </div>
        
        {/* Categories */}
        {categories && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--gray-200)] scrollbar-track-transparent">
                <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategorySelect(null)}
                    className={selectedCategory === null ? "bg-[var(--brand)] hover:bg-[var(--brand-dark)]" : ""}
                >
                    All
                </Button>
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onCategorySelect(category.id)}
                         className={selectedCategory === category.id ? "bg-[var(--brand)] hover:bg-[var(--brand-dark)]" : "whitespace-nowrap"}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[var(--gray-500)]">
            <ShoppingBag className="mb-2 h-12 w-12 opacity-20" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => onAdd(product)}
                disabled={product.stock <= 0}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--gray-200)] bg-white shadow-sm transition-all hover:border-[var(--brand-200)] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Image Placeholder */}
                <div className="aspect-square w-full bg-[var(--gray-100)] relative">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--gray-300)]">
                       <ShoppingBag className="h-10 w-10" />
                    </div>
                  )}
                  {product.stock <= 0 && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">
                        OUT OF STOCK
                     </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex w-full flex-1 flex-col p-3 text-left">
                  <h4 className="line-clamp-2 text-sm font-medium text-[var(--gray-900)] group-hover:text-[var(--brand)]">
                    {product.name}
                  </h4>
                  <div className="mt-auto pt-2">
                    <p className="font-bold text-[var(--brand)]">
                      {formatRupiah(parseFloat(product.price))}
                    </p>
                    <p className="text-xs text-[var(--gray-500)]">Stock: {product.stock}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Cart item with quantity
type CartItem = Product & { quantity: number };

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

export default function StoreProductPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  // Fetch Categories
  const { data: categories } = useProductCategories({ active: true });

  // Fetch products (SELL type only)
  // Changed from useProductSells (history) to useProducts (master data)
  const { data: productsData, isLoading } = useProducts({
    type: "SELL",
    active: true,
    search: debouncedSearch || undefined,
    categoryId: selectedCategory || undefined,
    page,
    limit,
  });

  // Create transaction mutation
  const createTransaction = useCreateTransaction();

  const products = productsData?.data ?? [];
  const totalPages = productsData?.meta?.totalPages ?? 1;
  const totalItems = productsData?.meta?.total ?? 0;

  // Calculate totals
  const { total } = useMemo(() => {
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

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    const currentStock = product.stock;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        if (existing.quantity >= currentStock) {
           toast.error(`Cannot add more ${product.name}. Stock limit reached.`);
           return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      if (currentStock <= 0) {
        return prev;
      }
      
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (!item) return prev;

      const currentStock = item.stock;
      const newQuantity = item.quantity + delta;

      if (delta > 0 && newQuantity > currentStock) {
        toast.error(`Cannot add more ${item.name}. Stock limit reached.`);
        return prev;
      }

      return prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId: string) => {
    const item = cart.find((i) => i.id === productId);
    if (item) {
      toast.info(`Removed ${item.name} from cart`);
    }
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, [cart]);

  // Open checkout modal
  const openCheckout = useCallback(() => {
    if (cart.length === 0) return;
    setPaymentMethod("CASH");
    setPaidAmount(total.toString());
    setCustomerName("");
    setIsCheckoutOpen(true);
  }, [cart.length, total]);

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
        customerName: customerName || undefined,
        paymentMethod,
        paidAmount: paymentMethod === "CASH" ? paid : total,
        items: cart.map((item) => ({
          itemType: "PRODUCT",
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transaction");
    }
  }, [cart, createTransaction, customerName, paidAmount, paymentMethod, total]);

  // Close success modal
  const closeSuccess = useCallback(() => {
    setIsSuccessOpen(false);
    setCreatedTransaction(null);
  }, []);

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)]">
        {/* Page Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Store Product</h2>
          <p className="text-sm text-[var(--gray-500)]">Sell equipment and products</p>
        </div>

        <div className="grid h-full gap-6 lg:grid-cols-3">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
             <ProductGrid
                products={products}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={(query) => {
                   setSearchQuery(query);
                   setPage(1);
                }}
                onAdd={addToCart}
                categories={categories?.data}
                selectedCategory={selectedCategory}
                onCategorySelect={(categoryId) => {
                    setSelectedCategory(categoryId);
                    setPage(1);
                }}
             />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-lg border border-[var(--gray-200)] bg-white px-4 py-3">
                <p className="text-sm text-[var(--gray-500)]">
                  Showing {products.length} of {totalItems} items
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
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
                    disabled={page >= totalPages || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="space-y-4 flex flex-col h-full">
            {/* Minimal Cart Panel */}
            <div className="flex flex-col h-full rounded-xl border border-[var(--gray-200)] bg-white shadow-sm">
                 <div className="flex items-center justify-between border-b border-[var(--gray-200)] px-4 py-3">
                    <div className="flex items-center gap-2">
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-50)]">
                          <Receipt className="h-4 w-4 text-[var(--brand)]" />
                       </div>
                       <h3 className="font-semibold text-[var(--gray-900)]">Current Order</h3>
                    </div>
                    <Badge variant="secondary">{cart.length} items</Badge>
                 </div>

                 {/* Cart Items */}
                 <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                       <div className="flex h-full flex-col items-center justify-center text-[var(--gray-400)]">
                          <ShoppingBag className="mb-2 h-10 w-10 opacity-20" />
                          <p className="text-sm">Cart is empty</p>
                       </div>
                    ) : (
                       <div className="space-y-3">
                          {cart.map((item) => (
                             <div key={item.id} className="flex gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
                                {/* Qty Control */}
                                <div className="flex flex-col items-center justify-between gap-1 rounded-md bg-white p-1 shadow-sm">
                                   <button 
                                      onClick={() => updateQuantity(item.id, 1)}
                                      className="flex h-6 w-6 items-center justify-center rounded hover:bg-[var(--gray-100)] text-[var(--brand)]"
                                   >
                                      +
                                   </button>
                                   <span className="text-xs font-semibold">{item.quantity}</span>
                                   <button 
                                      onClick={() => updateQuantity(item.id, -1)}
                                      className="flex h-6 w-6 items-center justify-center rounded hover:bg-[var(--gray-100)] text-[var(--status-danger)]"
                                   >
                                      -
                                   </button>
                                </div>
                                
                                <div className="flex flex-1 flex-col justify-between">
                                   <div className="flex justify-between">
                                      <h4 className="font-medium text-sm text-[var(--gray-900)] line-clamp-1">{item.name}</h4>
                                   </div>
                                   <div className="flex justify-between items-end">
                                      {/* Added delete button */}
                                      <button 
                                         onClick={() => removeFromCart(item.id)}
                                         className="text-xs text-[var(--status-danger)] hover:underline"
                                      >
                                         Remove
                                      </button>
                                      <div className="text-right">
                                         <p className="text-xs text-[var(--gray-500)]">{formatRupiah(parseFloat(item.price))}</p>
                                         <p className="font-bold text-sm text-[var(--brand)]">
                                            {formatRupiah(parseFloat(item.price) * item.quantity)}
                                         </p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>

                 {/* Footer */}
                 <div className="border-t border-[var(--gray-200)] bg-[var(--gray-50)] p-4">
                    <div className="mb-4 space-y-2">
                       <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-[var(--brand)]">{formatRupiah(total)}</span>
                       </div>
                    </div>
                    <Button 
                       className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white"
                       size="lg"
                       disabled={cart.length === 0}
                       onClick={openCheckout}
                    >
                       Charge {formatRupiah(total)}
                    </Button>
                 </div>
            </div>
          </div>
        </div>

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
