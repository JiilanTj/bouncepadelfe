"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStatsQuery } from "@/lib/hooks/useStats";
import { formatRupiah } from "@/lib/utils";
import {
  DollarSign,
  CalendarCheck,
  PackageOpen,
  Armchair,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatTime } from "@/lib/utils/date";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--gray-500)]">{title}</p>
            <p className="text-2xl font-bold text-[var(--gray-900)]">{value}</p>
            <div className="flex items-center gap-1">
              {trend && (
                <>
                  {trendUp ? (
                    <TrendingUp className="h-3.5 w-3.5 text-[var(--status-success)]" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-[var(--status-danger)]" />
                  )}
                  <span className={`text-xs font-medium ${trendUp ? "text-[var(--status-success)]" : "text-[var(--status-danger)]"}`}>
                    {trend}
                  </span>
                </>
              )}
              <span className="text-xs text-[var(--gray-400)]">{description}</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--brand-50)]">
            <Icon className="h-6 w-6 text-[var(--brand)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <p className="text-sm text-[var(--gray-500)]">Last 7 days revenue performance</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
              <XAxis
                dataKey="day"
                stroke="var(--gray-400)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--gray-400)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip
                formatter={(value: number | string | undefined) => [formatRupiah(Number(value) || 0), "Revenue"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--brand)"
                strokeWidth={2}
                dot={{ fill: "var(--brand)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--brand)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStatsQuery();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !stats) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center text-red-500">
          Failed to load dashboard statistics.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Dashboard</h2>
          <p className="text-sm text-[var(--gray-500)]">Overview of your business today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue Today"
            value={formatRupiah(stats.totalRevenueToday)}
            description="vs yesterday"
            icon={DollarSign}
            trend={stats.revenueTrend}
            trendUp={stats.revenueTrendUp}
          />
          <StatCard
            title="Total Bookings Today"
            value={stats.totalBookingsToday.toString()}
            description="vs yesterday"
            icon={CalendarCheck}
            trend={stats.bookingsTrend}
            trendUp={stats.bookingsTrendUp}
          />
          <StatCard
            title="Active Rentals"
            value={stats.activeRentals.toString()}
            description="equipment rented"
            icon={PackageOpen}
          />
          <StatCard
            title="Occupied Tables"
            value={stats.occupiedTables.toString()}
            description="live status"
            icon={Armchair}
          />
        </div>

        {/* Chart Section */}
        <RevenueChart data={stats.revenueChart} />

        {/* Quick Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info-bg)]">
                  <CalendarCheck className="h-5 w-5 text-[var(--status-info)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--gray-900)]">Next Booking</p>
                  <p className="text-xs text-[var(--gray-500)]">
                    {stats.nextBooking ? `${stats.nextBooking.courtName} - ${formatTime(stats.nextBooking.time)}` : "No upcoming bookings"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning-bg)]">
                  <PackageOpen className="h-5 w-5 text-[var(--status-warning)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--gray-900)]">Low Stock Alert</p>
                  <p className="text-xs text-[var(--gray-500)]">
                    {stats.lowStockCount > 0 ? `${stats.lowStockCount} items need restock` : "All stock healthy"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--role-owner-bg)]">
                  <TrendingUp className="h-5 w-5 text-[var(--role-owner)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--gray-900)]">Peak Hour</p>
                  <p className="text-xs text-[var(--gray-500)]">{stats.peakHourToday} today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
