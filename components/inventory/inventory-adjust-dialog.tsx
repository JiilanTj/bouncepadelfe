"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Inventory, AdjustInventoryInput, InventoryChangeType } from "@/lib/types";

interface InventoryAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: Inventory | null;
  onSubmit: (data: AdjustInventoryInput) => Promise<void>;
  isSubmitting: boolean;
}

export function InventoryAdjustDialog({
  open,
  onOpenChange,
  inventory,
  onSubmit,
  isSubmitting,
}: InventoryAdjustDialogProps) {
  const [adjustData, setAdjustData] = useState<AdjustInventoryInput>({
    changeType: "ADD",
    amount: 1,
    reason: "",
  });

  /* State resets on remount via key prop in parent */

  const handleSubmit = async () => {
    if (!adjustData.reason.trim()) {
      toast.error("Reason is required");
      return;
    }
    if (adjustData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    await onSubmit(adjustData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock - {inventory?.name}</DialogTitle>
          <DialogDescription>
            Current quantity:{" "}
            <strong>
              {inventory?.quantity} {inventory?.unit}
            </strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Change Type <span className="text-[var(--status-danger)]">*</span>
            </Label>
            <Select
              value={adjustData.changeType}
              onValueChange={(v) =>
                setAdjustData({
                  ...adjustData,
                  changeType: v as InventoryChangeType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADD">➕ Add Stock</SelectItem>
                <SelectItem value="REMOVE">➖ Remove Stock</SelectItem>
                <SelectItem value="CORRECTION">
                  ✏️ Correction (Set exact)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              Amount <span className="text-[var(--status-danger)]">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              value={adjustData.amount}
              onChange={(e) =>
                setAdjustData({
                  ...adjustData,
                  amount: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>
              Reason <span className="text-[var(--status-danger)]">*</span>
            </Label>
            <Input
              value={adjustData.reason}
              onChange={(e) =>
                setAdjustData({ ...adjustData, reason: e.target.value })
              }
              placeholder="e.g., New purchase, Broken, Stock opname"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Confirm Adjustment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
