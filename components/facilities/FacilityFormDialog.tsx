"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Facility } from "@/lib/types/facilities.types";
import {
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
} from "@/lib/hooks/useFacilities";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";

// ------------------------------------------------------------------------------
// Internal Form Component
// ------------------------------------------------------------------------------

interface FacilityFormProps {
  facility?: Facility | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function FacilityForm({ facility, onSuccess, onCancel }: FacilityFormProps) {
  const isEdit = !!facility;
  const createMutation = useCreateFacilityMutation();
  const updateMutation = useUpdateFacilityMutation();

  // Initialize state directly from props (no useEffect needed)
  const [name, setName] = useState(facility?.name || "");
  const [description, setDescription] = useState(facility?.description || "");
  const [icon, setIcon] = useState(facility?.icon || "");
  const [displayOrder, setDisplayOrder] = useState<number>(
    facility?.displayOrder ?? 0
  );
  const [isVisible, setIsVisible] = useState(facility?.isVisible ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    facility?.imageUrl || null
  );
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { name?: string; image?: string } = {};
    if (!name.trim() || name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!isEdit && !selectedFile) {
      newErrors.image = "Image is required for new facilities";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit && facility) {
        await updateMutation.mutateAsync({
          id: facility.id,
          data: {
            name,
            description,
            icon,
            displayOrder,
            isVisible,
            image: selectedFile || undefined,
          },
        });
      } else {
        if (!selectedFile) return;
        await createMutation.mutateAsync({
          name,
          description,
          icon,
          displayOrder,
          isVisible,
          image: selectedFile,
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Shower Room"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Image {isEdit ? "(Optional)" : "(Required)"}</Label>
        <div className="flex flex-col gap-4">
          {previewUrl && (
            <div className="relative h-40 w-full overflow-hidden rounded-md border">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFile(null);
                    setPreviewUrl(facility?.imageUrl || null);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="image-upload"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {selectedFile ? "Change Image" : "Select Image"}
            </Button>
          </div>
          {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Icon (Optional)</Label>
          <Input
            id="icon"
            placeholder="lucide icon name"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Facility description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <Label htmlFor="isVisible">Visible</Label>
          <p className="text-sm text-muted-foreground">
            Show this facility on public page
          </p>
        </div>
        <Switch
          id="isVisible"
          checked={isVisible}
          onCheckedChange={setIsVisible}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------------------------
// Dialog Component
// ------------------------------------------------------------------------------

interface FacilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility?: Facility | null; // If null, it's create mode
}

export function FacilityFormDialog({
  open,
  onOpenChange,
  facility,
}: FacilityFormDialogProps) {
  const isEdit = !!facility;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Facility" : "Add New Facility"}</DialogTitle>
        </DialogHeader>
        {/* Force mount/unmount when facility changes to reset state */}
        <FacilityForm
          key={facility?.id || "new"}
          facility={facility}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
