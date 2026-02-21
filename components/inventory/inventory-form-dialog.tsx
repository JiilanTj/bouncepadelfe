"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { X, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Inventory,
  InventoryType,
  InventoryCondition,
  InventoryStatus,
  CreateInventoryInput,
  UpdateInventoryInput,
} from "@/lib/types";

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInventory: Inventory | null;
  onSubmit: (data: CreateInventoryInput | UpdateInventoryInput) => Promise<void>;
  isSubmitting: boolean;
}

interface FormData {
  name: string;
  description: string;
  type: InventoryType;
  quantity: string;
  unit: string;
  condition: InventoryCondition;
  status: InventoryStatus;
  owner_name: string;
  purchase_date: string;
  purchase_price: string;
  location: string;
  notes: string;
}

const defaultFormData: FormData = {
  name: "",
  description: "",
  type: "ASSET",
  quantity: "0",
  unit: "pcs",
  condition: "GOOD",
  status: "ACTIVE",
  owner_name: "",
  purchase_date: "",
  purchase_price: "",
  location: "",
  notes: "",
};

export function InventoryFormDialog({
  open,
  onOpenChange,
  editingInventory,
  onSubmit,
  isSubmitting,
}: InventoryFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    if (editingInventory) {
      return {
        name: editingInventory.name,
        description: editingInventory.description || "",
        type: editingInventory.type,
        quantity: String(editingInventory.quantity),
        unit: editingInventory.unit || "pcs",
        condition: editingInventory.condition,
        status: editingInventory.status,
        owner_name: editingInventory.ownerName || "",
        purchase_date: editingInventory.purchaseDate
          ? editingInventory.purchaseDate.split("T")[0]
          : "",
        purchase_price: editingInventory.purchasePrice || "",
        location: editingInventory.location || "",
        notes: editingInventory.notes || "",
      };
    }
    return defaultFormData;
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingInventory?.imageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        )
      ) {
        toast.error("Only JPG, PNG, WebP, and GIF images are allowed");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const quantityNum = parseInt(formData.quantity) || 0;
    const purchasePriceNum = formData.purchase_price
      ? parseFloat(formData.purchase_price)
      : undefined;

    const submitData: CreateInventoryInput = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      quantity: quantityNum,
      unit: formData.unit || undefined,
      condition: formData.condition,
      status: formData.status,
      owner_name: formData.owner_name || undefined,
      purchase_date: formData.purchase_date
        ? new Date(formData.purchase_date).toISOString()
        : undefined,
      purchase_price: purchasePriceNum,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
      image: imageFile || undefined,
    };

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingInventory ? "Edit Inventory" : "Add New Inventory"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>
                Name <span className="text-[var(--status-danger)]">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Type <span className="text-[var(--status-danger)]">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v as InventoryType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSET">Asset</SelectItem>
                  <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Condition <span className="text-[var(--status-danger)]">*</span>
              </Label>
              <Select
                value={formData.condition}
                onValueChange={(v) =>
                  setFormData({ ...formData, condition: v as InventoryCondition })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="DAMAGED">Damaged</SelectItem>
                  <SelectItem value="NEED_REPAIR">Need Repair</SelectItem>
                  <SelectItem value="BROKEN">Broken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Status <span className="text-[var(--status-danger)]">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as InventoryStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Quantity</Label>
              <Input
                type="number"
                min={0}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
                disabled={!!editingInventory}
              />
              {editingInventory && (
                <p className="text-xs text-[var(--gray-400)]">
                  Use Adjust Stock to change quantity
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="pcs, kg, liter, box"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Storage A, Warehouse B"
              />
            </div>
            <div className="space-y-2">
              <Label>Owner Name</Label>
              <Input
                value={formData.owner_name}
                onChange={(e) =>
                  setFormData({ ...formData, owner_name: e.target.value })
                }
                placeholder="Bounce Padel"
              />
            </div>
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Purchase Price (IDR)</Label>
              <Input
                type="number"
                min={0}
                value={formData.purchase_price}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_price: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Inventory Image</Label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative h-[120px] w-[120px]">
                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-[120px] w-[120px] items-center justify-center rounded-lg border-2 border-dashed border-[var(--gray-200)] bg-[var(--gray-50)]">
                    <ImageIcon className="h-8 w-8 text-[var(--gray-400)]" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="mt-2 text-xs text-[var(--gray-500)]">
                    Max file size: 5MB. Supported: JPG, PNG, WebP, GIF
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : editingInventory ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
