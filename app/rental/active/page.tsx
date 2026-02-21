"use client";

import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useTransactions,
  useCompleteTransaction,
} from "@/lib/hooks/queries";
import { formatRupiah } from "@/lib/utils";
import { RotateCcw, Clock, Loader2, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { RentalDetailDialog } from "@/components/rental/RentalDetailDialog";
import { useState } from "react";
import { Transaction } from "@/lib/types";

export default function ActiveRentalsPage() {
  const [selectedRental, setSelectedRental] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch active rentals (Transaction Type RENTAL, Status PAID)
  const { data: activeRentalsData, isLoading: isLoadingActiveRentals } = useTransactions({
    type: "RENTAL",
    status: "PAID",
  });

  const completeTransaction = useCompleteTransaction();
  const activeRentals = activeRentalsData?.data ?? [];

  const handleReturn = async (transactionId: string) => {
    try {
      await completeTransaction.mutateAsync(transactionId);
      toast.success("Item returned successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to return item");
    }
  };

  const handleViewDetail = (rental: Transaction) => {
    setSelectedRental(rental);
    setIsDetailOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/rental">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-[var(--gray-900)]">Active Rentals</h2>
              <p className="text-sm text-[var(--gray-500)]">Manage and track items currently being rented</p>
            </div>
          </div>
        </div>

        {/* Active Rentals Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--status-info)]" />
              Rented Items List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActiveRentals ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
              </div>
            ) : activeRentals.length === 0 ? (
              <div className="py-12 text-center text-[var(--gray-400)]">
                <Clock className="mx-auto h-16 w-16 opacity-20 mb-4" />
                <p className="text-lg font-medium">No active rentals found</p>
                <p className="text-sm">Start a new rental from the catalog page.</p>
                <Button className="mt-6 bg-[var(--brand)]" asChild>
                   <Link href="/rental">Go to Catalog</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-mono text-xs">{rental.invoiceNumber}</TableCell>
                      <TableCell>{rental.customerName || "Anonymous"}</TableCell>
                      <TableCell>
                        {rental.items?.map(item => (
                          <div key={item.id} className="text-xs">
                            {item.quantity}x {item.product?.name}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>{formatRupiah(parseFloat(rental.depositAmount))}</TableCell>
                      <TableCell>
                        {rental.items?.[0]?.expectedReturnAt ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-[var(--status-info)]">
                              {formatDate(rental.items[0].expectedReturnAt)}
                            </span>
                            <span className="text-[10px] text-[var(--gray-400)]">
                              {formatTime(rental.items[0].expectedReturnAt)}
                            </span>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
                            onClick={() => handleViewDetail(rental)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[var(--info-border)] text-[var(--status-info)] hover:bg-[var(--info-bg)]"
                            onClick={() => handleReturn(rental.id)}
                            disabled={completeTransaction.isPending}
                          >
                            {completeTransaction.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><RotateCcw className="mr-2 h-4 w-4" /> Return</>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <RentalDetailDialog
        rental={selectedRental}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRental(null);
        }}
      />
    </MainLayout>
  );
}
