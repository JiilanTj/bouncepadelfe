"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Inventory, InventoryAdjustment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";

interface InventoryHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: Inventory | null;
  adjustments: InventoryAdjustment[] | undefined;
  isLoading: boolean;
}

export function InventoryHistoryDialog({
  open,
  onOpenChange,
  inventory,
  adjustments,
  isLoading,
}: InventoryHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock History - {inventory?.name}</DialogTitle>
          <DialogDescription>Adjustment audit trail</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ) : !adjustments || adjustments.length === 0 ? (
            <p className="text-center text-[var(--gray-500)] py-8">
              No adjustment history found
            </p>
          ) : (
            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        adj.changeType === "ADD"
                          ? "bg-[var(--success-bg)] text-[var(--status-success)]"
                          : adj.changeType === "REMOVE"
                          ? "bg-[var(--danger-bg)] text-[var(--status-danger)]"
                          : "bg-[var(--info-bg)] text-[var(--status-info)]"
                      }`}
                    >
                      {adj.changeType === "ADD" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : adj.changeType === "REMOVE" ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {adj.changeType} {Math.abs(adj.changeAmount)}{" "}
                        {inventory?.unit}
                      </p>
                      <p className="text-xs text-[var(--gray-500)]">
                        {adj.reason}
                      </p>
                      <p className="text-xs text-[var(--gray-400)]">
                        By {adj.creator?.name || "Unknown"} •{" "}
                        {formatDate(adj.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {adj.quantityBefore} → {adj.quantityAfter}
                    </p>
                    <p className="text-xs text-[var(--gray-400)]">Qty changed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
