// Dummy data for BouncePadel Backoffice
// Types imported from @/lib/types

import { UserRole } from "./types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
}

export interface Court {
  id: string;
  name: string;
  pricePerHour: number;
  status: "AVAILABLE" | "MAINTENANCE";
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  type: "FOOD" | "DRINK" | "STORE" | "RENTAL";
  status?: "AVAILABLE" | "RENTED";
}

export interface Table {
  id: string;
  code: string;
  status: "EMPTY" | "OCCUPIED";
}

export type BookingStatus = "BOOKED" | "DONE" | "CANCELLED";

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  status: BookingStatus;
}

export interface RevenueData {
  day: string;
  revenue: number;
}

// Users
export const users: User[] = [
  { id: "1", name: "John Owner", email: "owner@padel.com", role: "OWNER", status: "ACTIVE" },
  { id: "2", name: "Jane Admin", email: "admin@padel.com", role: "ADMIN", status: "ACTIVE" },
  { id: "3", name: "Mike Kasir", email: "kasir@padel.com", role: "KASIR", status: "ACTIVE" },
  { id: "4", name: "Sarah Admin", email: "sarah@padel.com", role: "ADMIN", status: "ACTIVE" },
  { id: "5", name: "Tom Kasir", email: "tom@padel.com", role: "KASIR", status: "INACTIVE" },
];

// Courts
export const courts: Court[] = [
  { id: "1", name: "Court A", pricePerHour: 150000, status: "AVAILABLE" },
  { id: "2", name: "Court B", pricePerHour: 150000, status: "AVAILABLE" },
  { id: "3", name: "Court C", pricePerHour: 180000, status: "AVAILABLE" },
  { id: "4", name: "Court D", pricePerHour: 180000, status: "MAINTENANCE" },
  { id: "5", name: "Court E", pricePerHour: 200000, status: "AVAILABLE" },
  { id: "6", name: "Court F", pricePerHour: 200000, status: "AVAILABLE" },
];

// Products (Food & Drinks for POS)
export const foodProducts: Product[] = [
  { id: "f1", name: "Chicken Wings", price: 45000, stock: 20, type: "FOOD" },
  { id: "f2", name: "French Fries", price: 25000, stock: 30, type: "FOOD" },
  { id: "f3", name: "Burger", price: 55000, stock: 15, type: "FOOD" },
  { id: "f4", name: "Pizza Slice", price: 35000, stock: 12, type: "FOOD" },
  { id: "f5", name: "Nachos", price: 30000, stock: 18, type: "FOOD" },
  { id: "f6", name: "Sandwich", price: 40000, stock: 22, type: "FOOD" },
];

export const drinkProducts: Product[] = [
  { id: "d1", name: "Mineral Water", price: 10000, stock: 50, type: "DRINK" },
  { id: "d2", name: "Iced Tea", price: 18000, stock: 40, type: "DRINK" },
  { id: "d3", name: "Lemonade", price: 22000, stock: 35, type: "DRINK" },
  { id: "d4", name: "Fresh Juice", price: 28000, stock: 25, type: "DRINK" },
  { id: "d5", name: "Coffee", price: 25000, stock: 30, type: "DRINK" },
  { id: "d6", name: "Soft Drink", price: 15000, stock: 45, type: "DRINK" },
  { id: "d7", name: "Energy Drink", price: 20000, stock: 20, type: "DRINK" },
  { id: "d8", name: "Smoothie", price: 35000, stock: 15, type: "DRINK" },
];

// Store Products
export const storeProducts: Product[] = [
  { id: "s1", name: "Padel Racket Pro", price: 1200000, stock: 10, type: "STORE" },
  { id: "s2", name: "Padel Racket Beginner", price: 650000, stock: 15, type: "STORE" },
  { id: "s3", name: "Padel Balls (3-pack)", price: 85000, stock: 50, type: "STORE" },
  { id: "s4", name: "Grip Tape", price: 35000, stock: 40, type: "STORE" },
  { id: "s5", name: "Wristband", price: 25000, stock: 30, type: "STORE" },
  { id: "s6", name: "Headband", price: 20000, stock: 25, type: "STORE" },
  { id: "s7", name: "Sports Towel", price: 45000, stock: 20, type: "STORE" },
  { id: "s8", name: "Padel Bag", price: 350000, stock: 12, type: "STORE" },
];

