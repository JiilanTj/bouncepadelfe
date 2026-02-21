export interface DashboardStats {
  totalRevenueToday: number;
  totalBookingsToday: number;
  activeRentals: number;
  occupiedTables: number;
  totalRevenueWeek: number;
  totalRevenueMonth: number;
}

export interface RevenueData {
  day: string;
  revenue: number;
  bookings: number;
}

export interface CourtUtilization {
  courtId: string;
  courtName: string;
  bookingsCount: number;
  totalHours: number;
  revenue: number;
}

export interface BusinessSettings {
  name: string;
  phone: string;
  address: string;
  email?: string;
  taxRate?: number;
  currency?: string;
  logoUrl?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
}
