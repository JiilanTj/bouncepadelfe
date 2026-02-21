"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isDeleting: boolean;
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isDeleting,
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[var(--status-danger)]">
            <Trash2 className="h-5 w-5" />
            Deactivate Category
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate <span className="font-semibold text-[var(--gray-900)]">&quot;{categoryName}&quot;</span>? 
            This action can be redo later. The category will be deactivated and removed from the active list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-[var(--status-danger)] text-white hover:bg-[var(--status-danger-dark)]"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deactivating...
              </>
            ) : (
              "Deactivate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
