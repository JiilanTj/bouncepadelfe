import { Court } from "./courts.types";
import { Transaction } from "./transaction.types";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface Booking {
  id: string;
  bookingNumber: string;
  courtId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  startTime: string;
  endTime: string;
  durationHours: string;
  pricePerHour: string;
  totalPrice: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  transactionId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  // Included relations
  court?: Court;
  transaction?: Transaction;
}

export interface BookingCreateInput {
  courtId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  notes?: string;
}

export interface BookingFilter {
  courtId?: string;
  date?: string; // YYYY-MM-DD
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
}

export interface BookingSlot {
  startTime: string;
  endTime: string;
  bookingStatus: BookingStatus;
}
