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
import { useDeleteFacilityMutation } from "@/lib/hooks/useFacilities";

interface FacilityDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: { id: string; name: string } | null;
}

export function FacilityDeleteDialog({
  open,
  onOpenChange,
  facility,
}: FacilityDeleteDialogProps) {
  const deleteMutation = useDeleteFacilityMutation();

  const handleDelete = async () => {
    if (facility) {
      await deleteMutation.mutateAsync(facility.id);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the facility
            <span className="font-semibold text-foreground">
              {" "}
              &quot;{facility?.name}&quot;
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
