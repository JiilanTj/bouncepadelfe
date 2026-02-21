"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Inventory } from "@/lib/types";

interface InventoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: Inventory | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function InventoryDeleteDialog({
  open,
  onOpenChange,
  inventory,
  onConfirm,
  isDeleting,
}: InventoryDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispose Inventory</DialogTitle>
        </DialogHeader>
        <p className="text-[var(--gray-600)]">
          Are you sure you want to dispose <strong>{inventory?.name}</strong>?
        </p>
        <p className="text-sm text-[var(--gray-500)]">
          This will mark the item as DISPOSED and remove it from active inventory.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[var(--status-danger)] hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Dispose"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
