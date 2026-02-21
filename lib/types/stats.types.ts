export interface DashboardStats {
    totalRevenueToday: number;
    revenueTrend: string;
    revenueTrendUp: boolean;
    totalBookingsToday: number;
    bookingsTrend: string;
    bookingsTrendUp: boolean;
    activeRentals: number;
    occupiedTables: number;
    revenueChart: {
        day: string;
        revenue: number;
    }[];
    nextBooking: {
        courtName: string;
        time: string;
    } | null;
    lowStockCount: number;
    peakHourToday: string;
}

export interface ReportsStats {
    weeklyRevenue: number;
    monthlyRevenue: number;
    totalBookingsThisMonth: number;
    averageBookingValue: number;
    revenueBySource: {
        name: string;
        value: number;
        color: string;
        percentage: number;
    }[];
    bookingsByCourt: {
        name: string;
        bookings: number;
    }[];
    topCourt: string;
    peakHour: string;
    revenueChart: {
        day: string;
        revenue: number;
    }[];
}

export interface DashboardStatsResponse {
    success: boolean;
    message: string;
    data: DashboardStats;
}

export interface ReportsStatsResponse {
    success: boolean;
    message: string;
    data: ReportsStats;
}
