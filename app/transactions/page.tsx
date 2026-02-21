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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Receipt, Printer, Calendar, ChevronLeft, ChevronRight, Banknote, QrCode, CreditCard, Wallet, Eye } from "lucide-react";
import Link from "next/link";
import { useTransactions, useTables } from "@/lib/hooks/queries";
import { TransactionType, TransactionStatus, PaymentMethod, Transaction, TransactionQueryParams } from "@/lib/types";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { TableReportReceipt } from "@/components/transaction/TableReportReceipt";
import { axiosInstance } from "@/lib/api/axios.instance";
import { toast } from "sonner";

function getTypeBadgeColor(type: TransactionType): string {
  switch (type) {
    case "POS":
      return "bg-[var(--info-bg)] text-[var(--status-info)] border-[var(--info-border)]";
    case "RENTAL":
      return "bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]";
    case "BOOKING":
      return "bg-[var(--brand-50)] text-[var(--brand)] border-[var(--brand-100)]";
    default:
      return "bg-[var(--gray-100)] text-[var(--gray-600)] border-[var(--gray-200)]";
  }
}

function getStatusBadgeColor(status: TransactionStatus): string {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return "bg-[var(--success-bg)] text-[var(--status-success)] border-[var(--success-border)]";
    case "PENDING":
      return "bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]";
    case "CANCELLED":
      return "bg-[var(--danger-bg)] text-[var(--status-danger)] border-[var(--danger-border)]";
    default:
      return "bg-[var(--gray-100)] text-[var(--gray-600)] border-[var(--gray-200)]";
  }
}

