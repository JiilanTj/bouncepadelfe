"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportsStatsQuery } from "@/lib/hooks/useStats";
import { statsService } from "@/lib/services/stats.service";
import { formatRupiah } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Download,
  TrendingUp,
  CalendarCheck,
  DollarSign,
  Trophy,
  Clock,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const { data: stats, isLoading, isError } = useReportsStatsQuery({
    from: startDate,
    to: endDate,
  });

  const handleExport = async () => {
    try {
      if (!startDate || !endDate) {
          toast.error("Please select both start and end dates");
          return;
      }
      toast.info("Exporting report...");
      await statsService.exportReport({
        from: startDate,
        to: endDate,
      });
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export report");
    }
  };

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
          Failed to load reports statistics.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--gray-900)]">Reports & Analytics</h2>
            <p className="text-sm text-[var(--gray-500)]">Business performance insights</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
                <DatePicker date={startDate} setDate={setStartDate} label="Start Date" />
                <span className="text-muted-foreground">-</span>
                <DatePicker date={endDate} setDate={setEndDate} label="End Date" />
            </div>
            <Button variant="outline" onClick={handleExport} className="ml-2">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Period Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[var(--brand)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Selected Period Total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-[var(--brand)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookingsThisMonth}</div>
               <p className="text-xs text-muted-foreground mt-1">
                Selected Period Total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Booking Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[var(--brand)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(stats.averageBookingValue)}</div>
               <p className="text-xs text-muted-foreground mt-1">
                In Period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Court (Period)
              </CardTitle>
              <Trophy className="h-4 w-4 text-[var(--brand)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topCourt}</div>
               <p className="text-xs text-muted-foreground mt-1">
                Most popular
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview (Period)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.revenueChart}>
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip
                      formatter={(value: number | string | undefined) => formatRupiah(Number(value) || 0)}
                      cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="revenue" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
              <CardHeader>
                  <CardTitle>Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                          <Pie
                              data={stats.revenueBySource}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                          >
                              {stats.revenueBySource.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip formatter={(value: number | string | undefined) => formatRupiah(Number(value) || 0)}/>
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                      {stats.revenueBySource.map((source, index) => (
                          <div key={source.name} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                  <div 
                                      className="h-3 w-3 rounded-full" 
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                                  />
                                  <span>{source.name}</span>
                              </div>
                              <span className="font-medium">{source.percentage}%</span>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Bookings by Court</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.bookingsByCourt.map((court) => (
                            <div key={court.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Trophy className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">{court.name}</span>
                                </div>
                                <div className="font-bold">{court.bookings} bookings</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Busiest Hours</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[300px]">
                    <Clock className="h-16 w-16 text-[var(--brand)] mb-4 opacity-20" />
                    <div className="text-4xl font-bold mb-2">{stats.peakHour}</div>
                    <p className="text-muted-foreground text-center max-w-[200px]">
                        Peak activity time based on booking data for selected period
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
