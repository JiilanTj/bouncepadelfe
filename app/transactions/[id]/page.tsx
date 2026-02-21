"use client";

import { use, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  ArrowLeft,
  Receipt,
  Calendar,
  User,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  Package,
  Utensils,
  XCircle,
  CheckCircle,
  Clock,
  MapPin,
  Printer,
} from "lucide-react";
import { useTransaction, useCancelTransaction, useCompleteTransaction } from "@/lib/hooks/queries";
import { useAuthStore } from "@/lib/store";
import { TransactionType, TransactionStatus, PaymentMethod, TransactionItemType } from "@/lib/types";
import { formatRupiah, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ThermalReceipt } from "@/components/transaction/ThermalReceipt";

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

function getTypeBadgeColor(type: TransactionType): string {
  switch (type) {
    case "POS":
      return "bg-[var(--info-bg)] text-[var(--status-info)] border-[var(--info-border)]";
    case "RENTAL":
      return "bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]";
    case "BOOKING":
      return "bg-[var(--brand-50)] text-[var(--brand)] border-[var(--brand-100)]";
    default:
      return "bg-[var(--gray-100)] text-[var(--gray-600)] border-[var(--gray-200)]";
  }
}

function getStatusBadgeColor(status: TransactionStatus): string {
  switch (status) {
    case "PAID":
      return "bg-[var(--success-bg)] text-[var(--status-success)] border-[var(--success-border)]";
    case "COMPLETED":
      return "bg-[var(--brand-50)] text-[var(--brand)] border-[var(--brand-100)]";
    case "PENDING":
      return "bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]";
    case "CANCELLED":
      return "bg-[var(--danger-bg)] text-[var(--status-danger)] border-[var(--danger-border)]";
    default:
      return "bg-[var(--gray-100)] text-[var(--gray-600)] border-[var(--gray-200)]";
  }
}

function getPaymentMethodIcon(method: PaymentMethod) {
  const iconClass = "h-5 w-5";
  switch (method) {
    case "CASH":
      return <Banknote className={iconClass} />;
    case "QRIS":
      return <QrCode className={iconClass} />;
    case "TRANSFER":
      return <CreditCard className={iconClass} />;
    case "OTHER":
      return <Wallet className={iconClass} />;
    default:
      return <Banknote className={iconClass} />;
  }
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "CASH":
      return "Cash";
    case "QRIS":
      return "QRIS";
    case "TRANSFER":
      return "Transfer";
    case "OTHER":
      return "Other";
    default:
      return method;
  }
}

function getItemTypeIcon(itemType: TransactionItemType) {
  const iconClass = "h-4 w-4";
  switch (itemType) {
    case "PRODUCT":
      return <Package className={iconClass} />;
    case "MENU":
      return <Utensils className={iconClass} />;
    case "BOOKING":
      return <Calendar className={iconClass} />;
    default:
      return <Package className={iconClass} />;
  }
}

