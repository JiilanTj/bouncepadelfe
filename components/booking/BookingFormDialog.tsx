"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourtsQuery } from "@/lib/hooks/useCourts";
import { useCourtAvailabilityQuery } from "@/lib/hooks/useBooking";
import { getToday } from "@/lib/utils/date";
import { BookingCreateInput, BookingSlot } from "@/lib/types/booking.types";
import { Court } from "@/lib/types/courts.types";
import { formatRupiah } from "@/lib/utils";
import { Clock, Calendar, User, AlertCircle } from "lucide-react";

interface BookingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingCreateInput) => void;
  isLoading?: boolean;
}

export function BookingFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: BookingFormDialogProps) {
  // Form State
  const [courtId, setCourtId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [date, setDate] = useState(getToday());
  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState("1");
  const [notes, setNotes] = useState("");
  const [paidAmount, setPaidAmount] = useState("0");

  // Queries
  const { data: courtsData } = useCourtsQuery({ status: "ACTIVE" });
  const { data: availability } = useCourtAvailabilityQuery(courtId, date);

  const selectedCourt = courtsData?.find((c: Court) => c.id === courtId);
  const pricePerHour = selectedCourt ? parseFloat(selectedCourt.pricePerHour) : 0;
  const durationNum = parseFloat(duration) || 0;
  const totalPrice = pricePerHour * durationNum;

  // Derive End Time
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(startDateTime.getTime() + durationNum * 60 * 60 * 1000);
  const endTimeStr = endDateTime.toLocaleTimeString("id-ID", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  }).replace(/\./g, ':');

  // Availability Check
  const isOverlapping = availability?.some((slot: BookingSlot) => {
    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);
    
    return (
        (startDateTime < slotEnd && endDateTime > slotStart)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverlapping) return;

    onSubmit({
      courtId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes,
      paidAmount: parseFloat(paidAmount) || 0,
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-[var(--brand)]" />
            New Court Booking
          </DialogTitle>
          <DialogDescription>
            Book a court for a customer. Availability is checked in real-time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Customer Info Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--gray-900)] flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Information
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                        id="customerPhone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 0812345678"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="customerEmail">Email (Optional)</Label>
                <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                />
            </div>
          </div>

          <hr className="border-[var(--gray-200)]" />

          {/* Booking Details Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--gray-900)] flex items-center gap-2">
                <Clock className="h-4 w-4" /> Booking Details
            </h4>
            <div className="space-y-2">
                <Label>Court</Label>
                <Select value={courtId} onValueChange={setCourtId} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a court" />
                    </SelectTrigger>
                    <SelectContent>
                        {courtsData?.map((court: Court) => (
                            <SelectItem key={court.id} value={court.id}>
                                {court.name} ({formatRupiah(parseFloat(court.pricePerHour))}/hr)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Duration (Hours)</Label>
                    <Input
                        type="number"
                        min={0.1}
                        step={0.1}
                        max={12}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input value={endTimeStr} disabled className="bg-[var(--gray-50)]" />
                </div>
            </div>

            {isOverlapping && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-xs font-medium">This time slot is already booked!</p>
                </div>
            )}
          </div>

          <hr className="border-[var(--gray-200)]" />

          {/* Payment & Notes */}
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--gray-900)] p-4 text-white">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[var(--gray-400)]">Total Price</span>
                    <span className="text-xl font-bold text-[var(--brand)]">{formatRupiah(totalPrice)}</span>
                </div>
                <p className="text-[10px] text-[var(--gray-500)]">Estimated for {duration} hour(s) session</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="paidAmount">Paid Amount (Optional)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--gray-400)]">Rp</span>
                    <Input
                        id="paidAmount"
                        type="number"
                        className="pl-10"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="Enter payment amount"
                    />
                </div>
                <p className="text-[10px] text-[var(--gray-400)]">Leave as 0 for UNPAID status</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or notes..."
                    rows={2}
                />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white"
              disabled={isLoading || isOverlapping || !courtId}
            >
              {isLoading ? "Creating..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