// Rental Products
export const rentalProducts: Product[] = [
  { id: "r1", name: "Racket Set A", price: 50000, stock: 5, type: "RENTAL", status: "RENTED" },
  { id: "r2", name: "Racket Set B", price: 50000, stock: 5, type: "RENTAL", status: "AVAILABLE" },
  { id: "r3", name: "Racket Set C", price: 50000, stock: 5, type: "RENTAL", status: "AVAILABLE" },
  { id: "r4", name: "Racket Set D", price: 50000, stock: 5, type: "RENTAL", status: "RENTED" },
  { id: "r5", name: "Racket Set E", price: 50000, stock: 5, type: "RENTAL", status: "AVAILABLE" },
  { id: "r6", name: "Racket Set F", price: 50000, stock: 5, type: "RENTAL", status: "AVAILABLE" },
  { id: "r7", name: "Padel Balls", price: 25000, stock: 10, type: "RENTAL", status: "AVAILABLE" },
  { id: "r8", name: "Grip Bundle", price: 15000, stock: 20, type: "RENTAL", status: "AVAILABLE" },
];

// Tables
export const tables: Table[] = [
  { id: "t1", code: "T01", status: "OCCUPIED" },
  { id: "t2", code: "T02", status: "EMPTY" },
  { id: "t3", code: "T03", status: "EMPTY" },
  { id: "t4", code: "T04", status: "OCCUPIED" },
  { id: "t5", code: "T05", status: "EMPTY" },
  { id: "t6", code: "T06", status: "EMPTY" },
  { id: "t7", code: "T07", status: "OCCUPIED" },
  { id: "t8", code: "T08", status: "EMPTY" },
  { id: "t9", code: "T09", status: "EMPTY" },
  { id: "t10", code: "T10", status: "EMPTY" },
  { id: "t11", code: "T11", status: "OCCUPIED" },
  { id: "t12", code: "T12", status: "EMPTY" },
];

// Bookings
export const bookings: Booking[] = [
  { id: "b1", courtId: "1", courtName: "Court A", date: "2026-02-12", time: "09:00 - 11:00", customerName: "Alex Johnson", customerPhone: "081234567890", status: "DONE" },
  { id: "b2", courtId: "2", courtName: "Court B", date: "2026-02-12", time: "10:00 - 12:00", customerName: "Maria Garcia", customerPhone: "081234567891", status: "BOOKED" },
  { id: "b3", courtId: "3", courtName: "Court C", date: "2026-02-12", time: "14:00 - 16:00", customerName: "David Lee", customerPhone: "081234567892", status: "BOOKED" },
  { id: "b4", courtId: "1", courtName: "Court A", date: "2026-02-12", time: "16:00 - 18:00", customerName: "Sarah Wilson", customerPhone: "081234567893", status: "BOOKED" },
  { id: "b5", courtId: "5", courtName: "Court E", date: "2026-02-12", time: "18:00 - 20:00", customerName: "James Brown", customerPhone: "081234567894", status: "BOOKED" },
  { id: "b6", courtId: "2", courtName: "Court B", date: "2026-02-11", time: "08:00 - 10:00", customerName: "Emma Davis", customerPhone: "081234567895", status: "DONE" },
  { id: "b7", courtId: "3", courtName: "Court C", date: "2026-02-11", time: "19:00 - 21:00", customerName: "Chris Martinez", customerPhone: "081234567896", status: "CANCELLED" },
  { id: "b8", courtId: "6", courtName: "Court F", date: "2026-02-13", time: "09:00 - 11:00", customerName: "Lisa Anderson", customerPhone: "081234567897", status: "BOOKED" },
  { id: "b9", courtId: "5", courtName: "Court E", date: "2026-02-13", time: "15:00 - 17:00", customerName: "Robert Taylor", customerPhone: "081234567898", status: "BOOKED" },
  { id: "b10", courtId: "1", courtName: "Court A", date: "2026-02-13", time: "19:00 - 21:00", customerName: "Jennifer White", customerPhone: "081234567899", status: "BOOKED" },
];