function getItemName(item: { itemType: TransactionItemType; product?: { name: string } | null; menu?: { name: string } | null; notes?: string | null }): string {
  if (item.itemType === "PRODUCT" && item.product) {
    return item.product.name;
  }
  if (item.itemType === "MENU" && item.menu) {
    return item.menu.name;
  }
  if (item.notes) {
    return item.notes;
  }
  return "Unknown Item";
}

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const { data, isLoading, error } = useTransaction(id);
  const cancelMutation = useCancelTransaction();
  const completeMutation = useCompleteTransaction();

  const transaction = data?.transaction;
  const items = data?.items || [];

  // Check if user can perform actions (OWNER/ADMIN only)
  const canPerformActions = user?.role === "OWNER" || user?.role === "ADMIN";

  // Check if transaction can be cancelled
  const canCancel = canPerformActions && transaction && (transaction.status === "PENDING" || transaction.status === "PAID");

  // Check if transaction can be completed (only for RENTAL type)
  const canComplete = canPerformActions && transaction && transaction.type === "RENTAL" && transaction.status === "PAID";

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Transaction cancelled successfully");
      setShowCancelDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel transaction");
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(id);
      toast.success("Rental completed successfully");
      setShowCompleteDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete rental");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--brand)]" />
          <span className="ml-3 text-lg text-[var(--gray-500)]">Loading transaction...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !transaction) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex h-64 flex-col items-center justify-center p-6">
              <XCircle className="h-12 w-12 text-[var(--status-danger)]" />
              <p className="mt-4 text-lg font-medium text-[var(--gray-700)]">Transaction not found</p>
              <p className="text-sm text-[var(--gray-500)]">
                {error instanceof Error ? error.message : "The transaction you are looking for does not exist."}
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-[var(--gray-900)]">Transaction Detail</h2>
              <p className="text-sm text-[var(--gray-500)]">{transaction.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--danger-border)] text-[var(--status-danger)] hover:bg-[var(--danger-bg)]"
                onClick={() => setShowCancelDialog(true)}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Cancel
              </Button>
            )}
            {canComplete && (
              <Button
                size="sm"
                className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                onClick={() => setShowCompleteDialog(true)}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Complete Rental
              </Button>
            )}
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`rounded-lg border px-4 py-3 ${getStatusBadgeColor(transaction.status)}`}
        >
          <div className="flex items-center gap-2">
            {transaction.status === "PENDING" && <Clock className="h-5 w-5" />}
            {transaction.status === "PAID" && <CheckCircle className="h-5 w-5" />}
            {transaction.status === "COMPLETED" && <CheckCircle className="h-5 w-5" />}
            {transaction.status === "CANCELLED" && <XCircle className="h-5 w-5" />}
            <span className="font-semibold">Status: {transaction.status}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Transaction Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Receipt className="h-5 w-5 text-[var(--brand)]" />
                  Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="py-8 text-center text-[var(--gray-500)]">No items in this transaction</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--gray-200)] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gray-100)]">
                            {getItemTypeIcon(item.itemType)}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--gray-900)]">{getItemName(item)}</p>
                            <p className="text-sm text-[var(--gray-500)]">
                              {formatRupiah(parseFloat(item.unitPrice))} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-[var(--gray-900)]">
                          {formatRupiah(parseFloat(item.subtotal))}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Banknote className="h-5 w-5 text-[var(--brand)]" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-[var(--gray-600)]">
                    <span>Subtotal</span>
                    <span>{formatRupiah(parseFloat(transaction.totalAmount))}</span>
                  </div>
                  <div className="flex justify-between text-[var(--gray-600)]">
                    <span>Tax (0%)</span>
                    <span>{formatRupiah(0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold text-[var(--gray-900)]">
                    <span>Total</span>
                    <span>{formatRupiah(parseFloat(transaction.totalAmount))}</span>
                  </div>
                  <div className="flex justify-between text-[var(--gray-600)]">
                    <span>Paid Amount</span>
                    <span>{formatRupiah(parseFloat(transaction.paidAmount))}</span>
                  </div>
                  <div className="flex justify-between text-[var(--brand)]">
                    <span>Change</span>
                    <span>{formatRupiah(parseFloat(transaction.changeAmount))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Transaction Info Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Transaction Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Receipt className="mt-0.5 h-4 w-4 text-[var(--gray-400)]" />
                  <div>
                    <p className="text-sm text-[var(--gray-500)]">Invoice Number</p>
                    <p className="font-medium text-[var(--gray-900)]">{transaction.invoiceNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-[var(--gray-400)]" />
                  <div>
                    <p className="text-sm text-[var(--gray-500)]">Date & Time</p>
                    <p className="font-medium text-[var(--gray-900)]">{formatDate(transaction.createdAt)}</p>
                    <p className="text-xs text-[var(--gray-400)]">
                      {new Date(transaction.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded bg-[var(--gray-100)] p-0.5">
                    {getPaymentMethodIcon(transaction.paymentMethod)}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--gray-500)]">Payment Method</p>
                    <p className="font-medium text-[var(--gray-900)]">
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className={getTypeBadgeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Customer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 text-[var(--gray-400)]" />
                  <div>
                    <p className="text-sm text-[var(--gray-500)]">Customer Name</p>
                    <p className="font-medium text-[var(--gray-900)]">
                      {transaction.customerName || "Walk-in Customer"}
                    </p>
                  </div>
                </div>
                {transaction.table && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-[var(--gray-400)]" />
                    <div>
                      <p className="text-sm text-[var(--gray-500)]">Table</p>
                      <p className="font-medium text-[var(--gray-900)]">
                        {transaction.table.code} - {transaction.table.name}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff Info Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Staff Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 text-[var(--gray-400)]" />
                  <div>
                    <p className="text-sm text-[var(--gray-500)]">Created By</p>
                    <p className="font-medium text-[var(--gray-900)]">
                      {transaction.creator?.name || "Unknown"}
                    </p>
                    {transaction.creator?.role && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {transaction.creator.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this transaction? This action will restore stock for all items
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="bg-[var(--status-danger)] hover:bg-[var(--status-danger)]/90"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Transaction"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Rental?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete this rental? This indicates that all rented items have been
              returned and stock will be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeMutation.isPending}>No, Not Yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                "Yes, Complete Rental"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>

      {/* Hidden Thermal Receipt for Printing (Outside MainLayout for better print control) */}
      {transaction && (
        <div className="thermal-receipt-container">
          <ThermalReceipt transaction={transaction} items={items} />
        </div>
      )}
    </>
  );
}
