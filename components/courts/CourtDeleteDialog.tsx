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
import { useDeleteCourtMutation } from "@/lib/hooks/useCourts";
import { toast } from "sonner";

interface CourtDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court: { id: string; name: string } | null;
}

export function CourtDeleteDialog({
  open,
  onOpenChange,
  court,
}: CourtDeleteDialogProps) {
  const deleteMutation = useDeleteCourtMutation();

  const handleDelete = async () => {
    if (court) {
      try {
        await deleteMutation.mutateAsync(court.id);
        onOpenChange(false);
      } catch (error) {
        console.error("Delete court error:", error);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Delete Court</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground italic">&quot;{court?.name}&quot;</span>? 
            <br /><br />
            This will perform a <span className="font-bold">soft delete</span>: the court will no longer be visible to customers or available for booking, but its history will remain in the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
