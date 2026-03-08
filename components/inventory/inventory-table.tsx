"use client";

import Image from "next/image";
import { Inventory, InventoryType, InventoryCondition, InventoryStatus } from "@/lib/types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  History,
  Trash2,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  Wrench,
  X,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

interface InventoryTableProps {
  data: Inventory[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (inventory: Inventory) => void;
  onAdjustStock: (inventory: Inventory) => void;
  onViewHistory: (inventory: Inventory) => void;
  onDispose: (inventory: Inventory) => void;
  isDisposePending?: boolean;
}

export function InventoryTable({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onAdjustStock,
  onViewHistory,
  onDispose,
  isDisposePending = false,
}: InventoryTableProps) {
  const { user } = useAuth();
  const canManageStatus = user?.role === "OWNER" || user?.role === "ADMIN";

  const getTypeBadge = (type: InventoryType) => {
    if (type === "ASSET") {
      return (
        <Badge className="bg-[var(--info-bg)] text-[var(--status-info)] border-[var(--info-border)]">
          <Package className="w-3 h-3 mr-1" />
          Asset
        </Badge>
      );
    }
    return (
      <Badge className="bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]">
        <TrendingDown className="w-3 h-3 mr-1" />
        Consumable
      </Badge>
    );
  };

  const getConditionBadge = (condition: InventoryCondition) => {
    switch (condition) {
      case "GOOD":
        return (
          <Badge className="bg-[var(--success-bg)] text-[var(--status-success)] border-[var(--success-border)]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Good
          </Badge>
        );
      case "DAMAGED":
        return (
          <Badge className="bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]">
            <AlertCircle className="w-3 h-3 mr-1" />
            Damaged
          </Badge>
        );
      case "NEED_REPAIR":
        return (
          <Badge className="bg-[var(--info-bg)] text-[var(--status-info)] border-[var(--info-border)]">
            <Wrench className="w-3 h-3 mr-1" />
            Need Repair
          </Badge>
        );
      case "BROKEN":
        return (
          <Badge className="bg-[var(--danger-bg)] text-[var(--status-danger)] border-[var(--danger-border)]">
            <X className="w-3 h-3 mr-1" />
            Broken
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--status-success)]"
          >
            Active
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge
            variant="outline"
            className="border-[var(--gray-200)] bg-[var(--gray-100)] text-[var(--gray-500)]"
          >
            Inactive
          </Badge>
        );
      case "DISPOSED":
        return (
          <Badge
            variant="outline"
            className="border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--status-danger)]"
          >
            Disposed
          </Badge>
        );
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[var(--brand)]" />
          <CardTitle className="text-lg font-semibold">Inventory List</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-[var(--gray-200)]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-32 text-center text-[var(--gray-500)]"
                      >
                        No inventory found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.imageUrl ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-[var(--gray-100)]">
                              <ImageIcon className="h-5 w-5 text-[var(--gray-400)]" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] truncate">
                          {item.name}
                        </TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>{getConditionBadge(item.condition)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-[var(--gray-500)]">
                          {item.location || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onEdit(item)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onAdjustStock(item)}
                                className="cursor-pointer"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onViewHistory(item)}
                                className="cursor-pointer"
                              >
                                <History className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                              {canManageStatus && item.status !== "DISPOSED" && (
                                <DropdownMenuItem
                                  onClick={() => onDispose(item)}
                                  className="cursor-pointer text-[var(--status-danger)]"
                                  disabled={isDisposePending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Dispose
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm text-[var(--gray-500)]">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
