"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryType, InventoryCondition, InventoryStatus } from "@/lib/types";
import { Search, Plus } from "lucide-react";

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: InventoryType | undefined;
  onTypeFilterChange: (value: InventoryType | undefined) => void;
  conditionFilter: InventoryCondition | undefined;
  onConditionFilterChange: (value: InventoryCondition | undefined) => void;
  statusFilter: InventoryStatus | undefined;
  onStatusFilterChange: (value: InventoryStatus | undefined) => void;
  onAddClick: () => void;
  addButtonDisabled?: boolean;
}

export function InventoryFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  conditionFilter,
  onConditionFilterChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
  addButtonDisabled = false,
}: InventoryFiltersProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
              <Input
                placeholder="Search inventory..."
                className="pl-10"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Select
              value={typeFilter || "all"}
              onValueChange={(v) =>
                onTypeFilterChange(v === "all" ? undefined : (v as InventoryType))
              }
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ASSET">Asset</SelectItem>
                <SelectItem value="CONSUMABLE">Consumable</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={conditionFilter || "all"}
              onValueChange={(v) =>
                onConditionFilterChange(
                  v === "all" ? undefined : (v as InventoryCondition)
                )
              }
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="NEED_REPAIR">Need Repair</SelectItem>
                <SelectItem value="BROKEN">Broken</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter || "all"}
              onValueChange={(v) =>
                onStatusFilterChange(
                  v === "all" ? undefined : (v as InventoryStatus)
                )
              }
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DISPOSED">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={onAddClick}
            className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
            disabled={addButtonDisabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
