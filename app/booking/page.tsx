"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Eye,
  FilterX,
  Clock,
  RefreshCw
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import {
  useBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useCompleteBookingMutation,
  useSyncBookingsWithAyoMutation
} from "@/lib/hooks/useBooking";
import { BookingFormDialog } from "@/components/booking/BookingFormDialog";
import { BookingDetailDialog, getBookingStatusColor, getPaymentStatusColor } from "@/components/booking/BookingDetailDialog";
import { formatDate, getToday } from "@/lib/utils/date";
import { Booking, BookingCreateInput } from "@/lib/types/booking.types";

export default function BookingPage() {
  // Filters & UI State
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Queries & Mutations
  const { data: bookingsResponse, isLoading } = useBookingsQuery({
    date: selectedDate,
    limit: 100, // Show all for the day
  });

  const createMutation = useCreateBookingMutation();
  const cancelMutation = useCancelBookingMutation();
  const completeMutation = useCompleteBookingMutation();
  const syncMutation = useSyncBookingsWithAyoMutation();

  const handleCreate = (data: BookingCreateInput) => {
    createMutation.mutate(data, {
      onSuccess: () => setIsAddOpen(false),
    });
  };

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelMutation.mutate(id, {
        onSuccess: () => setSelectedBooking(null),
      });
    }
  };

  const handleComplete = (id: string) => {
    completeMutation.mutate(id, {
      onSuccess: () => setSelectedBooking(null),
    });
  };

  const filteredBookings = bookingsResponse?.data?.filter((b: Booking) =>
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const dateList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-[var(--gray-900)] tracking-tight">Booking Schedule</h2>
            <p className="text-sm text-[var(--gray-500)] font-medium">Manage and monitor court activities in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white hover:bg-[var(--brand-light)] text-[var(--gray-700)] hover:text-[var(--brand)] font-bold px-4 border-[var(--gray-200)] shadow-sm"
              onClick={() => syncMutation.mutate({})}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", syncMutation.isPending && "animate-spin")} />
              {syncMutation.isPending ? "Syncing..." : "Sync Ayo"}
            </Button>
            <Button
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-bold px-6 shadow-lg shadow-[var(--brand)]/20"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Date Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {dateList.map((d) => {
            const dayStr = d.toISOString().split('T')[0];
            const isActive = selectedDate === dayStr;
            return (
              <button
                key={dayStr}
                onClick={() => setSelectedDate(dayStr)}
                className={cn(
                  "flex flex-col items-center min-w-[80px] py-3 rounded-2xl transition-all border-2",
                  isActive
                    ? "bg-[var(--brand)] border-[var(--brand)] text-white shadow-md"
                    : "bg-white border-[var(--gray-100)] text-[var(--gray-600)] hover:border-[var(--brand-light)]"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-lg font-black">{d.getDate()}</span>
              </button>
            );
          })}
          <div className="ml-2 flex items-center gap-2">
            <Input
              type="date"
              className="w-40 border-2 rounded-xl"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* List Card */}
        <Card className="border-0 shadow-xl shadow-[var(--gray-100)]/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-[var(--gray-50)] p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[var(--brand-light)] flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-[var(--brand)]" />
                </div>
                <CardTitle className="text-xl font-bold">{formatDate(selectedDate)}</CardTitle>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
                <Input
                  placeholder="Search customer or booking ID..."
                  className="pl-10 h-11 rounded-xl border-[var(--gray-200)] focus:ring-[var(--brand)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 text-center text-[var(--gray-400)] italic">
                Loading bookings...
              </div>
            ) : filteredBookings.length > 0 ? (
              <Table>
                <TableHeader className="bg-[var(--gray-50)]">
                  <TableRow className="hover:bg-transparent border-[var(--gray-100)]">
                    <TableHead className="font-bold text-[var(--gray-600)] pl-6">Schedule</TableHead>
                    <TableHead className="font-bold text-[var(--gray-600)]">Court</TableHead>
                    <TableHead className="font-bold text-[var(--gray-600)]">Customer</TableHead>
                    <TableHead className="font-bold text-[var(--gray-600)] text-right">Payment</TableHead>
                    <TableHead className="font-bold text-[var(--gray-600)]">Status</TableHead>
                    <TableHead className="font-bold text-[var(--gray-600)] text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking: Booking) => (
                    <TableRow key={booking.id} className="group hover:bg-[var(--gray-50)]/50 border-[var(--gray-50)] transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--gray-400)]" />
                          <span className="font-bold text-[var(--gray-900)]">
                            {new Date(booking.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(/\./g, ':')}
                          </span>
                          <span className="text-[var(--gray-300)]">-</span>
                          <span className="text-[var(--gray-500)] text-sm">
                            {new Date(booking.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(/\./g, ':')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium px-2 py-1 rounded-md bg-[var(--gray-100)] text-[var(--gray-700)] text-xs font-bold">
                          {booking.court?.name || 'Court'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--gray-900)]">{booking.customerName}</span>
                          <span className="text-[10px] text-[var(--gray-400)] font-mono">{booking.bookingNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-[var(--gray-900)]">{formatRupiah(parseFloat(booking.totalPrice))}</span>
                          <Badge variant="outline" className={cn("text-[8px] h-4 mt-1 px-1", getPaymentStatusColor(booking.paymentStatus))}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-bold text-[10px]", getBookingStatusColor(booking.bookingStatus))}>
                          {booking.bookingStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-[var(--brand)] hover:text-white rounded-xl h-8 w-8 p-0"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-20 text-center space-y-3">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gray-100)] text-[var(--gray-400)]">
                  <FilterX className="h-8 w-8" />
                </div>
                <p className="text-[var(--gray-500)] font-medium">No bookings found for this day.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <BookingFormDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      <BookingDetailDialog
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={handleCancel}
        onComplete={handleComplete}
        isLoading={cancelMutation.isPending || completeMutation.isPending}
      />
    </MainLayout>
  );
}
