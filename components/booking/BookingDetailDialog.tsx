"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking, BookingStatus, PaymentStatus } from "@/lib/types/booking.types";
import { formatRupiah, cn } from "@/lib/utils";
import { formatDateTime, formatDate } from "@/lib/utils/date";
import { 
    Clock, 
    Calendar, 
    User, 
    Phone, 
    Mail, 
    FileText, 
    CheckCircle2,
    XCircle,
} from "lucide-react";

export function getBookingStatusColor(status: BookingStatus) {
    switch (status) {
        case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-100";
        case "CONFIRMED": return "bg-green-50 text-green-700 border-green-100";
        case "COMPLETED": return "bg-blue-50 text-blue-700 border-blue-100";
        case "CANCELLED": return "bg-red-50 text-red-700 border-red-100";
        default: return "bg-[var(--gray-50)] text-[var(--gray-700)] border-[var(--gray-100)]";
    }
}

export function getPaymentStatusColor(status: PaymentStatus) {
    switch (status) {
        case "PAID": return "bg-green-50 text-green-700 border-green-100";
        case "PARTIAL": return "bg-orange-50 text-orange-700 border-orange-100";
        case "UNPAID": return "bg-red-50 text-red-700 border-red-100";
        default: return "bg-[var(--gray-50)] text-[var(--gray-700)] border-[var(--gray-100)]";
    }
}

interface BookingDetailDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  isLoading?: boolean;
}

export function BookingDetailDialog({
  booking,
  isOpen,
  onClose,
  onCancel,
  onComplete,
  isLoading,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh] p-0 border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Booking Details - {booking.bookingNumber}</DialogTitle>
          <DialogDescription>
            Detailed information about court booking {booking.bookingNumber}
          </DialogDescription>
        </DialogHeader>
        {/* Header with status background */}
        <div className={cn(
            "p-6 text-white pt-8 pb-12",
            booking.bookingStatus === 'CANCELLED' ? "bg-red-600" :
            booking.bookingStatus === 'COMPLETED' ? "bg-blue-600" :
            booking.bookingStatus === 'CONFIRMED' ? "bg-green-600" : "bg-[var(--gray-900)]"
        )}>
            <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-md">
                    {booking.bookingNumber}
                </Badge>
                <div className="text-right">
                    <p className="text-xs opacity-70">Status</p>
                    <p className="font-bold uppercase tracking-wider">{booking.bookingStatus}</p>
                </div>
            </div>
            <h2 className="text-3xl font-black mb-1">{booking.court?.name || 'Court'}</h2>
            <p className="opacity-80 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {formatDate(booking.startTime)}
            </p>
        </div>

        {/* Content Card (Half offset) */}
        <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-[var(--gray-100)]">
            <div className="p-6 space-y-6">
                {/* Time & Price Row */}
                <div className="flex justify-between divide-x divide-[var(--gray-100)]">
                    <div className="flex-1 pr-4">
                        <p className="text-[10px] text-[var(--gray-500)] uppercase font-bold tracking-widest mb-1">Schedule</p>
                        <div className="flex items-center gap-2 text-[var(--gray-900)] font-semibold text-xs">
                            <Clock className="h-3 w-3 text-[var(--brand)]" />
                            {new Date(booking.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':')} - {new Date(booking.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':')}
                        </div>
                        <p className="text-[10px] text-[var(--gray-400)] mt-1">{booking.durationHours} hours session</p>
                    </div>
                    <div className="flex-1 pl-4 text-right">
                        <p className="text-[10px] text-[var(--gray-500)] uppercase font-bold tracking-widest mb-1">Total Fee</p>
                        <div className="text-xl font-black text-[var(--brand)]">
                            {formatRupiah(parseFloat(booking.totalPrice))}
                        </div>
                        <Badge variant="outline" className={cn("mt-1 text-[10px]", getPaymentStatusColor(booking.paymentStatus))}>
                            {booking.paymentStatus}
                        </Badge>
                    </div>
                </div>

                <hr className="border-[var(--gray-100)]" />

                {/* Customer Section */}
                <div className="space-y-3">
                    <p className="text-[10px] text-[var(--gray-500)] uppercase font-bold tracking-widest">Customer Details</p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--gray-50)] flex items-center justify-center">
                            <User className="h-5 w-5 text-[var(--gray-400)]" />
                        </div>
                        <div>
                            <p className="font-bold text-[var(--gray-900)] leading-none">{booking.customerName}</p>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-[var(--gray-500)] flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {booking.customerPhone}
                                </span>
                                {booking.customerEmail && (
                                    <span className="text-xs text-[var(--gray-500)] flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> {booking.customerEmail}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linked Transaction */}
                {booking.transaction && (
                    <div className="p-4 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-100)]">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-[var(--gray-500)] uppercase font-bold">Linked Invoice</p>
                            <span className="text-xs font-mono text-[var(--gray-900)]">{booking.transaction.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-[var(--gray-500)]">Paid Amount</span>
                            <span className="font-bold">{formatRupiah(parseFloat(booking.transaction.paidAmount))}</span>
                        </div>
                        {parseFloat(booking.transaction.changeAmount) > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-[var(--gray-500)]">Change Amount</span>
                                <span className="text-green-600 font-bold">{formatRupiah(parseFloat(booking.transaction.changeAmount))}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Notes */}
                {booking.notes && (
                    <div className="space-y-1">
                        <p className="text-[10px] text-[var(--gray-500)] uppercase font-bold tracking-widest flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Notes
                        </p>
                        <p className="text-sm text-[var(--gray-600)] italic pl-4 border-l-2 border-[var(--gray-100)]">
                            &quot;{booking.notes}&quot;
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    {booking.bookingStatus === 'PENDING' || booking.bookingStatus === 'CONFIRMED' ? (
                        <>
                            <Button 
                                variant="outline" 
                                className="flex-1 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => onCancel?.(booking.id)}
                                disabled={isLoading}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button 
                                className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white"
                                onClick={() => onComplete?.(booking.id)}
                                disabled={isLoading}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Complete
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </div>

        <div className="p-6 pt-4 text-center">
             <p className="text-[10px] text-[var(--gray-400)]">
                Recorded on {formatDateTime(booking.createdAt)}
             </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
