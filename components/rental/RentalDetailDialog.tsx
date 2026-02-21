"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Clock, Info, Banknote, User, Receipt, PackageOpen, Calendar } from "lucide-react";

interface RentalDetailDialogProps {
  rental: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RentalDetailDialog({
  rental,
  isOpen,
  onClose,
}: RentalDetailDialogProps) {
  if (!rental) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-[var(--info-bg)] text-[var(--status-info)] border-[var(--info-border)]">Active</Badge>;
      case "COMPLETED":
        return <Badge className="bg-[var(--success-bg)] text-[var(--status-success)] border-[var(--success-border)]">Returned</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[var(--brand)]" />
            Rental Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Info */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-xs text-[var(--gray-400)] uppercase font-semibold">Invoice Number</p>
              <p className="text-sm font-mono font-bold text-[var(--gray-900)]">{rental.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--gray-400)] uppercase font-semibold mb-1">Status</p>
              {getStatusBadge(rental.status)}
            </div>
          </div>

          {/* Customer & Creator */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-[var(--gray-400)]">
                <User className="h-3 w-3" />
                <span>Customer</span>
              </div>
              <p className="text-sm font-medium">{rental.customerName || "Anonymous"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-[var(--gray-400)]">
                <Clock className="h-3 w-3" />
                <span>Rented At</span>
              </div>
              <p className="text-sm font-medium">{formatDate(rental.createdAt)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-xs text-[var(--gray-400)] uppercase font-semibold tracking-wider">
              <PackageOpen className="h-3 w-3" />
              <span>Rented items</span>
            </div>
            <div className="rounded-lg border bg-[var(--gray-50)]/50 divide-y overflow-hidden">
              {rental.items?.map((item) => (
                <div key={item.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--gray-900)]">{item.product?.name}</p>
                      <p className="text-xs text-[var(--gray-500)]">
                        {item.quantity} units x {formatRupiah(parseFloat(item.unitPrice))}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[var(--brand)]">{formatRupiah(parseFloat(item.subtotal))}</p>
                  </div>
                  
                  {item.expectedReturnAt && (
                    <div className="flex items-center gap-2 rounded bg-white p-2 border border-dashed">
                       <Calendar className="h-3.5 w-3.5 text-[var(--status-info)]" />
                       <div className="flex-1">
                         <p className="text-[10px] text-[var(--gray-400)] leading-none mb-1">Return Deadline</p>
                         <p className="text-xs font-medium text-[var(--status-info)]">{formatDate(item.expectedReturnAt)}</p>
                       </div>
                    </div>
                  )}

                  {item.notes && (
                    <div className="flex items-start gap-2 rounded bg-amber-50/50 p-2 border border-amber-100">
                       <Info className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                       <div className="flex-1">
                         <p className="text-[10px] text-amber-600 leading-none mb-1">Notes / Condition</p>
                         <p className="text-xs text-amber-800 italic">&quot;{item.notes}&quot;</p>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-3 rounded-xl bg-[var(--gray-900)] p-4 text-white">
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Banknote className="h-3 w-3" />
                <span>Base Price</span>
              </div>
              <span>{formatRupiah(parseFloat(rental.totalAmount))}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Banknote className="h-3 w-3" />
                <span>Deposit (Paid)</span>
              </div>
              <span className="text-emerald-400">+{formatRupiah(parseFloat(rental.depositAmount))}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm font-semibold">Total Paid</span>
              <span className="text-lg font-bold">{formatRupiah(parseFloat(rental.paidAmount) + parseFloat(rental.depositAmount))}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