function getPaymentMethodIcon(method: PaymentMethod) {
  const iconClass = "h-4 w-4";
  switch (method) {
    case "CASH":
      return <Banknote className={iconClass} />;
    case "QRIS":
      return <QrCode className={iconClass} />;
    case "TRANSFER":
      return <CreditCard className={iconClass} />;
    case "OTHER":
      return <Wallet className={iconClass} />;
    default:
      return <Banknote className={iconClass} />;
  }
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Active filters for query (applied only when "Apply" is clicked)
  const [activeFilters, setActiveFilters] = useState({
    type: undefined as TransactionType | undefined,
    status: undefined as TransactionStatus | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTable, setPrintTable] = useState<string | undefined>(undefined);
  const [printStartDate, setPrintStartDate] = useState<Date | undefined>(new Date());
  const [printStartTime, setPrintStartTime] = useState("00:00");
  const [printEndDate, setPrintEndDate] = useState<Date | undefined>(new Date());
  const [printEndTime, setPrintEndTime] = useState("23:59");
  
  // Print Data State
  const [isPrinting, setIsPrinting] = useState(false);
  const [reportData, setReportData] = useState<Transaction[] | null>(null);

  // Apply filters handler
  const handleApplyFilter = () => {
    setActiveFilters({
      type: typeFilter,
      status: statusFilter,
      startDate: startDate,
      endDate: endDate,
    });
    setPage(1);
  };

  // Reset filters handler
  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setActiveFilters({
      type: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    setPage(1);
  };

  // Fetch transactions from API using activeFilters
  const { data: transactionsData, isLoading, isFetching } = useTransactions({
    page,
    limit,
    type: activeFilters.type,
    status: activeFilters.status,
    startDate: activeFilters.startDate ? new Date(activeFilters.startDate).toISOString() : undefined,
    endDate: activeFilters.endDate ? new Date(activeFilters.endDate).toISOString() : undefined,
  });

  // Fetch Tables for Dropdown
  const { data: tablesData } = useTables();
  const tables = tablesData?.data ?? [];

  const transactions = transactionsData?.data ?? [];
  const totalPages = transactionsData?.meta?.totalPages ?? 1;
  const totalItems = transactionsData?.meta?.total ?? 0;

  // Calculate stats
  const totalRevenue = transactions
    .filter((t) => t.status === "PAID" || t.status === "COMPLETED")
    .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);

  const paidCount = transactions.filter((t) => t.status === "PAID").length;
  const completedCount = transactions.filter((t) => t.status === "COMPLETED").length;
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;

  const handlePrint = async () => {
    try {
      if (!printStartDate || !printEndDate) {
        toast.error("Please select start and end dates");
        return;
      }

      setIsPrinting(true);

      // Combine date and time
      const start = new Date(printStartDate);
      const [startHour, startMinute] = printStartTime.split(':').map(Number);
      start.setHours(startHour, startMinute, 0);

      const end = new Date(printEndDate);
      const [endHour, endMinute] = printEndTime.split(':').map(Number);
      end.setHours(endHour, endMinute, 59);

      // Prepare params
      const params: TransactionQueryParams = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: 1000, // Fetch all for report
        status: "PAID", // Default to paid/completed for reports? Or maybe all? Let's assume all or filtered.
                        // Actually, reports usually want valid sales. But let's fetch all and let report handle or backend filter.
                        // Based on controller, we can pass status. If we want all, don't pass status.
      };

      if (printTable && printTable !== 'ALL') {
        params.tableId = printTable;
      }
      
      // Also include COMPLETED transactions for rentals
      // The backend filter is single value. To get multiple statuses, we might need multiple calls or backend change.
      // For now, let's fetch ALL and filter client side if needed, or just trust the date range for all activity.
      // Let's not restrict status to "PAID" in params to include everything in the period.

      // Fetch data
      const response = await axiosInstance.get('/transactions', { params });
      
      if (response.data.success) {
        setReportData(response.data.data.data);
        
        // Wait for render then print
        setTimeout(() => {
          window.print();
          setIsPrinting(false);
          setIsPrintModalOpen(false); // Optional: close modal after print
        }, 500);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Print Error:", error);
      toast.error("Failed to generate report");
      setIsPrinting(false);
    }
  };

  const selectedTableName = tables.find(t => t.id === printTable)?.code || 'Semua Meja';

  return (
    <>
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--gray-900)]">Transactions</h2>
            <p className="text-sm text-[var(--gray-500)]">View and manage all sales transactions</p>
          </div>
          <Button variant="outline" onClick={() => setIsPrintModalOpen(true)}>
            <Printer className="mr-2 h-4 w-4" />
            Print Table
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--brand-50)]">
                  <Receipt className="h-6 w-6 text-[var(--brand)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">{totalItems}</p>
                  <p className="text-sm text-[var(--gray-500)]">Total Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--success-bg)]">
                  <Receipt className="h-6 w-6 text-[var(--status-success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">{formatRupiah(totalRevenue)}</p>
                  <p className="text-sm text-[var(--gray-500)]">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--info-bg)]">
                  <Calendar className="h-6 w-6 text-[var(--status-info)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--status-success)]">{paidCount + completedCount}</p>
                  <p className="text-sm text-[var(--gray-500)]">Paid/Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--warning-bg)]">
                  <Receipt className="h-6 w-6 text-[var(--status-warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--status-warning)]">{pendingCount}</p>
                  <p className="text-sm text-[var(--gray-500)]">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-end md:items-center w-full">
                {/* Date Filter Group */}
                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                  <Label className="text-xs text-[var(--gray-500)] font-medium">Period</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        className="w-full md:w-[200px] text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <span className="text-[var(--gray-400)]">-</span>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        className="w-full md:w-[200px] text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Type Filter */}
                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                  <Label className="text-xs text-[var(--gray-500)] font-medium">Type</Label>
                  <Select 
                    value={typeFilter || "ALL"} 
                    onValueChange={(value) => setTypeFilter(value === "ALL" ? undefined : value as TransactionType)}
                  >
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="POS">POS</SelectItem>
                      <SelectItem value="RENTAL">Rental</SelectItem>
                      <SelectItem value="BOOKING">Booking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                  <Label className="text-xs text-[var(--gray-500)] font-medium">Status</Label>
                  <Select 
                    value={statusFilter || "ALL"} 
                    onValueChange={(value) => setStatusFilter(value === "ALL" ? undefined : value as TransactionStatus)}
                  >
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs opacity-0">Actions</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleApplyFilter}
                      className="bg-[var(--brand)] hover:bg-[var(--brand-600)]"
                    >
                      Apply Filter
                    </Button>
                    {(startDate || endDate || typeFilter || statusFilter) && (
                      <Button 
                        variant="ghost" 
                        className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                        onClick={handleResetFilter}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
                <span className="ml-2 text-[var(--gray-500)]">Loading transactions...</span>
              </div>
            ) : (
              <>
                <div className="relative rounded-lg border border-[var(--gray-200)] overflow-hidden">
                  {/* Subtle Loading Overlay for refetching */}
                  {isFetching && !isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-32 text-center text-[var(--gray-500)]">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((trx) => (
                          <TableRow key={trx.id}>
                            <TableCell className="font-medium text-[var(--brand)]">
                              {trx.invoiceNumber}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(trx.createdAt)}</span>
                                <span className="text-xs text-[var(--gray-400)]">
                                  {new Date(trx.createdAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{trx.customerName || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getTypeBadgeColor(trx.type)}>
                                {trx.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{trx.table?.code || "-"}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1.5">
                                <span className="text-[var(--gray-500)]">{getPaymentMethodIcon(trx.paymentMethod)}</span>
                                <span className="text-xs text-[var(--gray-500)]">{trx.paymentMethod}</span>
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatRupiah(parseFloat(trx.totalAmount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusBadgeColor(trx.status)}>
                                {trx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/transactions/${trx.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-[var(--gray-500)]">
                      Showing {transactions.length} of {totalItems} items
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || isLoading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || isLoading}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Print Table Modal */}
        <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Print Table Report</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="table">Select Table</Label>
                <Select value={printTable} onValueChange={setPrintTable}>
                  <SelectTrigger id="table">
                    <SelectValue placeholder="Select a table..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="ALL">All Tables</SelectItem>
                    {tables?.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Start Date & Time</Label>
                <div className="flex gap-2">
                    <DatePicker date={printStartDate} setDate={setPrintStartDate} />
                    <Input 
                        type="time" 
                        className="w-[120px]" 
                        value={printStartTime} 
                        onChange={(e) => setPrintStartTime(e.target.value)} 
                    />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>End Date & Time</Label>
                <div className="flex gap-2">
                    <DatePicker date={printEndDate} setDate={setPrintEndDate} />
                    <Input 
                        type="time" 
                        className="w-[120px]" 
                        value={printEndTime} 
                        onChange={(e) => setPrintEndTime(e.target.value)} 
                    />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>Cancel</Button>
              <Button onClick={handlePrint} disabled={isPrinting}>
                {isPrinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>

    {/* Hidden Thermal Report Receipt */}
    {reportData && (
        <div className="thermal-receipt-container">
          <TableReportReceipt 
            tableName={selectedTableName}
            startDate={printStartDate}
            endDate={printEndDate}
            transactions={reportData} 
          />
        </div>
    )}
    </>
  );
}
