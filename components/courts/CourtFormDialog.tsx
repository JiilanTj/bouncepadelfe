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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Court, CourtType, CourtStatus } from "@/lib/types/courts.types";
import {
  useCreateCourtMutation,
  useUpdateCourtMutation,
} from "@/lib/hooks/useCourts";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";

// ------------------------------------------------------------------------------
// Internal Form Component
// ------------------------------------------------------------------------------

interface CourtFormProps {
  court?: Court | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function CourtForm({ court, onSuccess, onCancel }: CourtFormProps) {
  const isEdit = !!court;
  const createMutation = useCreateCourtMutation();
  const updateMutation = useUpdateCourtMutation();

  const [name, setName] = useState(court?.name || "");
  const [type, setType] = useState<CourtType>(court?.type || CourtType.INDOOR);
  const [surface, setSurface] = useState(court?.surface || "Synthetic Grass");
  const [status, setStatus] = useState<CourtStatus>(court?.status || CourtStatus.ACTIVE);
  const [pricePerHour, setPricePerHour] = useState<number>(
    court ? parseInt(court.pricePerHour) : 150000
  );
  const [ayoFieldId, setAyoFieldId] = useState(court?.ayoFieldId || "");
  const [isVisible, setIsVisible] = useState(court?.isVisible ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    court?.imageUrl || null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (pricePerHour <= 0) newErrors.price = "Price must be positive";
    if (!isEdit && !selectedFile) newErrors.image = "Image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name,
      type,
      surface,
      status,
      price_per_hour: pricePerHour,
      ayo_field_id: ayoFieldId || undefined,
      is_visible: isVisible,
      image: selectedFile || undefined,
    };

    try {
      if (isEdit && court) {
        await updateMutation.mutateAsync({
          id: court.id,
          data: data,
        });
      } else {
        await createMutation.mutateAsync({
            ...data,
            image: selectedFile!, // File is guaranteed by validate()
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="name">Court Name</Label>
        <Input
          id="name"
          placeholder="e.g. Center Court"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Court Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as CourtType)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CourtType.INDOOR}>Indoor</SelectItem>
              <SelectItem value={CourtType.OUTDOOR}>Outdoor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CourtStatus)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CourtStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={CourtStatus.MAINTENANCE}>Maintenance</SelectItem>
              <SelectItem value={CourtStatus.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="surface">Surface Type</Label>
          <Input
            id="surface"
            placeholder="e.g. Synthetic Grass"
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price per Hour (Rp)</Label>
          <Input
            id="price"
            type="number"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(parseInt(e.target.value) || 0)}
          />
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ayoFieldId">Ayo Field ID (Optional)</Label>
        <Input
          id="ayoFieldId"
          placeholder="External booking ID"
          value={ayoFieldId}
          onChange={(e) => setAyoFieldId(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Court Image {isEdit ? "(Optional)" : "(Required)"}</Label>
        <div className="flex flex-col gap-4">
          {previewUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-md border shadow-inner">
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
                    setPreviewUrl(court?.imageUrl || null);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
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
              id="court-image-upload"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => document.getElementById("court-image-upload")?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm">
                  {selectedFile ? selectedFile.name : "Click to upload image"}
                </span>
              </div>
            </Button>
          </div>
          {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
        <div className="space-y-0.5">
          <Label htmlFor="isVisible">Visibility</Label>
          <p className="text-xs text-muted-foreground">
            Display this court on public pages
          </p>
        </div>
        <Switch
          id="isVisible"
          checked={isVisible}
          onCheckedChange={setIsVisible}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background py-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[100px]">
          {isPending ? "Saving..." : "Save Court"}
        </Button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------------------------
// Dialog Component
// ------------------------------------------------------------------------------

interface CourtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court?: Court | null; 
}

export function CourtFormDialog({
  open,
  onOpenChange,
  court,
}: CourtFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{court ? "Edit Court Details" : "Add New Padel Court"}</DialogTitle>
        </DialogHeader>
        <CourtForm
          key={court?.id || "new"}
          court={court}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