// Revenue Data (Last 7 days)
export const revenueData: RevenueData[] = [
  { day: "Mon", revenue: 2500000 },
  { day: "Tue", revenue: 3200000 },
  { day: "Wed", revenue: 2800000 },
  { day: "Thu", revenue: 4100000 },
  { day: "Fri", revenue: 5200000 },
  { day: "Sat", revenue: 6800000 },
  { day: "Sun", revenue: 5900000 },
];

// Dashboard Stats
export const dashboardStats = {
  totalRevenueToday: 2850000,
  totalBookingsToday: 12,
  activeRentals: 2,
  occupiedTables: 4,
};

// Reports Data
export const reportsData = {
  weeklyRevenue: 30500000,
  monthlyRevenue: 128500000,
  totalBookingsThisMonth: 156,
  averageBookingValue: 824000,
  topCourt: "Court E",
  peakHour: "18:00 - 20:00",
};

// Transaction Types
export type TransactionType = "BOOKING" | "POS" | "RENTAL" | "STORE";
export type TransactionStatus = "COMPLETED" | "PENDING" | "REFUNDED";

export interface Transaction {
  id: string;
  date: string;
  time: string;
  customerName: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: "CASH" | "CARD" | "QRIS" | "TRANSFER";
}

// Transactions
export const transactions: Transaction[] = [
  { id: "TRX-001", date: "2026-02-12", time: "09:15", customerName: "Alex Johnson", type: "BOOKING", description: "Court A - 2 hours", amount: 300000, status: "COMPLETED", paymentMethod: "CASH" },
  { id: "TRX-002", date: "2026-02-12", time: "10:30", customerName: "Maria Garcia", type: "POS", description: "Chicken Wings, Iced Tea (2)", amount: 81000, status: "COMPLETED", paymentMethod: "QRIS" },
  { id: "TRX-003", date: "2026-02-12", time: "11:45", customerName: "David Lee", type: "RENTAL", description: "Racket Set B", amount: 50000, status: "COMPLETED", paymentMethod: "CASH" },
  { id: "TRX-004", date: "2026-02-12", time: "12:20", customerName: "Sarah Wilson", type: "POS", description: "Burger, Fresh Juice, Coffee", amount: 118000, status: "COMPLETED", paymentMethod: "CARD" },
  { id: "TRX-005", date: "2026-02-12", time: "14:00", customerName: "James Brown", type: "BOOKING", description: "Court C - 2 hours", amount: 360000, status: "PENDING", paymentMethod: "TRANSFER" },
  { id: "TRX-006", date: "2026-02-12", time: "15:30", customerName: "Emma Davis", type: "POS", description: "French Fries, Soft Drink (3)", amount: 70000, status: "COMPLETED", paymentMethod: "CASH" },
  { id: "TRX-007", date: "2026-02-12", time: "16:45", customerName: "Chris Martinez", type: "RENTAL", description: "Racket Set D, Padel Balls", amount: 75000, status: "COMPLETED", paymentMethod: "QRIS" },
  { id: "TRX-008", date: "2026-02-11", time: "08:30", customerName: "Lisa Anderson", type: "BOOKING", description: "Court B - 2 hours", amount: 300000, status: "COMPLETED", paymentMethod: "CARD" },
  { id: "TRX-009", date: "2026-02-11", time: "13:15", customerName: "Robert Taylor", type: "POS", description: "Pizza Slice, Energy Drink", amount: 55000, status: "REFUNDED", paymentMethod: "CASH" },
  { id: "TRX-010", date: "2026-02-11", time: "17:00", customerName: "Jennifer White", type: "BOOKING", description: "Court E - 2 hours", amount: 400000, status: "COMPLETED", paymentMethod: "QRIS" },
  { id: "TRX-011", date: "2026-02-11", time: "19:30", customerName: "Michael Chen", type: "STORE", description: "Padel Racket Pro, Grip Tape", amount: 1235000, status: "COMPLETED", paymentMethod: "TRANSFER" },
  { id: "TRX-012", date: "2026-02-10", time: "10:00", customerName: "Amanda Lewis", type: "BOOKING", description: "Court F - 2 hours", amount: 400000, status: "COMPLETED", paymentMethod: "CASH" },
];

// Business Settings
export const businessSettings = {
  name: "BouncePadel Jakarta",
  phone: "+62 21 1234 5678",
  address: "Jl. Sudirman No. 123, Jakarta",
};
