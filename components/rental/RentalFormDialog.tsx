"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Clock, Info, Banknote, Calendar, User } from "lucide-react";

const getCalculatedReturnTime = (value: string, unit: "hours" | "days") => {
  if (!value || isNaN(parseFloat(value))) return "";
  const val = parseFloat(value);
  const date = new Date();
  if (unit === "hours") {
    date.setHours(date.getHours() + val);
  } else {
    date.setDate(date.getDate() + val);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface RentalFormDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    expectedReturnAt: string;
    depositAmount: number;
    notes: string;
    quantity: number;
  }) => void;
  isLoading?: boolean;
}

export function RentalFormDialog({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: RentalFormDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [durationValue, setDurationValue] = useState<string>("1");
  const [durationUnit, setDurationUnit] = useState<"hours" | "days">("hours");
  const [expectedReturnAt, setExpectedReturnAt] = useState(
    getCalculatedReturnTime("1", "hours")
  );
  const [depositAmount, setDepositAmount] = useState("");
  const [notes, setNotes] = useState("");

  // No useEffect needed for sync, we handle it in change handlers

  const handleDurationValueChange = (val: string) => {
    setDurationValue(val);
    setExpectedReturnAt(getCalculatedReturnTime(val, durationUnit));
  };

  const handleDurationUnitChange = (unit: "hours" | "days") => {
    setDurationUnit(unit);
    setExpectedReturnAt(getCalculatedReturnTime(durationValue, unit));
  };

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      customerName,
      quantity,
      expectedReturnAt: expectedReturnAt ? new Date(expectedReturnAt).toISOString() : "",
      depositAmount: parseFloat(depositAmount) || 0,
      notes,
    });
  };

  const totalPrice = parseFloat(product.price) * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--brand)]" />
            Rent {product.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Customer Name
            </Label>
            <Input
              id="customerName"
              placeholder="Enter customer name..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="rounded-lg bg-[var(--gray-50)] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray-500)]">Unit Price</span>
              <span className="font-medium text-[var(--gray-900)]">
                {formatRupiah(parseFloat(product.price))}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span className="text-[var(--gray-900)]">Total Price</span>
              <span className="text-[var(--brand)]">{formatRupiah(totalPrice)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
              <p className="text-[10px] text-[var(--gray-400)]">
                Available stock: {product.stock} units
              </p>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                <Input
                  className="w-20"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={durationValue}
                  onChange={(e) => handleDurationValueChange(e.target.value)}
                />
                <Select
                  value={durationUnit}
                  onValueChange={(val: "hours" | "days") => handleDurationUnitChange(val)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnDate" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Return Date & Time
            </Label>
            <Input
              id="returnDate"
              type="datetime-local"
              value={expectedReturnAt}
              onChange={(e) => setExpectedReturnAt(e.target.value)}
              required
            />
            <p className="text-[10px] text-[var(--gray-400)]">
              Automatically calculated based on duration
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit" className="flex items-center gap-1">
              <Banknote className="h-3 w-3" />
              Deposit Amount
            </Label>
            <Input
              id="deposit"
              type="number"
              placeholder="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Condition / Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Describe item condition..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white"
              disabled={isLoading || !expectedReturnAt}
            >
              {isLoading ? "Processing..." : "Confirm Rental"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
